// Owner: Malak Sherif Gamal Eldeen – thrown when booking a doctor on a day off.
export default class DoctorUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DoctorUnavailableError';
  }
}
