// Owner: Lojaine Ahmed Mohamed – thrown when user input breaks a rule.
export default class InvalidInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidInputError';
  }
}
