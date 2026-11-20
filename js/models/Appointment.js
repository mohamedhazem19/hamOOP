// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// One booked visit. The object guards its own state (ENCAPSULATION):
//  - every field is private (#), the outside world only reads getters;
//  - the status can only change through cancel() / complete(), which enforce the rules:
//        Scheduled -> Completed   (complete)
//        Scheduled -> Cancelled   (cancel, with a reason)
//    Completed and Cancelled are final. A scheduled visit can also be moved with reschedule().
// Who is allowed to book, and clash checks between appointments, belong to AppointmentController.

import InvalidInputError from '../errors/InvalidInputError.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;

export default class Appointment {
  /** 09:00 … 12:30, every 30 minutes (8 slots). */
  static SLOTS = Object.freeze(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30']);

  static STATUS = Object.freeze({ SCHEDULED: 'Scheduled', COMPLETED: 'Completed', CANCELLED: 'Cancelled' });

  /** Reasons offered in the cancel dialog. The model accepts any non-empty text (e.g. from DoctorController). */
  static CANCEL_REASONS = Object.freeze(['Doctor not available', 'Patient request', 'Hospital emergency', 'Other']);

  #id;
  #patientId;
  #doctorId;
  #date;
  #time;
  #status;
  #cancelReason;

  constructor({ id, patientId, doctorId, date, time, status = Appointment.STATUS.SCHEDULED, cancelReason = '' } = {}) {
    this.#id = Appointment.#required(id, 'id');
    this.#patientId = Appointment.#required(patientId, 'patient');
    this.#doctorId = Appointment.#required(doctorId, 'doctor');
    this.#date = Appointment.checkDate(date);
    this.#time = Appointment.checkTime(time);
    if (!Object.values(Appointment.STATUS).includes(status)) {
      throw new InvalidInputError(`Unknown appointment status "${status}".`);
    }
    this.#status = status;
    this.#cancelReason = status === Appointment.STATUS.CANCELLED ? String(cancelReason || 'Other').trim() : '';
  }

  // ---------- Validation rules written once, reused by the controller ----------
  static #required(value, label) {
    const text = String(value ?? '').trim();
    if (!text) throw new InvalidInputError(`An appointment needs a ${label}.`);
    return text;
  }

  /** @returns {string} the date, if it looks like a real 'YYYY-MM-DD' day */
  static checkDate(value) {
    const date = String(value ?? '').trim();
    let real = DATE_PATTERN.test(date);
    if (real) {
      const [y, m, d] = date.split('-').map(Number);
      const check = new Date(y, m - 1, d);       // 2026-02-31 would roll over to March, so compare back
      real = check.getFullYear() === y && check.getMonth() === m - 1 && check.getDate() === d;
    }
    if (!real) throw new InvalidInputError('Please choose a valid date.');
    return date;
  }

  /** @returns {string} the time, if it is one of the 8 slots */
  static checkTime(value) {
    const time = String(value ?? '').trim();
    if (!Appointment.SLOTS.includes(time)) {
      throw new InvalidInputError(`Time must be one of the slots ${Appointment.SLOTS[0]} – ${Appointment.SLOTS.at(-1)}.`);
    }
    return time;
  }

  /** Whole days from `today` to `date` (0 = today, 1 = tomorrow, negative = past). */
  static daysBetween(date, today) {
    return Math.round((new Date(`${date}T00:00:00`) - new Date(`${today}T00:00:00`)) / DAY_MS);
  }

  /** "Today", "Tomorrow", "In 3 days", "Yesterday", "5 days ago". */
  static countdown(date, today) {
    const n = Appointment.daysBetween(date, today);
    if (n === 0) return 'Today';
    if (n === 1) return 'Tomorrow';
    if (n > 1) return `In ${n} days`;
    return n === -1 ? 'Yesterday' : `${-n} days ago`;
  }

  // ---------- Read-only access ----------
  get id() { return this.#id; }
  get patientId() { return this.#patientId; }
  get doctorId() { return this.#doctorId; }
  get date() { return this.#date; }
  get time() { return this.#time; }
  get status() { return this.#status; }
  get cancelReason() { return this.#cancelReason; }

  get isScheduled() { return this.#status === Appointment.STATUS.SCHEDULED; }
  get isCompleted() { return this.#status === Appointment.STATUS.COMPLETED; }
  get isCancelled() { return this.#status === Appointment.STATUS.CANCELLED; }

  /** Sorting key: '2026-11-20 09:30' */
  get when() { return `${this.#date} ${this.#time}`; }

  /** Still to come: scheduled and not before `today`. */
  isUpcoming(today) { return this.isScheduled && this.#date >= today; }

  // ---------- The only ways to change the status ----------
  /** Scheduled -> Cancelled. @param {string} reason shown to the patient */
  cancel(reason) {
    if (!this.isScheduled) {
      throw new InvalidInputError(this.isCancelled ? 'This appointment is already cancelled.' : 'A completed appointment cannot be cancelled.');
    }
    const text = String(reason ?? '').trim();
    if (!text) throw new InvalidInputError('Please give a reason for the cancellation.');
    this.#status = Appointment.STATUS.CANCELLED;
    this.#cancelReason = text;
    return this;
  }

  /** Scheduled -> Completed. */
  complete() {
    if (!this.isScheduled) {
      throw new InvalidInputError(this.isCancelled ? 'A cancelled appointment cannot be completed.' : 'This appointment is already completed.');
    }
    this.#status = Appointment.STATUS.COMPLETED;
    return this;
  }

  /** Move a scheduled visit to a new date and time (the controller checks that the slot is free). */
  reschedule(date, time) {
    if (!this.isScheduled) throw new InvalidInputError('Only a scheduled appointment can be rescheduled.');
    const newDate = Appointment.checkDate(date);
    const newTime = Appointment.checkTime(time);
    this.#date = newDate;
    this.#time = newTime;
    return this;
  }

  /** Lets DataStore.save() keep the private fields (JSON.stringify uses this). */
  toJSON() {
    return {
      id: this.#id, patientId: this.#patientId, doctorId: this.#doctorId, date: this.#date,
      time: this.#time, status: this.#status, cancelReason: this.#cancelReason,
    };
  }
}
