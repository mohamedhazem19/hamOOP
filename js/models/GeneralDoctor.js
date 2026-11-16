// Owner: Rodina Elsayed Mohamed (Doctor Registration)
import Doctor from './Doctor.js';

export default class GeneralDoctor extends Doctor {
  get type() { return 'General'; }

  // TODO(Rodina): final fee rule for general doctors
  calculateFee() {
    return this.baseFee;
  }
}
