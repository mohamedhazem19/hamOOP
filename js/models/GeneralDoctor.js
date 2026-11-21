// Owner: Rodina Elsayed Mohamed (Doctor Registration)
import Doctor from './Doctor.js';

/**
 * GeneralDoctor  (extends Doctor)
 * ------------------------------------------------------------------
 * A doctor without a specialty (e.g. Pediatrics, Dermatology in the
 * sample data).
 *
 * INHERITANCE: constructor, validation, photo, days off, isAvailable()
 *   and describe() all come from Doctor/Person. Nothing is copied here.
 * POLYMORPHISM: type and calculateFee() OVERRIDE the abstract versions
 *   in Doctor with the General Doctor behavior.
 */
export default class GeneralDoctor extends Doctor {
  /** Implements the abstract getter from Doctor. */
  get type() {
    return 'General';
  }

  /**
   * OVERRIDES Doctor.calculateFee().
   * A general consultation costs exactly the fee entered for the doctor.
   */
  calculateFee() {
    return this.baseFee;
  }
}
