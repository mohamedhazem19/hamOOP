// Owner: Rodina Elsayed Mohamed (Doctor Registration)
import Person from './Person.js';
import Schedulable from './Schedulable.js';
import InvalidInputError from '../errors/InvalidInputError.js';

/**
 * Doctor  (ABSTRACT CLASS, extends Person)
 * ------------------------------------------------------------------
 * Holds what every doctor shares: the Person data (id, name, phone)
 * plus department, fee, photo and days off.
 *
 * ABSTRACTION
 *   - `new Doctor(...)` is forbidden: the constructor checks
 *     `new.target` and throws if the class used with `new` is Doctor
 *     itself. Only GeneralDoctor / SpecialistDoctor can be created.
 *   - calculateFee() and the `type` getter are ABSTRACT: Doctor has no
 *     real answer, so each subclass must provide its own.
 *
 * ENCAPSULATION
 *   - #department, #fee, #photo and #offDays are private. Outside code
 *     goes through getters/setters, and the setters validate.
 *   - offDays returns a COPY of the array, so nobody can change the
 *     days off without going through addOffDay().
 *
 * INHERITANCE
 *   - Doctor extends Person, so id, name, phone and their validation
 *     are reused, not copied.
 *   - Schedulable(Person) is a MIXIN: it adds workingHours and getSlots(date),
 *     which the Doctors page cards use (JavaScript has no interfaces).
 *
 * POLYMORPHISM
 *   - calculateFee(), describe() and toJSON() are overridden or
 *     completed by the subclasses; the same call gives a result that
 *     depends on the real type of the doctor.
 */
export default class Doctor extends Schedulable(Person) {
  #department;
  #fee;
  #photo;
  #offDays;

  /**
   * new GeneralDoctor({ id, name, phone, department, fee, photo, offDays })
   * (the object form is how DataStore builds doctors from sampleData.js).
   */
  constructor(data) {
    // new.target may be read before super(), so Doctor can refuse early.
    if (new.target === Doctor) {
      throw new TypeError(
        'Doctor is an abstract class and cannot be created directly. ' +
          'Create a GeneralDoctor or a SpecialistDoctor instead.'
      );
    }
    if (data === null || typeof data !== 'object') {
      throw new InvalidInputError('Doctor data must be an object.', 'doctor');
    }

    super(data); // Person validates and stores id, name, phone.

    const { department, fee, photo = '', offDays = [] } = data;

    // Go through the setters so the validation rules run.
    this.department = department;
    this.fee = fee;
    this.photo = photo;

    this.#offDays = [];
    if (!Array.isArray(offDays)) {
      throw new InvalidInputError('Days off must be a list of dates.', 'offDays');
    }
    offDays.forEach((date) => this.addOffDay(date));
  }

  // ---------- Validation rules (static, written once) ----------

  /** Department name must not be empty. Returns the cleaned name. */
  static checkDepartment(value) {
    const name = String(value ?? '').trim();
    if (name === '') {
      throw new InvalidInputError('A doctor must belong to a department.', 'department');
    }
    return name;
  }

  /** Fee must be a number greater than 0. Returns the number. */
  static checkFee(value) {
    // Only numbers and text are accepted: Number(true) is 1 and Number([5]) is 5,
    // which would let wrong values in silently.
    const fee = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
    if (typeof value === 'string' && value.trim() === '') {
      throw new InvalidInputError('Fee must be a number greater than 0.', 'fee');
    }
    if (!Number.isFinite(fee) || fee <= 0) {
      throw new InvalidInputError('Fee must be a number greater than 0.', 'fee');
    }
    return fee;
  }

  /** A date must be a REAL day written as 'YYYY-MM-DD' (the project-wide format). */
  static checkDate(value) {
    const date = String(value ?? '').trim();
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(date);
    // Build the date and compare it back: 2026-02-30 would roll over to March, so it differs.
    const parsed = ok ? new Date(`${date}T00:00:00Z`) : null;
    const real = parsed !== null && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
    if (!real) {
      throw new InvalidInputError("Date must be a real day like '2026-11-20'.", 'date');
    }
    return date;
  }

  // ---------- Getters / setters ----------

  get department() {
    return this.#department;
  }
  set department(value) {
    this.#department = Doctor.checkDepartment(value);
  }

  /** The fee the admin entered. DataStore.save() reads this name. */
  get baseFee() {
    return this.#fee;
  }

  get fee() {
    return this.#fee;
  }
  set fee(value) {
    this.#fee = Doctor.checkFee(value);
  }

  /** Photo is a file path or a data URL (from FileReader). '' = no photo yet. */
  get photo() {
    return this.#photo;
  }
  set photo(value) {
    if (typeof value !== 'string') {
      throw new InvalidInputError('Photo must be a path or an image data URL.', 'photo');
    }
    this.#photo = value.trim();
  }

  /** A COPY of the days off, so the private list cannot be changed from outside. */
  get offDays() {
    return [...this.#offDays];
  }

  // ---------- Abstract members (subclasses must provide them) ----------

  /** ABSTRACT: "General" or "Specialist". */
  get type() {
    throw new Error(`${this.constructor.name} must implement get type().`);
  }

  /** ABSTRACT: the price of one visit. Each subclass applies its own rule. */
  calculateFee() {
    throw new Error(`${this.constructor.name} must implement calculateFee().`);
  }

  // ---------- Common methods ----------

  /** Person.getRole() is abstract; for every doctor the role is "Doctor". */
  getRole() {
    return 'Doctor';
  }

  /** Adds a day off ('YYYY-MM-DD'). Adding the same day twice does nothing. */
  addOffDay(date) {
    const day = Doctor.checkDate(date);
    if (!this.#offDays.includes(day)) this.#offDays.push(day);
  }

  /** False on days off, true on every other day. */
  isAvailable(date) {
    return !this.#offDays.includes(date);
  }

  /** OVERRIDES Person.describe() to add department and fee. */
  describe() {
    return `${super.describe()} · ${this.#department} · ${this.calculateFee()} EGP`;
  }

  /** Plain object for saving. Subclasses add their own fields. */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      department: this.#department,
      type: this.type,
      fee: this.#fee,
      photo: this.#photo,
      offDays: this.offDays,
    };
  }
}
