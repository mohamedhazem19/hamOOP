// Owner: Loay Hossam (Patient Module – reports)
// Week-1 starter from the Team Leader. TODO(Loay): finish publish() validation and scans.

import DataStore from '../store/DataStore.js';
import MedicalReport from '../models/MedicalReport.js';
import Scan from '../models/Scan.js';
import InvalidInputError from '../errors/InvalidInputError.js';

export default class ReportController {
  constructor() {
    this.store = DataStore.instance;
  }

  byId(id) { return this.store.reports.find((r) => r.id === id) || null; }
  forAppointment(appointmentId) { return this.store.reports.find((r) => r.appointmentId === appointmentId) || null; }

  /** Reports of one patient, newest visit first. */
  forPatient(patientId) {
    return this.store.reports
      .map((r) => ({ r, a: this.store.findAppointment(r.appointmentId) }))
      .filter(({ a }) => a && a.patientId === patientId)
      .sort((x, y) => y.a.date.localeCompare(x.a.date))
      .map(({ r }) => r);
  }

  /** Completed visits that have no report yet (admin). */
  waitingForReport() {
    return this.store.appointments.filter((a) => a.status === 'Completed' && !this.forAppointment(a.id));
  }

  publish(appointmentId, { title = '', diagnosis = '', vitals = '', notes = '', prescriptions = [], scans = [] }) {
    if (!title.trim() || !diagnosis.trim()) throw new InvalidInputError('A report needs a title and a diagnosis.');
    // TODO(Loay): check the appointment exists and is Completed; parse prescription lines
    const report = new MedicalReport({
      id: this.store.nextId('r'), appointmentId, title: title.trim(), diagnosis: diagnosis.trim(), vitals, notes, prescriptions,
      scans: scans.map((s) => new Scan({ id: this.store.nextId('s'), ...s })),
    });
    this.store.reports.push(report);
    return report;
  }
}
