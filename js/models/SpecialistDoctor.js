// Owner: Rodina Elsayed Mohamed (Doctor Registration)
import Doctor from './Doctor.js';

export default class SpecialistDoctor extends Doctor {
  constructor(data) {
    super(data);
    this.specialty = data.specialty || '';
  }

  get type() { return 'Specialist'; }

  // TODO(Rodina): final fee rule for specialists
  calculateFee() {
    return this.baseFee;
  }
}
