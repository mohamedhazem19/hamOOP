// Owner: Mohamed Hazem (Team Leader)
// Sign in, create account and sign out. Used by LoginView and SignUpView.

import DataStore from '../store/DataStore.js';
import session from '../session.js';
import Admin from '../models/Admin.js';
import InvalidInputError from '../errors/InvalidInputError.js';

const ADMIN_USERNAME = 'ADMIN';
const ADMIN_PASSWORD = '1234';      // demo only – a real app needs a server for this
const WRONG_LOGIN = 'Wrong phone number or password.';

export default class AuthController {
  /**
   * @param {PatientController} patients  used to find and register patients (owner: Lojaine)
   */
  constructor(patients) {
    this.patients = patients;
    this.store = DataStore.instance;
  }

  /**
   * Sign in with a phone number (patient) or the word ADMIN (any letter case).
   * @returns {Patient|Admin} the signed-in user
   * @throws {InvalidInputError} with one message for every failure (never reveals which part was wrong)
   */
  signIn(phoneOrAdmin, password) {
    const id = String(phoneOrAdmin || '').trim();
    if (!id || !password) throw new InvalidInputError('Please enter your phone number and password.');

    if (id.toUpperCase() === ADMIN_USERNAME) {
      if (password !== ADMIN_PASSWORD) throw new InvalidInputError(WRONG_LOGIN);
      const admin = new Admin();
      session.start(admin);
      return admin;
    }

    if (typeof this.patients.findByPhone !== 'function') {
      throw new InvalidInputError('Patient sign in is not ready yet: it needs PatientController.findByPhone() (Lojaine).');
    }
    const patient = this.patients.findByPhone(id);
    if (!patient || !patient.checkPassword?.(password)) throw new InvalidInputError(WRONG_LOGIN);
    session.start(patient);
    return patient;
  }

  /**
   * Create a patient account and sign in.
   * @param {{name, phone, age, gender, password, confirmPassword}} data
   * @throws {InvalidInputError}
   */
  signUp(data) {
    const { password = '', confirmPassword = '' } = data;
    if (password.length < 4) throw new InvalidInputError('Password must be at least 4 characters.');
    if (password !== confirmPassword) throw new InvalidInputError('Passwords do not match.');
    // PatientController checks name, phone (format + not used) and age.
    if (typeof this.patients.register !== 'function') {
      throw new InvalidInputError('Creating an account is not ready yet: it needs PatientController.register() (Lojaine).');
    }
    const patient = this.patients.register({ ...data, password });
    session.start(patient);
    return patient;
  }

  signOut() {
    session.end();
  }

  current() {
    return session.user;
  }
}
