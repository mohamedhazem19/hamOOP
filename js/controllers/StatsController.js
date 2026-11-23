// Owner: Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed (GUI general)
// The numbers behind the Statistics page (#/statistics, admin only).
//   perDoctor()      -> [{ doctor, total, completed, cancelled, upcoming, revenue }]
//   perDepartment()  -> [{ department, doctors, total, completed, revenue }]
//   revenue()        -> money earned (completed visits only)
//   summary()        -> the totals for the number tiles
// It only READS the shared lists, it never changes them (only the other controllers do that).
//
// Rules:
//   - "total" counts the visits that really happen or will happen: scheduled + completed.
//     Cancelled visits are counted on their own and never add to total or revenue.
//   - Revenue = the doctor's fee for every COMPLETED visit. The fee comes from the doctor
//     (POLYMORPHISM: General and Specialist doctors each answer calculateFee() their own way).

import DataStore from '../store/DataStore.js';
import Appointment from '../models/Appointment.js';

const { SCHEDULED, COMPLETED, CANCELLED } = Appointment.STATUS;

export default class StatsController {
  #store;

  /** @param {DataStore} store  the shared store (the app passes nothing, so the singleton is used) */
  constructor(store = DataStore.instance) {
    this.#store = store;
  }

  // ---------- Contract methods (README) ----------

  /** One row per doctor, in the order the doctors were added. */
  perDoctor() {
    return this.#store.doctors.map((doctor) => {
      const visits = this.#store.appointments.filter((a) => a.doctorId === doctor.id);
      const count = (status) => visits.filter((a) => a.status === status).length;
      const completed = count(COMPLETED);
      return {
        doctor,
        total: count(SCHEDULED) + completed,
        completed,
        cancelled: count(CANCELLED),
        upcoming: count(SCHEDULED),
        revenue: completed * StatsController.#fee(doctor),
      };
    });
  }

  /** One row per department (every department is listed, even one with no visits yet). */
  perDepartment() {
    const rows = this.perDoctor();
    return this.#departmentNames(rows).map((department) => {
      const mine = rows.filter((r) => r.doctor.department === department);
      return {
        department,
        doctors: mine.length,
        total: StatsController.#sum(mine, 'total'),
        completed: StatsController.#sum(mine, 'completed'),
        revenue: StatsController.#sum(mine, 'revenue'),
      };
    });
  }

  /** Money earned in EGP: the fee of every completed visit. */
  revenue() {
    return StatsController.#sum(this.perDoctor(), 'revenue');
  }

  // ---------- Extra for the number tiles ----------

  /** Totals for the whole hospital. */
  summary() {
    const rows = this.perDoctor();
    return {
      revenue: StatsController.#sum(rows, 'revenue'),
      total: StatsController.#sum(rows, 'total'),
      completed: StatsController.#sum(rows, 'completed'),
      upcoming: StatsController.#sum(rows, 'upcoming'),
      cancelled: StatsController.#sum(rows, 'cancelled'),
      doctors: rows.length,
      patients: this.#store.patients.length,
    };
  }

  // ---------- Private helpers ----------

  /** Department names from the Hospital (keeps its order); falls back to the doctors' departments. */
  #departmentNames(rows) {
    const fromHospital = (this.#store.hospital?.departments ?? []).map((d) => d.name);
    const fromDoctors = rows.map((r) => r.doctor.department);
    return [...new Set([...fromHospital, ...fromDoctors])];
  }

  static #fee(doctor) {
    return Number(doctor.calculateFee?.() ?? doctor.fee ?? 0) || 0;
  }

  static #sum(rows, key) {
    return rows.reduce((total, row) => total + row[key], 0);
  }
}
