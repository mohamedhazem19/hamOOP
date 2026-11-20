import Person from "./Person.js";


/**
 * Admin
 * ------------------------------------------------------------------
 * The hospital staff member who uses the Registrations screen
 * ("Signed in as ADMIN (Admin)" in the PDF screenshots).
 *
 * INHERITANCE : extends Person, so id / name / phone and their
 *               validation are reused, not copied.
 * ENCAPSULATION: the list of permissions is private (#permissions).
 *               Outside code can only ask `can("...")`.
 * POLYMORPHISM : overrides getRole() and describe().
 *               Calling person.describe() on a Patient and on an Admin
 *               gives two different results from the same call.
 */
export default class Admin extends Person {
  static PERMISSIONS = Object.freeze([
    "register-patients",
    "delete-patients",
    "manage-doctors",
    "manage-appointments",
    "publish-reports",
  ]);


  #permissions;


  /**
   * @param {string} id
   * @param {string} name
   * @param {string} phone
   * @param {string[]} permissions  defaults to everything an admin may do
   */
  constructor(id, name, phone, permissions = Admin.PERMISSIONS) {
    super(id, name, phone);
    this.#permissions = [...permissions];
  }


  /** Admin-specific: does this admin have the given permission? */
  can(permission) {
    return this.#permissions.includes(permission);
  }


  /** Admin-specific: shortcut used by the Registrations screen. */
  canDeletePatients() {
    return this.can("delete-patients");
  }


  /** Implements the abstract method declared in Person. */
  getRole() {
    return "Admin";
  }


  /** OVERRIDES Person.describe(). */
  describe() {
    return `${this.id} · ${this.name} (Admin, ${this.#permissions.length} permissions) · ${this.phone}`;
  }
}

