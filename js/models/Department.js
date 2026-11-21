// Owner: Rodina Elsayed Mohamed (Doctor Registration)
import Doctor from './Doctor.js';
import InvalidInputError from '../errors/InvalidInputError.js';

/**
 * Department
 * ------------------------------------------------------------------
 * A hospital department (e.g. "Cardiology") and the doctors in it.
 *
 * COMPOSITION: a Department OWNS its doctors. It keeps them in a
 *   private list and is the only place that adds to it (addDoctor).
 * ENCAPSULATION: #name and #doctors are private. The `doctors` getter
 *   returns a COPY of the list, so the list can only grow through
 *   addDoctor(), which validates.
 */
export default class Department {
  #name;
  #doctors = [];

  constructor(name) {
    const cleaned = String(name ?? '').trim();
    if (cleaned === '') {
      throw new InvalidInputError('A department must have a name.', 'department');
    }
    this.#name = cleaned;
  }

  get name() {
    return this.#name;
  }

  /** A copy of the doctors list (the original stays private). */
  get doctors() {
    return [...this.#doctors];
  }

  /** Adds a doctor. Must be a Doctor of THIS department, and cannot be added twice. */
  addDoctor(doctor) {
    if (!(doctor instanceof Doctor)) {
      throw new InvalidInputError('Only a Doctor can be added to a department.', 'doctor');
    }
    // A Cardiology doctor must not be listed under Pediatrics.
    if (doctor.department.toLowerCase() !== this.#name.toLowerCase()) {
      throw new InvalidInputError(
        `${doctor.name} belongs to ${doctor.department}, not ${this.#name}.`,
        'department'
      );
    }
    if (this.#doctors.some((d) => d.id === doctor.id)) {
      throw new InvalidInputError(
        `${doctor.name} is already in ${this.#name}.`,
        'doctor'
      );
    }
    this.#doctors.push(doctor);
  }
}
