import { Person } from "../models/Person.js";
import { Patient } from "../models/Patient.js";
import { InvalidInputError } from "../errors/InvalidInputError.js";


/**
 * PatientController
 * ------------------------------------------------------------------
 * The "brain" of the patient side. Views (Registrations, Dashboard)
 * never touch the data directly; they call these static methods:
 *
 *   PatientController.register(data) -> Patient   (throws InvalidInputError)
 *   PatientController.findByPhone(phone)
 *   PatientController.all()
 *   PatientController.newest(n)
 *   PatientController.delete(id)
 *
 * Extra helpers the screens need: findById, visitCount,
 * hasScheduledAppointments.
 *
 * ---------------------------------------------------------------
 * TEAM INTEGRATION (read this!)
 * This controller does NOT create its own storage and does NOT guess
 * where teammates' files live. Mohamed wires the real objects ONCE at
 * start-up (for example in main.js):
 *
 *   PatientController.configure({
 *     dataStore: DataStore,                       // Mohamed
 *     appointmentController: AppointmentController // Malak
 *   });
 *
 * What it needs from them (the ONLY places it touches their code are
 * the marked "INTEGRATION POINT" methods near the bottom of this file):
 *
 *   dataStore.getPatients()        -> array of Patient objects
 *   dataStore.addPatient(patient)  -> saves a new Patient
 *   dataStore.removePatient(id)    -> removes the patient with that id
 *   appointmentController.forPatient(id)
 *                                  -> array of appointments; each has a
 *                                     `status` ("Scheduled", "Completed", ...)
 * If their real method names differ, change only those marked methods.
 * ---------------------------------------------------------------
 */
export class PatientController {
  static #dataStore = null;
  static #appointmentController = null;
  static #lastIdNumber = 0; // so ids are never re-used after a delete


  /** Receives the teammates' objects. Call once before using the controller. */
  static configure({ dataStore, appointmentController }) {
    PatientController.#dataStore = dataStore;
    PatientController.#appointmentController = appointmentController;
  }


  // ======================= Public API (from the PDF) =======================


  /**
   * Validates the form data and creates a new Patient.
   * @param {{name:string, phone:string, age:(string|number), gender:string}} data
   * @returns {Patient}
   * @throws {InvalidInputError} with a clear message and the faulty field
   */
  static register(data = {}) {
    // Same order as the form, so the first problem the user sees is the
    // first problem on screen.
    const name = Person.checkName(data.name);
    const phone = Person.checkPhone(data.phone);


    if (PatientController.findByPhone(phone)) {
      throw new InvalidInputError(
        "This phone number is already registered to another patient.",
        "phone"
      );
    }


    const age = Patient.checkAge(data.age);
    const gender = Patient.checkGender(data.gender);


    const patient = new Patient(
      PatientController.#nextId(),
      name,
      phone,
      age,
      gender,
      new Date()
    );
    PatientController.#storeAdd(patient);
    return patient;
  }


  /** Returns the patient with this phone number, or null. */
  static findByPhone(phone) {
    const wanted = String(phone ?? "").trim();
    return PatientController.#storeList().find((p) => p.phone === wanted) ?? null;
  }


  /** Returns every registered patient (a copy of the list). */
  static all() {
    return [...PatientController.#storeList()];
  }


  /** Returns the `n` most recently registered patients, newest first. */
  static newest(n) {
    const count = Math.max(0, Math.floor(Number(n) || 0));
    // Sort by registration date (newest first). If two patients have the
    // same date/time, the one added later to the list counts as newer.
    return PatientController.all()
      .map((patient, position) => ({ patient, position }))
      .sort(
        (a, b) =>
          b.patient.registeredOn - a.patient.registeredOn || b.position - a.position
      )
      .slice(0, count)
      .map((item) => item.patient);
  }


  /**
   * Deletes a patient, but only if deletion is allowed.
   * @returns {true} when the patient was deleted
   * @throws {InvalidInputError} if the patient does not exist or still
   *         has scheduled appointments
   */
  static delete(id) {
    const patient = PatientController.findById(id);
    if (!patient) {
      throw new InvalidInputError("This patient no longer exists.");
    }


    const scheduled = PatientController.#scheduledFor(patient.id).length;
    if (scheduled > 0) {
      const word = scheduled === 1 ? "appointment" : "appointments";
      throw new InvalidInputError(
        `Cannot delete ${patient.name}: ${scheduled} scheduled ${word} still ` +
          `exist${scheduled === 1 ? "s" : ""}.`
      );
    }


    PatientController.#storeRemove(patient.id);
    return true;
  }


  // ======================= Extra helpers =======================


  /** Returns the patient with this id, or null. */
  static findById(id) {
    return PatientController.#storeList().find((p) => p.id === id) ?? null;
  }


  /** True if the patient still has at least one scheduled appointment. */
  static hasScheduledAppointments(id) {
    return PatientController.#scheduledFor(id).length > 0;
  }


  /**
   * Number of visits shown in the table = completed appointments.
   * (In the PDF sample data Hana has a scheduled appointment but 0 visits,
   * so scheduled ones are not counted as visits.)
   */
  static visitCount(id) {
    return PatientController.#appointmentsFor(id).filter(
      (a) => PatientController.#statusOf(a) === "completed"
    ).length;
  }


  // ======================= Private helpers =======================


  /** "P1", "P2", ... always one higher than anything used before. */
  static #nextId() {
    const highestExisting = PatientController.#storeList().reduce((max, p) => {
      const number = parseInt(p.id.replace(/\D/g, ""), 10);
      return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);
    PatientController.#lastIdNumber =
      Math.max(PatientController.#lastIdNumber, highestExisting) + 1;
    return `P${PatientController.#lastIdNumber}`;
  }


  static #scheduledFor(id) {
    return PatientController.#appointmentsFor(id).filter(
      (a) => PatientController.#statusOf(a) === "scheduled"
    );
  }


  // =====================================================================
  // INTEGRATION POINTS - the only code that touches teammates' classes.
  // If a teammate's method has a different name, fix it HERE only.
  // =====================================================================


  /** [Mohamed - DataStore] all patients. */
  static #storeList() {
    PatientController.#assertConfigured();
    return PatientController.#dataStore.getPatients();
  }


  /** [Mohamed - DataStore] save a new patient. */
  static #storeAdd(patient) {
    PatientController.#assertConfigured();
    PatientController.#dataStore.addPatient(patient);
  }


  /** [Mohamed - DataStore] remove a patient by id. */
  static #storeRemove(id) {
    PatientController.#assertConfigured();
    PatientController.#dataStore.removePatient(id);
  }


  /** [Malak - AppointmentController] appointments of one patient. */
  static #appointmentsFor(id) {
    PatientController.#assertConfigured();
    return PatientController.#appointmentController.forPatient(id) ?? [];
  }


  /** [Malak] reads an appointment's status as lower-case text. */
  static #statusOf(appointment) {
    return String(appointment?.status ?? "").toLowerCase();
  }


  static #assertConfigured() {
    if (!PatientController.#dataStore || !PatientController.#appointmentController) {
      throw new Error(
        "PatientController is not configured. Call " +
          "PatientController.configure({ dataStore, appointmentController }) first."
      );
    }
  }
}

