// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Thrown by AppointmentController when someone tries to book a doctor on a day off.

export default class DoctorUnavailableError extends Error {
  constructor(message = 'The doctor is not available on this day.') {
    super(message);
    this.name = 'DoctorUnavailableError';
  }
}
