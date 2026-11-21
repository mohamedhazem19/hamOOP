// Owner: Rodina Elsayed Mohamed (Doctor Registration)
import Department from './Department.js';
import InvalidInputError from '../errors/InvalidInputError.js';

/**
 * Hospital
 * ------------------------------------------------------------------
 * The top of the structure: Hospital -> Departments -> Doctors.
 *
 * COMPOSITION: the hospital owns its departments, exactly like a
 *   department owns its doctors.
 * ENCAPSULATION: #name and #departments are private; `departments`
 *   returns a copy of the list.
 */
export default class Hospital {
  #name;
  #departments = [];

  constructor(name) {
    const cleaned = String(name ?? '').trim();
    if (cleaned === '') {
      throw new InvalidInputError('A hospital must have a name.', 'name');
    }
    this.#name = cleaned;
  }

  get name() {
    return this.#name;
  }

  /** A copy of the departments list. */
  get departments() {
    return [...this.#departments];
  }

  /** Adds a department. Must be a Department, and names must be unique. */
  addDepartment(department) {
    if (!(department instanceof Department)) {
      throw new InvalidInputError('Only a Department can be added to the hospital.', 'department');
    }
    if (this.getDepartment(department.name)) {
      throw new InvalidInputError(
        `The department "${department.name}" already exists.`,
        'department'
      );
    }
    this.#departments.push(department);
  }

  /** Finds a department by name (ignores upper/lower case). Returns null if not found. */
  getDepartment(name) {
    const wanted = String(name ?? '').trim().toLowerCase();
    return this.#departments.find((d) => d.name.toLowerCase() === wanted) || null;
  }
}
