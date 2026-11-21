// Owner: Rodina Elsayed Mohamed (Doctor Registration)
import Doctor from './Doctor.js';

/**
 * SpecialistDoctor  (extends Doctor)
 * ------------------------------------------------------------------
 * A doctor with a specialty (e.g. "Heart rhythm" for Dr. Ahmed Fathy).
 *
 * INHERITANCE: reuses everything from Doctor/Person and adds ONE new
 *   field, #specialty.
 * ENCAPSULATION: #specialty is private; read it with the getter, change
 *   it with the setter (which cleans the text).
 * POLYMORPHISM: type, calculateFee(), describe() and toJSON() are
 *   overridden/extended for specialists.
 */
export default class SpecialistDoctor extends Doctor {
  #specialty;

  /** Accepts the same object as Doctor, plus an optional `specialty`. */
  constructor(data) {
    super(data);
    this.specialty = data.specialty;
  }

  /** Specialty is optional (the admin "Add doctor" form has no such field). */
  get specialty() {
    return this.#specialty;
  }
  set specialty(value) {
    this.#specialty = String(value ?? '').trim().replace(/\s+/g, ' ');
  }

  /** Implements the abstract getter from Doctor. */
  get type() {
    return 'Specialist';
  }

  /**
   * OVERRIDES Doctor.calculateFee().
   * The fee entered for a specialist is already the specialist price
   * (e.g. 400 EGP for Cardiology), so no extra amount is added.
   */
  calculateFee() {
    return this.baseFee;
  }

  /** OVERRIDES Doctor.describe() to show the specialty. */
  describe() {
    const base = super.describe();
    return this.#specialty ? `${base} · ${this.#specialty}` : base;
  }

  /** Extends Doctor.toJSON() with the extra field. */
  toJSON() {
    return { ...super.toJSON(), specialty: this.#specialty };
  }
}
