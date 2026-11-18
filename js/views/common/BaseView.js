// Owner: Mohammed Wagdy Abdellalem (GUI general)
// The parent class of every screen. A screen = one class that extends BaseView and overrides
// render() (returns its HTML as text) and bind(root) (adds its event listeners).
// The Router does:  const view = new SomeView(ctx, params); app.innerHTML = view.render(); view.bind(app);

/** Makes text safe to put inside HTML, so a name like "<script>" shows as text and never runs. */
export const esc = (text) => String(text ?? '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[ch]));

export default class BaseView {
  /**
   * @param {object} ctx     { router, session, store, controllers } – shared by every screen
   * @param {object} params  extra data for this screen, e.g. { doctorId: 'd1' }
   */
  constructor(ctx = {}, params = {}) {
    // Abstract class: only subclasses (LoginView, Sidebar, …) may be created.
    if (new.target === BaseView) throw new Error('BaseView is abstract: create a subclass such as LoginView.');
    this.ctx = ctx;
    this.params = params || {};
  }

  /** Short name for the controllers: this.c.auth, this.c.patients, this.c.appointments … */
  get c() { return this.ctx.controllers || {}; }

  get router() { return this.ctx.router; }
  get session() { return this.ctx.session; }
  get store() { return this.ctx.store; }

  /** Override in each screen: return the screen's HTML as one string. */
  render() {
    return '<section></section>';
  }

  /** Override in each screen: add click / submit listeners inside root. */
  // eslint-disable-next-line no-unused-vars
  bind(root) {}

  /** Helper for subclasses: find one element inside the screen. */
  $(root, selector) {
    return root.querySelector(selector);
  }
}
