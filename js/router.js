// Owner: Mohamed Hazem (Team Leader)
// Hash-based router for our single page: #/home, #/login, #/dashboard ...
// It shows one view inside <main id="app">, builds the sidebar for the signed-in role,
// and blocks pages the current user is not allowed to see.

import session from './session.js';
import Sidebar from './views/common/Sidebar.js';

export const ACCESS = Object.freeze({ PUBLIC: 'public', PATIENT: 'patient', ADMIN: 'admin' });

export default class Router {
  #routes = new Map();
  #appEl;
  #sidebarEl;
  #context;
  #current = null;

  constructor({ appEl, sidebarEl, context }) {
    this.#appEl = appEl;
    this.#sidebarEl = sidebarEl;
    this.#context = { ...context, router: this };
    window.addEventListener('hashchange', () => this.#resolve());
    session.onChange(() => this.#renderSidebar());
  }

  /**
   * Register a page.
   * @param {string} name     url name, e.g. 'dashboard'  ->  #/dashboard
   * @param {class}  View     a class that extends BaseView
   * @param {object} options  { access: ACCESS.* or [ACCESS.PATIENT, ACCESS.ADMIN], title: 'Dashboard', nav: true }
   *                          Sidebar order = the order you register routes in.
   */
  register(name, View, { access = ACCESS.PUBLIC, title = name, nav = false } = {}) {
    const roles = Array.isArray(access) ? access : [access];
    this.#routes.set(name, { name, View, access: roles, title, nav });
    return this;
  }

  /** Go to a page. Params are kept for the next view, e.g. go('booking', { doctorId: 'd1' }). */
  go(name, params = {}) {
    this.params = params;
    if (location.hash === `#/${name}`) this.#resolve();
    else location.hash = `#/${name}`;
  }

  start(defaultName = 'home') {
    this.defaultName = defaultName;
    this.#renderSidebar();
    this.#resolve();
  }

  get current() { return this.#current; }

  /** Pure rule, easy to test: may this role open this route? */
  static canAccess(route, role) {
    const roles = Array.isArray(route.access) ? route.access : [route.access];
    return roles.includes(ACCESS.PUBLIC) || roles.includes(role);
  }

  /** Where to send someone who may not open a page. */
  static fallbackFor(role) {
    if (role === 'admin') return 'dashboard';
    if (role === 'patient') return 'my-appointments';
    return 'login';
  }

  #resolve() {
    const name = (location.hash.replace(/^#\/?/, '').split('?')[0]) || this.defaultName;
    const route = this.#routes.get(name);
    if (!route) return this.go(this.defaultName);

    if (!Router.canAccess(route, session.role)) {
      return this.go(Router.fallbackFor(session.role));
    }

    this.#current = route;
    const view = new route.View(this.#context, this.params || {});
    this.params = {};
    this.#appEl.innerHTML = view.render();
    view.bind(this.#appEl);
    document.title = `${route.title} · HAM Hospital`;
    this.#appEl.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    this.#renderSidebar();
  }

  #renderSidebar() {
    const signedIn = session.isSignedIn && this.#current && !this.#current.access.includes(ACCESS.PUBLIC);
    this.#sidebarEl.hidden = !signedIn;
    if (!signedIn) { this.#sidebarEl.innerHTML = ''; return; }
    const items = [...this.#routes.values()]
      .filter((r) => r.nav && r.access.includes(session.role))
      .map((r) => ({ name: r.name, title: r.title, active: r.name === this.#current?.name }));
    const sidebar = new Sidebar(this.#context, { items });
    this.#sidebarEl.innerHTML = sidebar.render();
    sidebar.bind(this.#sidebarEl);
  }
}
