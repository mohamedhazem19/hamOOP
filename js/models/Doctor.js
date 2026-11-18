// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// Not built yet – Rodina: write this class. See your task PDF and the README "Contracts" table.
//
// TODO(Rodina):
//  - extends Person; abstract (throw if new.target === Doctor)
//  - constructor({ id, name, phone, department, fee, photo, offDays })
//  - calculateFee() – abstract, subclasses override
//  - isAvailable(date) -> false on days off
//  - #private fields + getters, fee > 0
import Person from './Person.js';

export default class Doctor extends Person {
}
