// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// The business rules for appointments. Views only call the public methods below:
//   all(filters) · forPatient(id) · nextFor(patientId) · freeSlots(doctorId, date)
//   book(patientId, doctorId, date, time) · reschedule(id, date, time) · cancel(id, reason) · complete(id)
//   details(appointment) · feeFor(doctorId)
// ABSTRACTION: where appointments are stored, how clashes are found and which rules apply is hidden
// behind these methods (everything else is #private). Callers get Appointment objects, never the store.
// Dependencies: DataStore (shared lists), the doctor model's isAvailable(date) (Rodina), isoDate() from sampleData.

import DataStore from '../store/DataStore.js';
import { isoDate } from '../store/sampleData.js';
import Appointment from '../models/Appointment.js';
import InvalidInputError from '../errors/InvalidInputError.js';
import SlotUnavailableError from '../errors/SlotUnavailableError.js';
import DoctorUnavailableError from '../errors/DoctorUnavailableError.js';

export default class AppointmentController {
  #store;
  #now;

  /** @param {DataStore} store shared store @param {Function} now clock provider (injectable for tests) */
  constructor(store = DataStore.instance, now = () => new Date()) {
    this.#store = store;
    this.#now = now;
  }

  #today() {
    const now = this.#now();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${mm}-${dd}`;
  }

  // =====================================================================
  //  Reading
  // =====================================================================

  /**
   * Appointments, oldest first.
   * @param {{doctorId?: string, date?: string, patientId?: string, status?: string}} filters empty or 'all' = no filter
   * @returns {Appointment[]} a new array every time (changing it does not change the store)
   */
  all({ doctorId, date, patientId, status } = {}) {
    const wanted = (value) => value && value !== 'all';
    return this.#store.appointments
      .filter((a) => (!wanted(doctorId) || a.doctorId === doctorId)
        && (!wanted(date) || a.date === date)
        && (!wanted(patientId) || a.patientId === patientId)
        && (!wanted(status) || a.status === status))
      .sort((a, b) => a.when.localeCompare(b.when));
  }

  /** One patient's appointments, oldest first. */
  forPatient(id) {
    return this.all({ patientId: id });
  }

  /** The patient's next scheduled appointment (today or later), or null. */
  nextFor(patientId) {
    const today = isoDate(0);
    return this.forPatient(patientId).find((a) => a.isUpcoming(today)) || null;
  }

  /**
   * The 8 slots of one doctor on one day.
   * @returns {{time: string, free: boolean, reason: string}[]}  reason is '' when free, otherwise
   *          'Booked', 'Doctor not available' or 'Past date'.
   *          A cancelled visit frees its slot; a scheduled or completed visit keeps it taken.
   * @throws {InvalidInputError} unknown doctor or a date that is not a real day
   */
  freeSlots(doctorId, date) {
    const doctor = this.#doctor(doctorId);
    const day = Appointment.checkDate(date);
    const past = day < this.#today();
    const off = this.#isOff(doctor, day);
    return Appointment.SLOTS.map((time) => {
      if (past) return { time, free: false, reason: 'Past date' };
      if (off) return { time, free: false, reason: 'Doctor not available' };
      const taken = this.#doctorHas(doctorId, day, time);
      return { time, free: !taken, reason: taken ? 'Booked' : '' };
    });
  }

  /** The doctor's fee in EGP (0 when the doctor is unknown). */
  feeFor(doctorId) {
    const doctor = this.#store.findDoctor(doctorId);
    if (!doctor) return 0;
    return Number(doctor.calculateFee?.() ?? doctor.fee ?? doctor.baseFee ?? 0);
  }

  /** Everything a screen needs to show one appointment, so views never look into other lists. */
  details(appointmentOrId) {
    const appointment = typeof appointmentOrId === 'string' ? this.#find(appointmentOrId) : appointmentOrId;
    const doctor = this.#store.findDoctor(appointment.doctorId);
    const patient = this.#store.findPatient(appointment.patientId);
    return {
      appointment,
      doctorName: doctor?.name ?? '(unknown doctor)',
      department: doctor?.department ?? '',
      patientName: patient?.name ?? '(deleted patient)',
      fee: this.feeFor(appointment.doctorId),
    };
  }

  // =====================================================================
  //  Changing
  // =====================================================================

  /**
   * Book a visit.
   * @throws {InvalidInputError}        unknown patient / doctor, bad date, date in the past, bad time
   * @throws {DoctorUnavailableError}   the doctor is off that day
   * @throws {SlotUnavailableError}     the doctor or the patient already has a visit at that time
   * @returns {Appointment} the new appointment
   */
  book(patientId, doctorId, date, time) {
    this.#assertBookable(patientId, doctorId, date, time);
    const appointment = new Appointment({ id: this.#store.nextId('a'), patientId, doctorId, date, time });
    this.#store.appointments.push(appointment);
    return appointment;
  }

  /** Move a scheduled visit to another day/time, with exactly the same rules as book(). */
  reschedule(id, date, time) {
    const appointment = this.#find(id);
    if (!appointment.isScheduled) throw new InvalidInputError('Only a scheduled appointment can be rescheduled.');
    this.#assertBookable(appointment.patientId, appointment.doctorId, date, time, appointment.id);
    return appointment.reschedule(date, time);
  }

  /** Cancel a scheduled visit and remember why (the patient sees the reason). */
  cancel(id, reason) {
    return this.#find(id).cancel(reason);
  }

  /** Mark a scheduled visit as done (it then waits for a medical report). */
  complete(id) {
    return this.#find(id).complete();
  }

  // =====================================================================
  //  Private helpers
  // =====================================================================

  #find(id) {
    const appointment = this.#store.findAppointment(id);
    if (!appointment) throw new InvalidInputError('This appointment no longer exists.');
    return appointment;
  }

  #doctor(id) {
    const doctor = this.#store.findDoctor(id);
    if (!doctor) throw new InvalidInputError('Please choose a doctor.');
    return doctor;
  }

  #isOff(doctor, day) {
    return typeof doctor.isAvailable === 'function' ? !doctor.isAvailable(day) : false;
  }

  /** Does this doctor already have a visit at that time? Cancelled visits do not count. (ignoreId = the visit being moved) */
  #doctorHas(doctorId, date, time, ignoreId = null) {
    return this.#store.appointments.some((a) => !a.isCancelled && a.id !== ignoreId
      && a.doctorId === doctorId && a.date === date && a.time === time);
  }

  #patientHas(patientId, date, time, ignoreId = null) {
    return this.#store.appointments.some((a) => !a.isCancelled && a.id !== ignoreId
      && a.patientId === patientId && a.date === date && a.time === time);
  }

  /** All booking rules in one place, shared by book() and reschedule(). */
  #assertBookable(patientId, doctorId, date, time, ignoreId = null) {
    if (!this.#store.findPatient(patientId)) throw new InvalidInputError('Please choose a patient.');
    const doctor = this.#doctor(doctorId);
    const day = Appointment.checkDate(date);
    const slot = Appointment.checkTime(time);
    if (day < this.#today()) throw new InvalidInputError('You cannot book a date in the past.');
    if (this.#isOff(doctor, day)) {
      throw new DoctorUnavailableError(`${doctor.name} is not available on this day. Please choose another date.`);
    }
    if (this.#doctorHas(doctorId, day, slot, ignoreId)) {
      throw new SlotUnavailableError(`${doctor.name} is already booked at ${slot}. Please choose another time.`, 'doctor');
    }
    if (this.#patientHas(patientId, day, slot, ignoreId)) {
      throw new SlotUnavailableError(`You already have another appointment at ${slot} on this day. Please choose another time.`, 'patient');
    }
  }
}
