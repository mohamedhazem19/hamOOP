// Owner: Lojaine Ahmed Mohamed (Patient Module)
// Not built yet – Lojaine: write this class. See your task PDF and the README "Contracts" table.
//
// TODO(Lojaine):
//  - all(), findById(id), findByPhone(phone)  – AuthController needs findByPhone for patient sign in
//  - newest(n) – newest registrations first (dashboard)
//  - register({ name, phone, age, gender, password }) -> Patient; throw InvalidInputError (name ≥ 3, phone 01 + 9 digits and not used, age 0–120)
//  - delete(id) – refuse if the patient still has Scheduled appointments
//  - use DataStore.instance.patients and DataStore.instance.nextId("p")

export default class PatientController {
}
