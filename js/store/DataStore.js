// Owner: Mohamed Hazem (Team Leader)
// One shared, in-memory store for the whole app (singleton). There is no backend:
// data lives here while the page is open. Only controllers should change it.

import Patient from '../models/Patient.js';
import GeneralDoctor from '../models/GeneralDoctor.js';
import SpecialistDoctor from '../models/SpecialistDoctor.js';
import Department from '../models/Department.js';
import Hospital from '../models/Hospital.js';
import Appointment from '../models/Appointment.js';
import MedicalReport from '../models/MedicalReport.js';

const STORAGE_KEY = 'ham-data-v1';

export default class DataStore {
  static #instance = null;
  #nextId = 100;

  static get instance() {
    if (!DataStore.#instance) DataStore.#instance = new DataStore(DataStore.#token);
    return DataStore.#instance;
  }

  static #token = Symbol('DataStore');

  constructor(token) {
    if (token !== DataStore.#token) throw new Error('Use DataStore.instance instead of new DataStore()');
    this.reset();
  }

  reset() {
    this.hospital = null;
    this.patients = [];
    this.doctors = [];
    this.appointments = [];
    this.reports = [];
    this.#nextId = 100;
  }

  /** Builds model objects from plain data (see sampleData.js). */
  load(data) {
    this.reset();
    // The ?. calls keep the app running while teammates are still writing these models.
    this.hospital = new Hospital(data.hospital.name);
    data.departments.forEach((name) => this.hospital.addDepartment?.(new Department(name)));

    this.doctors = data.doctors.map((d) => (d.type === 'Specialist' ? new SpecialistDoctor(d) : new GeneralDoctor(d)));
    this.doctors.forEach((doc) => this.hospital.getDepartment?.(doc.department)?.addDoctor?.(doc));

    this.patients = data.patients.map((p) => new Patient(p));
    this.appointments = data.appointments.map((a) => new Appointment(a));
    this.reports = data.reports.map((r) => new MedicalReport(r));
    return this;
  }

  /** Unique ids for new objects, e.g. nextId('p') -> 'p100'. */
  nextId(prefix) {
    return `${prefix}${this.#nextId++}`;
  }

  // ---- Lookups everyone can use -------------------------------------------
  findPatient(id) { return this.patients.find((p) => p.id === id) || null; }
  findDoctor(id) { return this.doctors.find((d) => d.id === id) || null; }
  findAppointment(id) { return this.appointments.find((a) => a.id === id) || null; }

  // ---- Optional: keep data after a page refresh (still 100% frontend) -------
  // Off by default. Turn on in app.js once every model has toJSON().
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        hospital: { name: this.hospital?.name || 'HAM Hospital' },
        departments: this.hospital?.departments.map((d) => d.name) || [],
        doctors: this.doctors.map((d) => ({ ...d, fee: d.baseFee, type: d.type })),
        patients: this.patients,
        appointments: this.appointments,
        reports: this.reports,
        nextId: this.#nextId,
      }));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.load(data);
      this.#nextId = data.nextId || 100;
      return true;
    } catch (e) {
      console.warn('Saved data is broken, using sample data', e);
      return false;
    }
  }

  clearSaved() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
