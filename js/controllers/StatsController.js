// Owner: Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed (GUI general)
// Week-1 starter from the Team Leader. TODO(Wagdy/Belal): add what the Statistics page needs.

import DataStore from '../store/DataStore.js';

export default class StatsController {
  constructor() {
    this.store = DataStore.instance;
  }

  #live() { return this.store.appointments.filter((a) => a.status !== 'Cancelled'); }

  /** [{ doctor, total, completed, revenue }] */
  perDoctor() {
    return this.store.doctors.map((doctor) => {
      const mine = this.#live().filter((a) => a.doctorId === doctor.id);
      const completed = mine.filter((a) => a.status === 'Completed').length;
      return { doctor, total: mine.length, completed, revenue: completed * doctor.calculateFee() };
    });
  }

  /** [{ department, total }] */
  perDepartment() {
    return this.store.hospital.departments.map((d) => ({
      department: d.name,
      total: this.#live().filter((a) => this.store.findDoctor(a.doctorId)?.department === d.name).length,
    }));
  }

  revenue() {
    return this.perDoctor().reduce((sum, row) => sum + row.revenue, 0);
  }
}
