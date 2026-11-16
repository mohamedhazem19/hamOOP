// Owner: Lojaine Ahmed Mohamed (Patient Module)
import Person from './Person.js';

// The only admin account. Sign in with ADMIN / 1234 (handled in AuthController).
export default class Admin extends Person {
  constructor() {
    super('admin', 'Admin', 'ADMIN');
    this.username = 'ADMIN';
  }

  getDetails() {
    return 'Hospital administrator';
  }
}
