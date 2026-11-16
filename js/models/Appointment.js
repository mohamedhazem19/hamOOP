// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)

// TODO(Malak):
//  - private fields + getters
//  - cancel() and complete() should refuse if the appointment is not Scheduled
export default class Appointment {
  static SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
  static STATUS = Object.freeze({ SCHEDULED: 'Scheduled', COMPLETED: 'Completed', CANCELLED: 'Cancelled' });

  constructor({ id, patientId, doctorId, date, time, status = Appointment.STATUS.SCHEDULED, cancelReason = '' }) {
    this.id = id;
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.date = date;   // 'YYYY-MM-DD'
    this.time = time;   // 'HH:MM'
    this.status = status;
    this.cancelReason = cancelReason;
  }

  cancel(reason) {
    this.status = Appointment.STATUS.CANCELLED;
    this.cancelReason = reason;
  }

  complete() {
    this.status = Appointment.STATUS.COMPLETED;
  }

  get isScheduled() {
    return this.status === Appointment.STATUS.SCHEDULED;
  }
}
