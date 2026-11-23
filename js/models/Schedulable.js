// Owner: Rodina Elsayed Mohamed (Doctor Registration)
import Appointment from './Appointment.js';

/**
 * Schedulable  (MIXIN)
 * ------------------------------------------------------------------
 * JavaScript has no interfaces and a class can extend only ONE parent.
 * A mixin solves this: it is a function that takes a class and returns
 * a NEW class that extends it and adds extra behavior.
 *
 *      class Doctor extends Schedulable(Person) { ... }
 *
 * Chain: Doctor -> (class made by Schedulable) -> Person.
 * So a Doctor is still a Person, and it also "can be scheduled".
 *
 * WHAT IT ADDS
 *   - workingHours : { start, end, minutes }  e.g. 09:00 - 13:00, 30-min slots
 *   - getSlots(date): the working slots of one day, marked off on days off
 *
 * CONTRACT (like an interface): the class given to Schedulable must have
 *   isAvailable(date). Doctor provides it. If it is missing, getSlots()
 *   throws a clear error instead of failing silently.
 *
 * The slot times come from Appointment.SLOTS (Malak) so there is ONE list
 * of working times in the whole project.
 */
const SLOT_MINUTES = 30;

const addMinutes = (time, minutes) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const Schedulable = (Base) => class extends Base {
  /** { start: '09:00', end: '13:00', minutes: 30 } – "end" is when the last slot finishes. */
  get workingHours() {
    return {
      start: Appointment.SLOTS[0],
      end: addMinutes(Appointment.SLOTS.at(-1), SLOT_MINUTES),
      minutes: SLOT_MINUTES,
    };
  }

  /**
   * The slots of one day: [{ time: '09:00', off: false }, ...].
   * Every slot is off when the doctor has that day off.
   */
  getSlots(date) {
    if (typeof this.isAvailable !== 'function') {
      throw new Error(`${this.constructor.name} must implement isAvailable(date) to be Schedulable.`);
    }
    const off = !this.isAvailable(date);
    return Appointment.SLOTS.map((time) => ({ time, off }));
  }
};

export default Schedulable;// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// Not built yet – Rodina: write this mixin. See your task PDF.
//
// TODO(Rodina):
//  - JavaScript has no interfaces: a mixin adds getSlots(date) to a class
//  - const Schedulable = (Base) => class extends Base { getSlots(date) { ... } };
//  - export default Schedulable; decide whether Doctor uses it
