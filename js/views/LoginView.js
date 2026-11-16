// Owner: Nourhan Alaa Eldin & Rotage Waleed Ahmed (Login & Dashboard) – Nourhan leads
// Week-1 starter from the Team Leader: a plain working form so sign-in can be tested.
// TODO(Nourhan): replace the HTML with the real design (tabs, green panel) – see your task PDF.
import BaseView from './common/BaseView.js';

export default class LoginView extends BaseView {
  render() {
    return `
      <section class="placeholder">
        <p class="placeholder__tag">Starter form · design to be built by Nourhan &amp; Rotage</p>
        <h1>Sign in</h1>
        <form id="login-form" class="stack" novalidate>
          <label>Phone number <input name="phone" autocomplete="username" placeholder="01XXXXXXXXX"></label>
          <label>Password <input name="password" type="password" autocomplete="current-password"></label>
          <p class="error" id="login-error" role="alert" hidden></p>
          <button class="btn" type="submit">Sign in</button>
        </form>
        <p>New here? <a href="#/signup">Create an account</a></p>
        <p class="muted">Demo patient: 01012345678 / 1234 · Admin: ADMIN / 1234</p>
      </section>`;
  }

  bind(root) {
    const form = root.querySelector('#login-form');
    const error = root.querySelector('#login-error');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      try {
        this.c.auth.signIn(data.get('phone'), data.get('password'));
        // Admin -> dashboard. Patient -> the page they wanted (e.g. booking from Home) or My Appointments.
        const next = this.ctx.session.isAdmin ? 'dashboard' : (this.params.next || 'my-appointments');
        this.ctx.router.go(next, this.params);
      } catch (err) {
        error.textContent = err.message;
        error.hidden = false;
      }
    });
  }
}
