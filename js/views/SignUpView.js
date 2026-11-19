  // Owner: Nourhan Alaa Eldin & Rotage Waleed Ahmed (Login & Dashboard)
// Create account screen (#/signup). The HTML is built here in JavaScript: render() returns the text,
// bind(root) adds the listeners. Styles: css/views/auth.css (shared with LoginView).
//
// Uses: this.c.auth.signUp(data)  (Mohamed's AuthController, which calls PatientController.register)
//       Toast.show(...)           (Belal) – skipped automatically until Belal has written it
//       this.router.go(...)       (Mohamed's Router)

import BaseView, { esc } from './common/BaseView.js';
import Toast from './common/Toast.js';

const SYSTEM_ERRORS = [TypeError, ReferenceError, RangeError, SyntaxError];
const GENERIC_ERROR = 'Something went wrong. Please try again.';

export default class SignUpView extends BaseView {
  render() {
    return `
      <section class="auth" aria-labelledby="signup-title">
        <div class="auth-card">
          ${this.#panel()}
          <div class="auth-main">
            <a class="auth-back" href="#/home">← Back to home</a>

            <nav class="auth-tabs" aria-label="Sign in or create account">
              <a class="auth-tab" href="#/login">Sign in</a>
              <a class="auth-tab is-active" href="#/signup" aria-current="page">Create account</a>
            </nav>

            <h1 class="auth-title" id="signup-title">Create your account</h1>
            <p class="auth-subtitle">It takes less than a minute.</p>

            <form class="auth-form" id="signup-form" novalidate>
              <div class="auth-field">
                <label for="signup-name">Full name</label>
                <input class="auth-input" id="signup-name" name="name" type="text" autocomplete="name">
              </div>
              <div class="auth-field">
                <label for="signup-phone">Phone number</label>
                <input class="auth-input" id="signup-phone" name="phone" type="tel" autocomplete="tel">
              </div>
              <div class="auth-row">
                <div class="auth-field">
                  <label for="signup-age">Age</label>
                  <input class="auth-input" id="signup-age" name="age" type="number" inputmode="numeric" min="0" max="120">
                </div>
                <div class="auth-field">
                  <label for="signup-gender">Gender</label>
                  <select class="auth-input auth-select" id="signup-gender" name="gender">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div class="auth-field">
                <label for="signup-password">Password</label>
                <input class="auth-input" id="signup-password" name="password" type="password" autocomplete="new-password">
              </div>
              <div class="auth-field">
                <label for="signup-confirm">Confirm password</label>
                <input class="auth-input" id="signup-confirm" name="confirmPassword" type="password" autocomplete="new-password">
              </div>

              <p class="auth-error" data-error role="alert" hidden></p>

              <button type="submit" class="auth-submit">Create account →</button>
            </form>

            <p class="auth-switch">Already have an account? <a href="#/login">Sign in</a></p>
          </div>
        </div>
      </section>`;
  }

  bind(root) {
    const form = this.$(root, '#signup-form');
    const error = this.$(root, '[data-error]');

    const clearError = () => {
      error.hidden = true;
      error.textContent = '';
      form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
    };

    form.addEventListener('input', clearError);
    form.addEventListener('change', clearError);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      clearError();
      const value = (name) => form.elements[name].value;
      const age = value('age').trim();

      try {
        // The controller checks every rule and throws a message we can show as it is.
        const patient = this.c.auth.signUp({
          name: value('name'),
          phone: value('phone'),
          age: age === '' ? '' : Number(age),
          gender: value('gender'),
          password: value('password'),
          confirmPassword: value('confirmPassword'),
        });
        this.router.go('my-appointments');
        const firstName = String(patient?.name || '').split(' ')[0];
        if (typeof Toast?.show === 'function') {
          Toast.show(`Welcome to HAM Hospital${firstName ? `, ${firstName}` : ''}!`, 'ok');
        }
      } catch (err) {
        const isSystem = SYSTEM_ERRORS.some((Type) => err instanceof Type);
        if (isSystem) console.error(err);
        error.textContent = isSystem || !err?.message ? GENERIC_ERROR : err.message;
        error.hidden = false;
        this.#markField(form, err);
      }
    });
  }

  /** Highlights the field the message is about (InvalidInputError can carry the field name). */
  #markField(form, err) {
    let name = err?.field;
    const message = String(err?.message || '');
    if (!name) {
      if (/do not match/i.test(message)) name = 'confirmPassword';
      else if (/^password/i.test(message)) name = 'password';
      else if (/phone/i.test(message)) name = 'phone';
      else if (/name/i.test(message)) name = 'name';
      else if (/age/i.test(message)) name = 'age';
    }
    const input = name ? form.elements[name] : null;
    if (!input) return;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }

  /** Left green panel: logo, headline, short text and the handwritten line. */
  #panel() {
    return `
          <aside class="auth-panel">
            <div class="auth-brand">
              <svg class="auth-brand__logo" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <path d="M12 21c0-6.5 3.2-11.5 9-13.5-.8 7.2-4 12.2-9 13.5z" fill="#5fcf9f"/>
                <path d="M12 21C12 14.5 8.8 9.5 3 7.5c.8 7.2 4 12.2 9 13.5z" fill="#e8f3ee"/>
              </svg>
              <strong>${esc('HAM Hospital')}</strong>
            </div>
            <div class="auth-panel__body">
              <h2 class="auth-headline">Your care, <span>one click away</span></h2>
              <p class="auth-lead">Book visits with our doctors, track your appointments and read your medical reports anytime.</p>
            </div>
            <p class="auth-tagline">Your Health, Our Priority</p>
          </aside>`;
  }
}
