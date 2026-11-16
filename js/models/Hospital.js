// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// Composition: the Hospital owns its departments.
export default class Hospital {
  constructor(name) {
    this.name = name;
    this.departments = [];
  }

  addDepartment(department) {
    this.departments.push(department);
  }

  getDepartment(name) {
    return this.departments.find((d) => d.name === name) || null;
  }
}
