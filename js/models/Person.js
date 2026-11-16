// Owner: Lojaine Ahmed Mohamed (Patient Module)
// Week-1 skeleton from the Team Leader so the app runs. Lojaine: complete the TODOs.
//
// TODO(Lojaine):
//  - make Person abstract: throw an Error if someone calls `new Person(...)` directly (check new.target)
//  - turn id, name, phone into #private fields with getters (and a validated setter for phone)
//  - keep getDetails() so subclasses can override it (polymorphism)
export default class Person {
  constructor(id, name, phone) {
    this.id = id;
    this.name = name;
    this.phone = phone;
  }

  getDetails() {
    return `${this.name} (${this.phone})`;
  }
}
