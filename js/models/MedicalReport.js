// Owner: Loay Hossam (Patient Module – reports)
import Scan from './Scan.js';

// Composition: a report owns its scans.
// TODO(Loay): private fields + getters, validation (title and diagnosis required)
export default class MedicalReport {
  constructor({ id, appointmentId, title, diagnosis, vitals = '', notes = '', prescriptions = [], scans = [], followUpId = null }) {
    this.id = id;
    this.appointmentId = appointmentId;
    this.title = title;
    this.diagnosis = diagnosis;
    this.vitals = vitals;
    this.notes = notes;
    this.prescriptions = prescriptions; // [{ name, how }]
    this.followUpId = followUpId;
    this.scans = scans.map((s) => (s instanceof Scan ? s : new Scan(s)));
  }

  addScan(scan) {
    this.scans.push(scan);
  }
}
