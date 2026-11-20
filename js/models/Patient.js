import { Person } from "./Person.js";
import { InvalidInputError } from "../errors/InvalidInputError.js";


const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// "Sept" (not "Sep") to match the PDF screenshot: "Thu 17 Sept".
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];


/**
 * Patient
 * ------------------------------------------------------------------
 * INHERITANCE
 *   `extends Person` gives a Patient an id, a name and a phone (with
 *   their getters, setters and validation) for free. The constructor
 *   calls `super(...)` first to let Person set those up, then adds the
 *   patient-only data: age, gender and registeredOn.
 *
 * ENCAPSULATION
 *   #age, #gender and #registeredOn are private. They are read with
 *   getters and changed with setters that validate the new value.
 *
 * POLYMORPHISM (method overriding)
 *   - getRole()  : implements the abstract method from Person.
 *   - describe() : replaces Person's version with a patient-specific one.
 */
export class Patient extends Person {
  /** The only gender values the system accepts. */
  static GENDERS = Object.freeze(["Male", "Female"]);


  #age;
  #gender;
  #registeredOn;


  /**
   * @param {string} id
   * @param {string} name
   * @param {string} phone
   * @param {number|string} age
   * @param {string} gender          "Male" or "Female"
   * @param {Date}   registeredOn    defaults to "now"
   */
  constructor(id, name, phone, age, gender, registeredOn = new Date()) {
    super(id, name, phone); // Person handles id / name / phone
    this.age = age;
    this.gender = gender;
    this.registeredOn = registeredOn;
  }


  // ---------- Validation rules ----------


  /** Age must be a whole number from 0 to 120. Returns it as a number. */
  static checkAge(value) {
    const text = String(value ?? "").trim();
    if (text === "") {
      throw new InvalidInputError("Age is required.", "age");
    }
    const age = Number(text);
    if (!Number.isInteger(age) || age < 0 || age > 120) {
      throw new InvalidInputError(
        "Age must be a whole number between 0 and 120.",
        "age"
      );
    }
    return age;
  }


  /** Gender must be one of Patient.GENDERS. Returns it. */
  static checkGender(value) {
    const gender = String(value ?? "").trim();
    if (!Patient.GENDERS.includes(gender)) {
      throw new InvalidInputError(
        `Please choose a gender (${Patient.GENDERS.join(" or ")}).`,
        "gender"
      );
    }
    return gender;
  }


  // ---------- Getters / setters ----------


  get age() {
    return this.#age;
  }
  set age(value) {
    this.#age = Patient.checkAge(value);
  }


  get gender() {
    return this.#gender;
  }
  set gender(value) {
    this.#gender = Patient.checkGender(value);
  }


  get registeredOn() {
    // Return a COPY so outside code cannot change our private Date.
    return new Date(this.#registeredOn);
  }
  set registeredOn(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new InvalidInputError("Registration date is not a valid date.", "registeredOn");
    }
    this.#registeredOn = date;
  }


  // ---------- Polymorphism: overriding inherited methods ----------


  /** Implements the abstract method declared in Person. */
  getRole() {
    return "Patient";
  }


  /** OVERRIDES Person.describe() with age and gender. */
  describe() {
    return `${this.id} · ${this.name} · ${this.gender}, ${this.age} years · ${this.phone}`;
  }


  // ---------- Patient-specific methods ----------


  /** True for patients under 18 (shown to doctors as pediatric cases). */
  isChild() {
    return this.#age < 18;
  }


  /** Registration date for the table, e.g. "Thu 17 Sept". */
  getRegisteredLabel() {
    const d = this.#registeredOn;
    return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  }


  /** Whole calendar days between the registration date and `today`. */
  daysSinceRegistration(today = new Date()) {
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((startOfDay(today) - startOfDay(this.#registeredOn)) / msPerDay);
  }


  /** Text used by the dashboard's "New registrations": "Yesterday", "6 days ago". */
  getRegisteredAgoLabel(today = new Date()) {
    const days = this.daysSinceRegistration(today);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }
}

