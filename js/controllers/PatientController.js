// Owner: Lojaine Ahmed Mohamed (Patient Module)
// Week-1 starter from the Team Leader: methods work with sample data so others can call them.
// TODO(Lojaine): finish the validation rules marked below and add delete().

import DataStore from '../store/DataStore.js';
import Patient from '../models/Patient.js';
import InvalidInputError from '../errors/InvalidInputError.js';
import { isoDate } from '../store/sampleData.js';

export default class PatientController {
  constructor() {
    this.store = DataStore.instance;
  }

  all() {
    return [...this.store.patients];
  }

  findByPhone(phone) {
    return this.store.patients.find((p) => p.phone === String(phone).trim()) || null;
  }

  findById(id) {
    return this.store.findPatient(id);
  }

  /** Newest registrations first (dashboard list). */
  newest(n = 4) {
    return [...this.store.patients].sort((a, b) => b.registeredOn.localeCompare(a.registeredOn)).slice(0, n);
  }

  /**
   * @param {{name, phone, age, gender, password}} data
   * @returns {Patient}
   * @throws {InvalidInputError}
   */
  register({ name = '', phone = '', age, gender = 'Female', password = '' }) {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const ageNum = Number(age);
    if (cleanName.length < 3) throw new InvalidInputError('Please enter your full name.');
    if (!/^01\d{9}$/.test(cleanPhone)) throw new InvalidInputError('Phone number must be 11 digits starting with 01.');
    if (this.findByPhone(cleanPhone)) throw new InvalidInputError('An account with this phone number already exists. Please sign in.');
    if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 120) throw new InvalidInputError('Please enter a valid age.');
    // TODO(Lojaine): any extra rules (gender must be Male/Female, trim double spaces in name ...)

    const patient = new Patient({
      id: this.store.nextId('p'), name: cleanName, phone: cleanPhone, age: ageNum, gender, password, registeredOn: isoDate(0),
    });
    this.store.patients.push(patient);
    return patient;
  }

  // TODO(Lojaine): delete(id) – refuse if the patient still has Scheduled appointments
}
