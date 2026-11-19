   // Owner: Nourhan Alaa Eldin
// HAM Hospital - Login View

import BaseView from './common/BaseView.js';

export default class LoginView extends BaseView {

  render() {
    return `
      <section class="auth-screen">

        <div class="auth-card">

          <!-- LEFT GREEN PANEL -->
          <aside class="auth-brand-panel">

            <a href="#/home" class="auth-brand">

              <img
                src="assets/images/logo.svg"
                alt="HAM Hospital Logo"
                class="auth-brand-logo"
              >

              <span>HAM Hospital</span>

            </a>

            <div class="auth-brand-copy">

              <h1>
                Your care,
                <span>one click away</span>
              </h1>

              <p>
                Book visits with our doctors, track your appointments
                and read your medical reports anytime.
              </p>

            </div>

            <p class="auth-tagline">
              Your Health, Our Priority
            </p>

          </aside>


          <!-- RIGHT LOGIN PANEL -->
          <div class="auth-form-panel">

            <!-- Back Home -->
            <a href="#/home" class="auth-back-link">
              <span>←</span> Back to home
            </a>


            <!-- Tabs -->
            <nav class="auth-tabs">

              <a
                href="#/login"
                class="auth-tab is-active"
                aria-current="page"
              >
                Sign in
              </a>

              <a
                href="#/signup"
                class="auth-tab"
              >
                Create account
              </a>

            </nav>


            <!-- Heading -->
            <div class="auth-heading">

              <h2>Welcome back</h2>

              <p>
                Sign in to manage your appointments.
              </p>

            </div>


            <!-- Login Form -->
            <form class="auth-form" novalidate>

              <!-- Phone -->
              <div class="auth-field">

                <label for="login-phone">
                  Phone number
                </label>

                <input
                  id="login-phone"
                  name="phone"
                  type="tel"
                  inputmode="tel"
                  autocomplete="username"
                  placeholder="01012345678"
                  required
                >

              </div>


              <!-- Password -->
              <div class="auth-field">

                <label for="login-password">
                  Password
                </label>

                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  required
                >

              </div>


              <!-- Error Message -->
              <p
                class="auth-error"
                role="alert"
                aria-live="polite"
                hidden
              ></p>


              <!-- Submit -->
              <button
                type="submit"
                class="auth-submit"
              >

                <span>Sign in</span>

                <span aria-hidden="true">→</span>

              </button>

            </form>


            <!-- Create Account -->
            <p class="auth-signup-prompt">

              New here?

              <a href="#/signup">
                Create an account
              </a>

            </p>


            <!-- Demo Credentials -->
            <p class="auth-demo-hint">
              Demo patient: 01012345678 · password 1234
            </p>

          </div>

        </div>

      </section>
    `;
  }


  bind(root) {

    const form = this.$(root, '.auth-form');

    const phoneInput = this.$(root, '#login-phone');

    const passwordInput = this.$(root, '#login-password');

    const errorMessage = this.$(root, '.auth-error');

    const submitButton = this.$(root, '.auth-submit');


    // Hide previous error when user starts another attempt
    const hideError = () => {

      errorMessage.hidden = true;

      errorMessage.textContent = '';

    };

    phoneInput.addEventListener('input', hideError);

    passwordInput.addEventListener('input', hideError);


    // Navigation: Create Account
    root.querySelectorAll('a[href="#/signup"]').forEach(link => {

      link.addEventListener('click', event => {

        event.preventDefault();

        this.router.go('signup');

      });

    });


    // Navigation: Home
    root.querySelectorAll('a[href="#/home"]').forEach(link => {

      link.addEventListener('click', event => {

        event.preventDefault();

        this.router.go('home');

      });

    });


    // Login Submit
    form.addEventListener('submit', event => {

      event.preventDefault();

      hideError();

      const phone = phoneInput.value.trim();

      const password = passwordInput.value;


      // Prevent empty submission
      if (!phone || !password) {

        errorMessage.textContent =
          'Wrong phone number or password.';

        errorMessage.hidden = false;

        return;

      }


      submitButton.disabled = true;


      try {

        // Use existing AuthController
        const user = this.c.auth.signIn(phone, password);


        // Navigate according to authenticated user
        if (this.session.role === 'admin') {

          this.router.go('dashboard');

        }

        else if (this.session.role === 'patient') {

          this.router.go(
            this.params.next || 'my-appointments'
          );

        }

      }

      catch (error) {

        // Generic error message
        errorMessage.textContent =
          'Wrong phone number or password.';

        errorMessage.hidden = false;

        // Keep phone number unchanged
        passwordInput.value = '';

        passwordInput.focus();

      }

      finally {

        submitButton.disabled = false;

      }

    });

  }

}
