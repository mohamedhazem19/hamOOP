// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// The business rules for doctors. Views only call the public methods below:
//   all() · findById(id) · departments() · byDepartment(name) · isAvailable(id, date)
//   add({ name, department, type, fee, phone? }) · setPhoto(id, file) · markUnavailable(id, date, reason)
//   bookingsOn(id, date) · affectedBy(id, date)      (helpers for the "Not available" dialog and the cards)
// ABSTRACTION: the page never touches DataStore or the model classes' constructors; it only
// asks this controller. Only controllers change the DataStore (project rule).
// Dependencies: DataStore (shared lists), AppointmentController.cancel() (Malak), the doctor models.

import DataStore from '../store/DataStore.js';
import { isoDate } from '../store/sampleData.js';
import Doctor from '../models/Doctor.js';
import GeneralDoctor from '../models/GeneralDoctor.js';
import SpecialistDoctor from '../models/SpecialistDoctor.js';
import InvalidInputError from '../errors/InvalidInputError.js';

const TYPES = Object.freeze({ GENERAL: 'General', SPECIALIST: 'Specialist' });
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB: the picture is kept in memory as text (data URL)
const DEFAULT_REASON = 'Doctor not available';

export default class DoctorController {
  #appointments;
  #store;

  /**
   * @param {AppointmentController} appointments  used to find and cancel the bookings of a day off
   * @param {DataStore} store  the shared store (the app passes nothing, so the singleton is used)
   */
  constructor(appointments, store = DataStore.instance) {
    this.#appointments = appointments;
    this.#store = store;
  }

  /** The doctor types the "Add doctor" form offers. */
  static get TYPES() { return TYPES; }

  // =====================================================================
  //  Reading
  // =====================================================================

  /** Every doctor, in the order they were added (a new array: changing it does not change the store). */
  all() {
    return [...this.#store.doctors];
  }

  /** One doctor, or null. */
  findById(id) {
    return this.#store.findDoctor(id);
  }

  /** The department names, e.g. ['Cardiology', 'Pediatrics', ...]. */
  departments() {
    return (this.#store.hospital?.departments ?? []).map((d) => d.name);
  }

  /** The doctors of one department (empty list when the department does not exist). */
  byDepartment(name) {
    return this.#store.hospital?.getDepartment(name)?.doctors ?? [];
  }

  /** Is the doctor working on this day? An unknown doctor is never available. */
  isAvailable(id, date) {
    const doctor = this.findById(id);
    return doctor ? doctor.isAvailable(date) : false;
  }

  /** The scheduled (not cancelled, not completed) bookings of one doctor on one day. */
  bookingsOn(id, date) {
    const day = Doctor.checkDate(date);
    return this.#appointments.all({ doctorId: id, date: day }).filter((a) => a.isScheduled);
  }

  /**
   * What markUnavailable() would cancel, so the dialog can say "2 bookings will be cancelled"
   * before the admin confirms. Changes nothing.
   */
  affectedBy(id, date) {
    this.#doctor(id); // throws for an unknown doctor
    return this.bookingsOn(id, date);
  }

  // =====================================================================
  //  Changing
  // =====================================================================

  /**
   * Register a new doctor (General or Specialist) and file it under its department.
   * The Add form has no phone field, so a placeholder number is generated when none is given.
   * @param {{name: string, department: string, type: string, fee: number|string, phone?: string, specialty?: string}} data
   * @throws {InvalidInputError} bad name / fee / phone, unknown department or type, duplicate doctor
   * @returns {Doctor} the new doctor
   */
  add({ name, department, type = TYPES.GENERAL, fee, phone, specialty = '' } = {}) {
    const dept = this.#store.hospital?.getDepartment(department);
    if (!dept) throw new InvalidInputError('Please choose a department.', 'department');
    if (!Object.values(TYPES).includes(type)) throw new InvalidInputError('Please choose a doctor type.', 'type');

    const doctorName = Doctor.checkName(name);
    const same = dept.doctors.find((d) => d.name.toLowerCase() === doctorName.toLowerCase());
    if (same) throw new InvalidInputError(`${same.name} is already in ${dept.name}.`, 'name');

    const data = {
      id: this.#store.nextId('d'),
      name: doctorName,
      phone: phone ? phone : this.#placeholderPhone(),
      department: dept.name,
      fee,
      photo: '',
      offDays: [],
      specialty,
    };
    // The model validates everything (fee > 0, phone ...). Nothing is stored if it throws.
    const doctor = type === TYPES.SPECIALIST ? new SpecialistDoctor(data) : new GeneralDoctor(data);
    dept.addDoctor(doctor);
    this.#store.doctors.push(doctor);
    this.#store.save?.(); // keeps the data after a refresh when the team turns that option on in app.js
    return doctor;
  }

  /**
   * Show a real photo on the doctor's card. Reads the picture with FileReader and keeps it as a
   * data URL in memory (no backend), so it disappears on refresh like all the other data.
   * @param {string} id    the doctor
   * @param {File} file    from <input type="file">
   * @returns {Promise<string>} resolves with the data URL
   * @throws {InvalidInputError} (as a rejected promise) not an image, too big, unreadable, unknown doctor
   */
  setPhoto(id, file) {
    return new Promise((resolve, reject) => {
      try {
        const doctor = this.#doctor(id);
        if (!file || typeof file.type !== 'string' || !file.type.startsWith('image/')) {
          throw new InvalidInputError('Please choose an image file (PNG, JPG ...).', 'photo');
        }
        if (file.size > MAX_PHOTO_BYTES) {
          throw new InvalidInputError('The photo is too big. Please choose one under 2 MB.', 'photo');
        }
        const reader = new FileReader();
        reader.onload = () => {
          try {
            doctor.photo = String(reader.result);
            resolve(doctor.photo);
          } catch (error) { reject(error); }
        };
        reader.onerror = () => reject(new InvalidInputError('The photo could not be read. Please try another file.', 'photo'));
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Give the doctor a day off and cancel every scheduled booking of that day.
   * Cancelling is done by Malak's AppointmentController, which keeps the reason for the patient.
   * @param {string} id      the doctor
   * @param {string} date    'YYYY-MM-DD', today or later
   * @param {string} reason  optional; shown to the patient
   * @throws {InvalidInputError} unknown doctor, bad or past date, day already marked
   * @returns {Appointment[]} the appointments that were cancelled (empty when the day was free)
   */
  markUnavailable(id, date, reason = '') {
    const doctor = this.#doctor(id);
    const day = Doctor.checkDate(date);
    if (day < isoDate(0)) throw new InvalidInputError('You cannot mark a day in the past.', 'date');
    if (!doctor.isAvailable(day)) throw new InvalidInputError(`${doctor.name} is already not available on this day.`, 'date');

    const text = String(reason ?? '').trim();
    const why = text ? `${DEFAULT_REASON}: ${text}` : DEFAULT_REASON;

    const affected = this.bookingsOn(id, day);
    doctor.addOffDay(day);
    affected.forEach((a) => this.#appointments.cancel(a.id, why));
    this.#store.save?.();
    return affected;
  }

  // =====================================================================
  //  Private helpers
  // =====================================================================

  #doctor(id) {
    const doctor = this.findById(id);
    if (!doctor) throw new InvalidInputError('This doctor no longer exists.', 'doctor');
    return doctor;
  }

  /** A valid, unused Egyptian-style number for doctors added without one: 0109 + 7 digits. */
  #placeholderPhone() {
    const used = new Set(this.#store.doctors.map((d) => d.phone));
    for (let n = 1; ; n += 1) {
      const phone = `0109${String(n).padStart(7, '0')}`;
      if (!used.has(phone)) return phone;
    }
  }
}
