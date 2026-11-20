import Person from "../models/Person.js";
import Patient from "../models/Patient.js";
import InvalidInputError from "../errors/InvalidInputError.js";
import DataStore from "../store/DataStore.js";


/**
 * PatientController
 * ------------------------------------------------------------------
 * The "brain" of the patient side. Views (Registrations, Dashboard)
 * never touch the data directly; they call these methods on
 * this.c.patients (one shared object created in app.js):
 *
 *   register(data) -> Patient   (throws InvalidInputError)
 *   findByPhone(phone)          (AuthController uses it for sign in)
 *   all()
 *   newest(n)
 *   delete(id)
 *
 * Extra helpers the screens need: findById, visitCount,
 * hasScheduledAppointments.
 *
 * ---------------------------------------------------------------
 * TEAM INTEGRATION (read this!)
 * app.js creates it:  const patients = new PatientController();
 *
 * What it needs from teammates (the ONLY places it touches their code
 * are the marked "INTEGRATION POINT" methods near the bottom of this file):
 *
 *   DataStore.instance.patients      -> array of Patient objects (Mohamed)
 *   DataStore.instance.appointments  -> used until Malak's controller exists
 *   appointmentController.forPatient(id)
 *                                  -> array of appointments; each has a
 *                                     `status` ("Scheduled", "Completed", ...)
 * If their real method names differ, change only those marked methods.
 * ---------------------------------------------------------------
 */
export default class PatientController {
  #dataStore;
  #appointmentController;
  #lastIdNumber = 0; // so ids are never re-used after a delete


  /**
   * app.js creates ONE PatientController and gives it to AuthController and the views
   * (this.c.patients). AppointmentController (Malak) is optional until it is written.
   */
  constructor(appointmentController = null) {
    this.#dataStore = DataStore.instance;
    this.#appointmentController = appointmentController;
  }


  // ======================= Public API (from the PDF) =======================


  /**
   * Validates the form data and creates a new Patient.
   * @param {{name:string, phone:string, age:(string|number), gender:string}} data
   * @returns {Patient}
   * @throws {InvalidInputError} with a clear message and the faulty field
   */
  register(data = {}) {
    // Same order as the form, so the first problem the user sees is the
    // first problem on screen.
    const name = Person.checkName(data.name);
    const phone = Person.checkPhone(data.phone);


    if (this.findByPhone(phone)) {
      throw new InvalidInputError(
        "This phone number is already registered to another patient.",
        "phone"
      );
    }


    const age = Patient.checkAge(data.age);
    const gender = Patient.checkGender(data.gender);


    const patient = new Patient(
      this.#nextId(),
      name,
      phone,
      age,
      gender,
      new Date(),
      data.password ?? "" // sign-up passes a password; walk-in patients have none
    );
    this.#storeAdd(patient);
    return patient;
  }


  /** Returns the patient with this phone number, or null. */
  findByPhone(phone) {
    const wanted = String(phone ?? "").trim();
    return this.#storeList().find((p) => p.phone === wanted) ?? null;
  }


  /** Returns every registered patient (a copy of the list). */
  all() {
    return [...this.#storeList()];
  }


  /** Returns the `n` most recently registered patients, newest first. */
  newest(n) {
    const count = Math.max(0, Math.floor(Number(n) || 0));
    // Sort by registration date (newest first). If two patients have the
    // same date/time, the one added later to the list counts as newer.
    return this.all()
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
  delete(id) {
    const patient = this.findById(id);
    if (!patient) {
      throw new InvalidInputError("This patient no longer exists.");
    }


    const scheduled = this.#scheduledFor(patient.id).length;
    if (scheduled > 0) {
      const word = scheduled === 1 ? "appointment" : "appointments";
      throw new InvalidInputError(
        `Cannot delete ${patient.name}: ${scheduled} scheduled ${word} still ` +
          `exist${scheduled === 1 ? "s" : ""}.`
      );
    }


    this.#storeRemove(patient.id);
    return true;
  }


  // ======================= Extra helpers =======================


  /** Returns the patient with this id, or null. */
  findById(id) {
    return this.#storeList().find((p) => p.id === id) ?? null;
  }


  /** True if the patient still has at least one scheduled appointment. */
  hasScheduledAppointments(id) {
    return this.#scheduledFor(id).length > 0;
  }


  /**
   * Number of visits shown in the table = completed appointments.
   * (In the PDF sample data Hana has a scheduled appointment but 0 visits,
   * so scheduled ones are not counted as visits.)
   */
  visitCount(id) {
    return this.#appointmentsFor(id).filter(
      (a) => this.#statusOf(a) === "completed"
    ).length;
  }


  // ======================= Private helpers =======================


  /** "p5", "p6", ... always one higher than anything used before. */
  #nextId() {
    const highestExisting = this.#storeList().reduce((max, p) => {
      const number = parseInt(p.id.replace(/\D/g, ""), 10);
      return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);
    this.#lastIdNumber =
      Math.max(this.#lastIdNumber, highestExisting) + 1;
    return `p${this.#lastIdNumber}`;
  }


  #scheduledFor(id) {
    return this.#appointmentsFor(id).filter(
      (a) => this.#statusOf(a) === "scheduled"
    );
  }


  // =====================================================================
  // INTEGRATION POINTS - the only code that touches teammates' classes.
  // If a teammate's method has a different name, fix it HERE only.
  // =====================================================================


  /** [Mohamed - DataStore] all patients. */
  #storeList() {
    return this.#dataStore.patients;
  }


  /** [Mohamed - DataStore] save a new patient. */
  #storeAdd(patient) {
    this.#dataStore.patients.push(patient);
  }


  /** [Mohamed - DataStore] remove a patient by id. */
  #storeRemove(id) {
    const list = this.#dataStore.patients;
    const index = list.findIndex((p) => p.id === id);
    if (index !== -1) list.splice(index, 1);
  }


  /** [Malak - AppointmentController] appointments of one patient. */
  #appointmentsFor(id) {
    // Use Malak's AppointmentController once it has forPatient(); until then read the store.
    const fromController = this.#appointmentController?.forPatient?.(id);
    return fromController ?? this.#dataStore.appointments.filter((a) => a.patientId === id);
  }


  /** [Malak] reads an appointment's status as lower-case text. */
  #statusOf(appointment) {
    return String(appointment?.status ?? "").toLowerCase();
  }


}

