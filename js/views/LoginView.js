  // Owner: Nourhan Alaa Eldin & Rotage Waleed Ahmed (Login & Dashboard)
// Sign in screen (#/login). The HTML is built here in JavaScript: render() returns the text,
// bind(root) adds the listeners. Styles: css/views/auth.css (shared with SignUpView).
//
// Uses: this.c.auth.signIn(phone, password)  (Mohamed's AuthController)
//       this.router.go(...)                   (Mohamed's Router)

import BaseView, { esc } from './common/BaseView.js';

// Programming mistakes (not wrong user input) must never be shown to the patient as text.
const SYSTEM_ERRORS = [TypeError, ReferenceError, RangeError, SyntaxError];
const GENERIC_ERROR = 'Something went wrong. Please try again.';

export default class LoginView extends BaseView {
  render() {
    return `
      <section class="auth" aria-labelledby="login-title">
        <div class="auth-card">
          ${this.#panel()}
          <div class="auth-main">
            <a class="auth-back" href="#/home">← Back to home</a>

            <nav class="auth-tabs" aria-label="Sign in or create account">
              <a class="auth-tab is-active" href="#/login" aria-current="page">Sign in</a>
              <a class="auth-tab" href="#/signup">Create account</a>
            </nav>

            <h1 class="auth-title" id="login-title">Welcome back</h1>
            <p class="auth-subtitle">Sign in to manage your appointments.</p>

            <form class="auth-form" id="login-form" novalidate>
              <div class="auth-field">
                <label for="login-phone">Phone number</label>
                <input class="auth-input" id="login-phone" name="phone" type="text"
                       autocomplete="username" placeholder="e.g. 01012345678">
              </div>
              <div class="auth-field">
                <label for="login-password">Password</label>
                <input class="auth-input" id="login-password" name="password" type="password"
                       autocomplete="current-password">
              </div>

              <p class="auth-error" data-error role="alert" hidden></p>

              <button type="submit" class="auth-submit">Sign in →</button>
            </form>

            <p class="auth-switch">New here? <a href="#/signup">Create an account</a></p>
            <p class="auth-demo">Demo patient: 01012345678 · password 1234</p>
          </div>
        </div>
      </section>`;
  }

  bind(root) {
    const form = this.$(root, '#login-form');
    const phone = this.$(root, '#login-phone');
    const password = this.$(root, '#login-password');
    const error = this.$(root, '[data-error]');

    const clearError = () => {
      error.hidden = true;
      error.textContent = '';
      phone.removeAttribute('aria-invalid');
      password.removeAttribute('aria-invalid');
    };

    // The error disappears as soon as the user starts typing again.
    form.addEventListener('input', clearError);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      clearError();
      try {
        const user = this.c.auth.signIn(phone.value, password.value);
        this.#afterSignIn(user);
      } catch (err) {
        const isSystem = SYSTEM_ERRORS.some((Type) => err instanceof Type);
        if (isSystem) console.error(err);
        // One message for every failure; the phone number the user typed stays in the field.
        error.textContent = isSystem || !err?.message ? GENERIC_ERROR : err.message;
        error.hidden = false;
        phone.setAttribute('aria-invalid', 'true');
        password.setAttribute('aria-invalid', 'true');
        password.focus();
        password.select();
      }
    });
  }

  /** ADMIN goes to the dashboard; a patient goes back to the page they wanted, or My Appointments. */
  #afterSignIn() {
    if (this.session?.isAdmin) this.router.go('dashboard');
    else this.router.go(this.params.next || 'my-appointments');
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
