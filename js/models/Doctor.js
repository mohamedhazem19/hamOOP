// Owner: Rodina Elsayed Mohamed (Doctor Registration)
import Person from './Person.js';

// TODO(Rodina):
//  - make Doctor abstract (throw if new.target === Doctor)
//  - private fields + getters/setters with validation (fee > 0)
//  - mix in Schedulable (see Schedulable.js) for getSlots(date)
export default class Doctor extends Person {
  constructor({ id, name, phone, department, fee, photo = '', offDays = [] }) {
    super(id, name, phone);
    this.department = department;
    this.baseFee = fee;
    this.photo = photo;          // image path or data URL from an upload
    this.offDays = [...offDays]; // ['YYYY-MM-DD', ...]
  }

  get type() { return 'Doctor'; }

  // Abstract: GeneralDoctor and SpecialistDoctor override this.
  calculateFee() {
    throw new Error('calculateFee() must be implemented by a subclass');
  }

  isAvailable(date) {
    return !this.offDays.includes(date);
  }
}
