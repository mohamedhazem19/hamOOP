// Owner: Lojaine Ahmed Mohamed (Patient Module)
// Not built yet – Lojaine: write this class. See your task PDF and the README "Contracts" table.
//
// TODO(Lojaine):
//  - extends Person
//  - constructor({ id, name, phone, age, gender, password, registeredOn })
//  - #private password; checkPassword(candidate) -> true/false  (AuthController calls this)
//  - validation: age 0–120, gender Male/Female (throw InvalidInputError)
//  - getDetails() override
import Person from './Person.js';

export default class Patient extends Person {
}
