// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// Week-1 starter from the Team Leader. TODO(Rodina): finish add() validation, setPhoto(), markUnavailable().

import DataStore from '../store/DataStore.js';
import GeneralDoctor from '../models/GeneralDoctor.js';
import SpecialistDoctor from '../models/SpecialistDoctor.js';
import InvalidInputError from '../errors/InvalidInputError.js';

export default class DoctorController {
  constructor(appointments) {
    this.store = DataStore.instance;
    this.appointments = appointments; // AppointmentController (Malak) – used by markUnavailable()
  }

  all() { return [...this.store.doctors]; }
  findById(id) { return this.store.findDoctor(id); }
  departments() { return this.store.hospital.departments.map((d) => d.name); }
  byDepartment(name) { return this.store.doctors.filter((d) => d.department === name); }

  isAvailable(doctorId, date) {
    const doctor = this.findById(doctorId);
    return !!doctor && doctor.isAvailable(date);
  }

  add({ name = '', department, type = 'General', fee, phone = '' }) {
    if (name.trim().length < 3) throw new InvalidInputError("Enter the doctor's full name.");
    if (!(Number(fee) > 0)) throw new InvalidInputError('Fee must be a positive number.');
    // TODO(Rodina): check department exists, phone format
    const Cls = type === 'Specialist' ? SpecialistDoctor : GeneralDoctor;
    const doctor = new Cls({ id: this.store.nextId('d'), name: name.trim(), phone, department, fee: Number(fee) });
    this.store.doctors.push(doctor);
    this.store.hospital.getDepartment(department)?.addDoctor(doctor);
    return doctor;
  }

  // TODO(Rodina): setPhoto(doctorId, file) – use FileReader.readAsDataURL and save the result on doctor.photo

  /**
   * Doctor is not available on a date: add the day off and cancel that day's bookings.
   * @returns {Appointment[]} the cancelled appointments
   */
  markUnavailable(doctorId, date, reason = '') {
    const doctor = this.findById(doctorId);
    if (!doctor) throw new InvalidInputError('Doctor not found.');
    if (!doctor.offDays.includes(date)) doctor.offDays.push(date);
    const why = 'Doctor not available' + (reason.trim() ? ` (${reason.trim()})` : '');
    const hit = this.appointments.all({ doctorId, date }).filter((a) => a.isScheduled);
    hit.forEach((a) => this.appointments.cancel(a.id, why));
    return hit;
  }
}
