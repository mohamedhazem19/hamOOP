// Owner: Loay Hossam
// One medical scan or test result (X-ray, bone density, ECG, blood test).
import Record from "./Record.js";
import InvalidInputError from "../errors/InvalidInputError.js";

const TYPE_LABELS = {
  xray: "X-ray (bone scan)",
  dexa: "Bone density scan",
  ecg: "ECG",
  lab: "Blood test",
};

export default class Scan extends Record {
  #type;
  #name;
  #finding;
  #imagePath;

  constructor({ id, type, name, finding = "", imagePath = "" } = {}) {
    super(id);
    if (!Object.hasOwn(TYPE_LABELS, type)) {
      throw new InvalidInputError(
        `type must be one of: ${Object.keys(TYPE_LABELS).join(", ")}`,
        "type"
      );
    }
    this.#type = type;
    this.name = name; // goes through the setter, so it is validated
    this.finding = finding;
    this.#imagePath = String(imagePath ?? "");
  }

  static get TYPES() {
    return Object.keys(TYPE_LABELS);
  }

  get type() {
    return this.#type;
  }

  get typeLabel() {
    return TYPE_LABELS[this.#type];
  }

  get name() {
    return this.#name;
  }
  set name(value) {
    const text = String(value ?? "").trim();
    if (!text) throw new InvalidInputError("Scan name is required", "name");
    this.#name = text;
  }

  get finding() {
    return this.#finding;
  }
  set finding(value) {
    this.#finding = String(value ?? "").trim(); // may be empty
  }

  get imagePath() {
    return this.#imagePath;
  }

  /** Plain object for DataStore.save(): private fields are not seen by JSON.stringify. */
  toJSON() {
    return { id: this.id, type: this.#type, name: this.#name, finding: this.#finding, imagePath: this.#imagePath };
  }

  // Polymorphism: Scan's own version of describe()
  describe() {
    return `${this.typeLabel}: ${this.name}`;
  }
}
