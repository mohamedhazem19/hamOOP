// Owner: Loay Hossam (Patient Module)
// The rules for medical reports. Views only call these methods (README "Contracts"):
//   byId(id) · forAppointment(id) · forPatient(patientId) · waitingForReport() · publish(appointmentId, data)
//   + all() and details(report) so the pages never search the shared lists themselves.
// A report belongs to ONE completed appointment; the appointment knows the patient, doctor and date.

import DataStore from '../store/DataStore.js';
import MedicalReport from '../models/MedicalReport.js';
import InvalidInputError from '../errors/InvalidInputError.js';

export default class ReportController {
  #store;

  /** @param {DataStore} store  the shared store (the app passes nothing, so the singleton is used) */
  constructor(store = DataStore.instance) {
    this.#store = store;
  }

  // ---------- Reading ----------

  /** Every report, newest visit first. */
  all() {
    return this.#newestFirst(this.#store.reports);
  }

  /** One report, or null. */
  byId(id) {
    return this.#store.reports.find((r) => r.id === id) ?? null;
  }

  /** The report written for this visit, or null (Appointments and My Appointments ask this). */
  forAppointment(appointmentId) {
    return this.#store.reports.find((r) => r.appointmentId === appointmentId) ?? null;
  }

  /** One patient's reports, newest visit first. */
  forPatient(patientId) {
    return this.#newestFirst(this.#store.reports.filter((r) => this.#appointment(r)?.patientId === patientId));
  }

  /** Completed visits that have no report yet (Appointment objects), newest first. */
  waitingForReport() {
    return this.#store.appointments
      .filter((a) => a.isCompleted && !this.forAppointment(a.id))
      .sort((a, b) => b.when.localeCompare(a.when));
  }

  /** Everything a page shows next to a report, so views never look into other lists. */
  details(report) {
    const appointment = this.#appointment(report);
    const doctor = appointment ? this.#store.findDoctor(appointment.doctorId) : null;
    const patient = appointment ? this.#store.findPatient(appointment.patientId) : null;
    return {
      report,
      appointment,
      date: appointment?.date ?? '',
      time: appointment?.time ?? '',
      doctorName: doctor?.name ?? '(unknown doctor)',
      department: doctor?.department ?? '',
      patientName: patient?.name ?? '(deleted patient)',
    };
  }

  // ---------- Changing ----------

  /**
   * Write the report for a completed visit.
   * @param {string} appointmentId
   * @param {{title: string, diagnosis: string, vitals?: string, notes?: string,
   *          prescriptions?: {medicine: string, how?: string}[],
   *          scans?: {type: string, name: string, finding?: string, imagePath?: string}[]}} data
   * @throws {InvalidInputError} unknown / not completed visit, visit already has a report,
   *         empty title or diagnosis, a scan without a name … (nothing is stored when it throws)
   * @returns {MedicalReport}
   */
  publish(appointmentId, data = {}) {
    const appointment = this.#store.findAppointment(appointmentId);
    if (!appointment) throw new InvalidInputError('Please choose a visit for this report.', 'appointment');
    if (!appointment.isCompleted) throw new InvalidInputError('A report can only be written after the visit is completed.', 'appointment');
    if (this.forAppointment(appointmentId)) throw new InvalidInputError('This visit already has a report.', 'appointment');

    const report = new MedicalReport({
      id: this.#store.nextId('r'),
      appointmentId,
      title: data.title,
      diagnosis: data.diagnosis,
      vitals: data.vitals,
      notes: data.notes,
      prescriptions: (data.prescriptions ?? []).filter((p) => String(p?.medicine ?? '').trim()),
      // Every scan needs its own id (Record); the form does not ask for one.
      scans: (data.scans ?? []).map((s) => ({ ...s, id: s.id || this.#store.nextId('s') })),
    });
    this.#store.reports.push(report);
    this.#store.save?.();
    return report;
  }

  // ---------- Private helpers ----------

  #appointment(report) {
    return report ? this.#store.findAppointment(report.appointmentId) : null;
  }

  #newestFirst(reports) {
    const when = (r) => this.#appointment(r)?.when ?? '';
    return [...reports].sort((a, b) => when(b).localeCompare(when(a)));
  }
}
