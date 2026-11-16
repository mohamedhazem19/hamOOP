// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// A mixin: JavaScript has no interfaces, so we add getSlots() to a class with a function.
// Usage idea: class Doctor extends Schedulable(Person) { ... }
// TODO(Rodina): decide whether Doctor uses this mixin; keep SLOTS in sync with Appointment.SLOTS.
const Schedulable = (Base) => class extends Base {
  getSlots(date) {
    return this.isAvailable?.(date) === false ? [] : ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
  }
};

export default Schedulable;
