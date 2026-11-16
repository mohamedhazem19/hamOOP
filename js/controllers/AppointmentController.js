// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Week-1 starter from the Team Leader: works with sample data.
// TODO(Malak): finish the booking rules marked below.

import DataStore from '../store/DataStore.js';
import Appointment from '../models/Appointment.js';
import SlotUnavailableError from '../errors/SlotUnavailableError.js';
import DoctorUnavailableError from '../errors/DoctorUnavailableError.js';
import InvalidInputError from '../errors/InvalidInputError.js';
import { isoDate } from '../store/sampleData.js';

const byDateTime = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);

export default class AppointmentController {
  constructor() {
    this.store = DataStore.instance;
  }

  /** all({ doctorId, date, patientId, status }) – every filter is optional. */
  all(filters = {}) {
    return this.store.appointments
      .filter((a) => Object.entries(filters).every(([k, v]) => v == null || v === '' || a[k] === v))
      .sort(byDateTime);
  }

  forPatient(patientId) { return this.all({ patientId }); }

  /** The patient's next scheduled appointment from today on, or null. */
  nextFor(patientId) {
    const today = isoDate(0);
    return this.forPatient(patientId).find((a) => a.isScheduled && a.date >= today) || null;
  }

  /** [{ time, free, reason }] for the booking page. */
  freeSlots(doctorId, date) {
    const doctor = this.store.findDoctor(doctorId);
    const off = doctor ? !doctor.isAvailable(date) : true;
    return Appointment.SLOTS.map((time) => {
      const taken = this.store.appointments.some((a) => a.doctorId === doctorId && a.date === date && a.time === time && a.isScheduled);
      return { time, free: !off && !taken, reason: off ? 'Off' : taken ? 'Booked' : '' };
    });
  }

  /**
   * @throws {SlotUnavailableError|DoctorUnavailableError|InvalidInputError}
   */
  book(patientId, doctorId, date, time) {
    if (!patientId || !doctorId || !date || !time) throw new InvalidInputError('Choose a doctor, date and time slot first.');
    if (date < isoDate(0)) throw new InvalidInputError('You cannot book a date in the past.');
    const doctor = this.store.findDoctor(doctorId);
    if (!doctor || !doctor.isAvailable(date)) throw new DoctorUnavailableError('This doctor is not available on this day.');
    const clash = this.store.appointments.find((a) => a.isScheduled && a.date === date && a.time === time
      && (a.doctorId === doctorId || a.patientId === patientId));
    if (clash) {
      throw new SlotUnavailableError(clash.doctorId === doctorId
        ? `The doctor already has an appointment at ${time}.`
        : `You already have an appointment at ${time}.`);
    }
    // TODO(Malak): any extra rules (e.g. max 1 appointment per patient per doctor per day)
    const appt = new Appointment({ id: this.store.nextId('a'), patientId, doctorId, date, time });
    this.store.appointments.push(appt);
    return appt;
  }

  cancel(id, reason) {
    const appt = this.store.findAppointment(id);
    if (!appt) throw new InvalidInputError('Appointment not found.');
    appt.cancel(reason);
    return appt;
  }

  complete(id) {
    const appt = this.store.findAppointment(id);
    if (!appt) throw new InvalidInputError('Appointment not found.');
    appt.complete();
    return appt;
  }
}
