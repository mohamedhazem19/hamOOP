// Owner: Loay Hossam
// Abstract parent of Scan and MedicalReport (shared id + describe() contract).
import InvalidInputError from "../errors/InvalidInputError.js";

export default class Record {
  #id;

  constructor(id) {
    // Abstraction: nobody can create a plain "Record"
    if (new.target === Record) {
      throw new Error("Record is abstract: create a Scan or a MedicalReport instead.");
    }
    if (id === undefined || id === null || String(id).trim() === "") {
      throw new InvalidInputError("id is required", "id");
    }
    this.#id = id;
  }

  // Encapsulation: id can be read but never changed
  get id() {
    return this.#id;
  }

  // Every child must override this (Polymorphism)
  describe() {
    throw new Error(`${this.constructor.name} must override describe()`);
  }
}
