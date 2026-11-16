// Owner: Nourhan Alaa Eldin & Rotage Waleed Ahmed (Login & Dashboard) – Rotage leads
// Week-1 starter from the Team Leader: a plain working form so sign-up can be tested.
// TODO(Rotage): real design (tabs, two-column age/gender, green panel) – see your task PDF.
import BaseView from './common/BaseView.js';
import Toast from './common/Toast.js';

export default class SignUpView extends BaseView {
  render() {
    return `
      <section class="placeholder">
        <p class="placeholder__tag">Starter form · design to be built by Rotage &amp; Nourhan</p>
        <h1>Create your account</h1>
        <form id="signup-form" class="stack" novalidate>
          <label>Full name <input name="name" autocomplete="name"></label>
          <label>Phone number <input name="phone" type="tel" placeholder="01XXXXXXXXX"></label>
          <label>Age <input name="age" type="number" min="0" max="120"></label>
          <label>Gender <select name="gender"><option>Female</option><option>Male</option></select></label>
          <label>Password <input name="password" type="password" autocomplete="new-password"></label>
          <label>Confirm password <input name="confirmPassword" type="password" autocomplete="new-password"></label>
          <p class="error" id="signup-error" role="alert" hidden></p>
          <button class="btn" type="submit">Create account</button>
        </form>
        <p>Already have an account? <a href="#/login">Sign in</a></p>
      </section>`;
  }

  bind(root) {
    const form = root.querySelector('#signup-form');
    const error = root.querySelector('#signup-error');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const patient = this.c.auth.signUp(Object.fromEntries(new FormData(form)));
        Toast.show(`Welcome, ${patient.name.split(' ')[0]}! Your account is ready.`);
        this.ctx.router.go('my-appointments');
      } catch (err) {
        error.textContent = err.message;
        error.hidden = false;
      }
    });
  }
}
