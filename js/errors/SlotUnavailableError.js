// Owner: Malak Sherif Gamal Eldeen – thrown when a time slot is already taken.
export default class SlotUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SlotUnavailableError';
  }
}
