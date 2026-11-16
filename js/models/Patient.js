// Owner: Lojaine Ahmed Mohamed (Patient Module)
import Person from './Person.js';

// TODO(Lojaine):
//  - make password a #private field (never readable from outside)
//  - add validation in setters (age 0–120, gender Male/Female) that throw InvalidInputError
//  - add toJSON() if we turn on localStorage saving (private fields are not saved by JSON.stringify)
export default class Patient extends Person {
  constructor({ id, name, phone, age, gender, password, registeredOn }) {
    super(id, name, phone);
    this.age = age;
    this.gender = gender;
    this.password = password;           // TODO(Lojaine): make private
    this.registeredOn = registeredOn;   // 'YYYY-MM-DD'
  }

  // Contract used by AuthController (Mohamed). Keep this method name.
  checkPassword(candidate) {
    return this.password === candidate;
  }

  getDetails() {
    return `${this.name}, ${this.age} years, ${this.gender}`;
  }
}
