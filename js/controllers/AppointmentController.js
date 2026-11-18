// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Not built yet – Malak: write this class. See your task PDF and the README "Contracts" table.
//
// TODO(Malak):
//  - all({ doctorId, date, patientId, status }), forPatient(id), nextFor(patientId)
//  - freeSlots(doctorId, date) -> [{ time, free, reason }]
//  - book(patientId, doctorId, date, time) – no past dates, doctor available, no clash → SlotUnavailableError / DoctorUnavailableError
//  - cancel(id, reason), complete(id)

export default class AppointmentController {
}
