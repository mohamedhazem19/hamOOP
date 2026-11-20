import InvalidInputError from "../errors/InvalidInputError.js";


/**
 * Person  (ABSTRACT CLASS)
 * ------------------------------------------------------------------
 * Holds everything that every person in the hospital system shares:
 * an id, a name and a phone number.
 *
 * ABSTRACTION
 *   - `new Person(...)` is forbidden. The constructor checks
 *     `new.target` (the class that was really used with `new`) and
 *     throws if it is Person itself. Only subclasses can be created.
 *   - `getRole()` is an ABSTRACT METHOD: Person declares it, but has
 *     no real body. Every subclass MUST provide its own version.
 *
 * ENCAPSULATION
 *   - #id, #name and #phone are private fields. Code outside this
 *     class cannot read or write them directly; it has to go through
 *     the getters/setters, and the setters validate the value.
 *   - The id has a getter but NO setter: an id never changes.
 *
 * INHERITANCE
 *   - Patient and Admin extend Person, so they reuse the fields,
 *     getters, setters, validation and describe()/matches() without
 *     copying any code.
 *
 * POLYMORPHISM
 *   - describe() is written here once, but subclasses OVERRIDE it so
 *     the same call `person.describe()` gives a different result
 *     depending on the real type of the object.
 */
export default class Person {
  #id;
  #name;
  #phone;


  /**
   * Accepts new Person(id, name, phone) or new Person({ id, name, phone, ... }).
   * The object form is how DataStore builds patients and doctors from sampleData.js.
   */
  constructor(id, name, phone) {
    if (id !== null && typeof id === "object") ({ id, name, phone } = id);

    if (new.target === Person) {
      throw new TypeError(
        "Person is an abstract class and cannot be created directly. " +
          "Create a Patient or an Admin instead."
      );
    }


    if (typeof id !== "string" || id.trim() === "") {
      throw new InvalidInputError("A person must have an id.", "id");
    }
    this.#id = id.trim();


    // Go through the setters so the validation rules run.
    this.name = name;
    this.phone = phone;
  }


  // ---------- Validation rules (static = belong to the class) ----------
  // Public so PatientController can validate input BEFORE creating an
  // object, and so each rule is written in exactly one place.


  /** Name must contain at least 3 letters. Returns the cleaned name. */
  static checkName(value) {
    const name = String(value ?? "").trim().replace(/\s+/g, " ");
    const letters = name.match(/\p{L}/gu) ?? []; // \p{L} = any letter (Arabic too)
    if (letters.length < 3) {
      throw new InvalidInputError(
        "Full name must contain at least 3 letters.",
        "name"
      );
    }
    return name;
  }


  /** Phone must be exactly 11 digits and start with 01. Returns the phone. */
  static checkPhone(value) {
    const phone = String(value ?? "").trim();
    if (!/^\d{11}$/.test(phone)) {
      throw new InvalidInputError(
        "Phone number must contain exactly 11 digits (numbers only).",
        "phone"
      );
    }
    if (!phone.startsWith("01")) {
      throw new InvalidInputError("Phone number must start with 01.", "phone");
    }
    return phone;
  }


  // ---------- Getters / setters ----------


  get id() {
    return this.#id;
  }


  get name() {
    return this.#name;
  }
  set name(value) {
    this.#name = Person.checkName(value);
  }


  get phone() {
    return this.#phone;
  }
  set phone(value) {
    this.#phone = Person.checkPhone(value);
  }


  // ---------- Abstract method ----------


  /**
   * ABSTRACT: every subclass must return its own role ("Patient", "Admin").
   * Person has no sensible answer, so calling it here is an error.
   */
  getRole() {
    throw new Error(`${this.constructor.name} must implement getRole().`);
  }


  // ---------- Common methods (can be overridden) ----------


  /**
   * Short text description of the person.
   * Subclasses OVERRIDE this (polymorphism). It calls getRole(), which
   * is also resolved per subclass.
   */
  describe() {
    return `${this.#id} · ${this.#name} (${this.getRole()}) · ${this.#phone}`;
  }


  /**
   * Used by the search box. True if the text is found in the name
   * (ignoring upper/lower case) or in the phone number.
   * Written once here, inherited by every subclass.
   */
  matches(query) {
    const text = String(query ?? "").trim().toLowerCase();
    if (text === "") return true;
    return this.#name.toLowerCase().includes(text) || this.#phone.includes(text);
  }
}

