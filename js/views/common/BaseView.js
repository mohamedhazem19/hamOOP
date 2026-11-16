// Owner: Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed (GUI general)
// Week-1 starter from the Team Leader. Every screen extends BaseView.
//
//   class MyView extends BaseView {
//     render() { return `<section>...</section>`; }   // return HTML text
//     bind(root) { root.querySelector('button').addEventListener('click', ...); }
//   }
//
// this.ctx gives you: router, session, store, controllers { auth, patients, doctors, appointments, reports, stats }

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default class BaseView {
  constructor(ctx, params = {}) {
    this.ctx = ctx;
    this.params = params;
  }

  get c() { return this.ctx.controllers; }

  render() {
    return '';
  }

  bind(_root) {}

  /** Temporary screen used until the owner builds the real one (see their task PDF). */
  placeholder({ title, owners, pdf, checks = [] }) {
    return `
      <section class="placeholder">
        <p class="placeholder__tag">Placeholder · to be built</p>
        <h1>${esc(title)}</h1>
        <p><strong>Owner:</strong> ${esc(owners)}</p>
        <p>Build this screen to match the screenshots in <em>${esc(pdf)}</em>.</p>
        ${checks.length ? `<h2>Contract check (data your screen will use)</h2><ul>${checks.map((c) => `<li>${c}</li>`).join('')}</ul>` : ''}
      </section>`;
  }
}
