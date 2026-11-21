// Owner: Loay Hossam
// A doctor's report for one completed appointment. It HAS many Scan objects.
import Record from "./Record.js";
import Scan from "./Scan.js";
import InvalidInputError from "../errors/InvalidInputError.js";

export default class MedicalReport extends Record {
  #appointmentId;
  #title;
  #diagnosis;
  #vitals;
  #notes;
  #prescriptions;
  #scans;
  #followUpId;

  constructor({
    id, appointmentId, title, diagnosis,
    vitals = "", notes = "", prescriptions = [], scans = [], followUpId = null,
  } = {}) {
    super(id);
    this.#appointmentId = appointmentId ?? null;
    this.title = title;         // setters validate
    this.diagnosis = diagnosis;
    this.vitals = vitals;
    this.notes = notes;
    this.#followUpId = followUpId ?? null;

    this.#prescriptions = (prescriptions ?? []).map(MedicalReport.#toPrescription);

    this.#scans = [];
    (scans ?? []).forEach((s) => this.addScan(s)); // plain objects become Scan objects
  }

  // "Pain relief tablets", { medicine, how } or { name, how } (sampleData.js) -> always { medicine, how }
  static #toPrescription(item) {
    const raw = typeof item === "object" && item !== null ? item.medicine ?? item.name : item;
    const medicine = String(raw ?? "").trim();
    const how = String(item?.how ?? "").trim();
    if (!medicine) throw new InvalidInputError("Prescription needs a medicine name", "prescriptions");
    return { medicine, how };
  }

  get appointmentId() { return this.#appointmentId; }
  get followUpId() { return this.#followUpId; }

  get title() { return this.#title; }
  set title(value) {
    const text = String(value ?? "").trim();
    if (!text) throw new InvalidInputError("Report title is required", "title");
    this.#title = text;
  }

  get diagnosis() { return this.#diagnosis; }
  set diagnosis(value) {
    const text = String(value ?? "").trim();
    if (!text) throw new InvalidInputError("Diagnosis is required", "diagnosis");
    this.#diagnosis = text;
  }

  get vitals() { return this.#vitals; }
  set vitals(value) { this.#vitals = String(value ?? "").trim(); }

  get notes() { return this.#notes; }
  set notes(value) { this.#notes = String(value ?? "").trim(); }

  // Copies are returned, so outside code cannot push into our private lists
  get prescriptions() { return this.#prescriptions.map((p) => ({ ...p })); }
  get scans() { return [...this.#scans]; }
  get scanCount() { return this.#scans.length; }

  addScan(scan) {
    // Accept a Scan, or a plain { id, type, ... } object and convert it
    const item = scan instanceof Scan ? scan : new Scan(scan);
    if (this.#scans.some((s) => s.id === item.id)) {
      throw new InvalidInputError(`Scan ${item.id} is already in this report`, "scans");
    }
    this.#scans.push(item);
    return item;
  }

  /** Plain object for DataStore.save(): private fields are not seen by JSON.stringify. */
  toJSON() {
    return {
      id: this.id, appointmentId: this.#appointmentId, title: this.#title, diagnosis: this.#diagnosis,
      vitals: this.#vitals, notes: this.#notes, prescriptions: this.prescriptions,
      scans: this.#scans.map((scan) => scan.toJSON()), followUpId: this.#followUpId,
    };
  }

  // Polymorphism: MedicalReport's own version of describe()
  describe() {
    const n = this.scanCount;
    return `${this.title} - ${this.diagnosis} (${n} scan${n === 1 ? "" : "s"})`;
  }
}
