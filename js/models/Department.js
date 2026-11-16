// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// Composition: a Department owns its list of doctors.
export default class Department {
  constructor(name) {
    this.name = name;
    this.doctors = [];
  }

  addDoctor(doctor) {
    this.doctors.push(doctor);
  }
}
