// Owner: Mohamed Hazem (Team Leader)
// Remembers who is signed in. One shared instance for the whole app.

import Admin from './models/Admin.js';

class Session {
  #user = null;
  #listeners = new Set();

  get user() { return this.#user; }
  get isSignedIn() { return this.#user !== null; }
  get isAdmin() { return this.#user instanceof Admin; }
  get isPatient() { return this.isSignedIn && !this.isAdmin; }
  get role() { return this.isAdmin ? 'admin' : this.isPatient ? 'patient' : 'guest'; }

  start(user) {
    this.#user = user;
    this.#emit();
  }

  end() {
    this.#user = null;
    this.#emit();
  }

  /** Call fn whenever someone signs in or out. Returns a function to stop listening. */
  onChange(fn) {
    this.#listeners.add(fn);
    return () => this.#listeners.delete(fn);
  }

  #emit() {
    this.#listeners.forEach((fn) => fn(this.#user));
  }
}

const session = new Session();
export default session;
