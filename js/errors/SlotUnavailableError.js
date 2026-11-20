// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Thrown by AppointmentController when a time slot is already taken: either the doctor
// or the patient already has an appointment at that date and time.

export default class SlotUnavailableError extends Error {
  /**
   * @param {string} message  what the user sees, e.g. "Dr. Sara Nabil is already booked at 10:00 …"
   * @param {'doctor'|'patient'} who  whose calendar caused the clash (lets a view react to it)
   */
  constructor(message = 'This time slot is already booked.', who = 'doctor') {
    super(message);
    this.name = 'SlotUnavailableError';
    this.who = who;
  }
}
