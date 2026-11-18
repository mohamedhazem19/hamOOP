// Owner: Mohamed Hazem (Team Leader)
// Hash-based router for our single page: #/home, #/login, #/dashboard ...
// It shows one view inside <main id="app">, builds the sidebar for the signed-in role,
// and blocks pages the current user is not allowed to see.

import session from './session.js';
import Sidebar from './views/common/Sidebar.js';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// A screen is "built" once its owner gives the view class a render() method.
const isBuilt = (View) => typeof View?.prototype?.render === 'function';

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
    const params = this.params || {};
    this.params = {};
    if (isBuilt(route.View)) {
      const view = new route.View(this.#context, params);
      this.#appEl.innerHTML = view.render();
      view.bind?.(this.#appEl);
    } else {
      this.#appEl.innerHTML = Router.notBuiltPage(route, this.#otherPages());
    }
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
    if (isBuilt(Sidebar)) {
      const sidebar = new Sidebar(this.#context, { items });
      this.#sidebarEl.innerHTML = sidebar.render();
      sidebar.bind?.(this.#sidebarEl);
      return;
    }
    // Plain menu until Wagdy builds Sidebar.js
    this.#sidebarEl.innerHTML = `
      <strong>HAM Hospital</strong>
      <nav aria-label="Main"><ul>${items.map((i) => `<li><a href="#/${i.name}"${i.active ? ' aria-current="page"' : ''}>${esc(i.title)}</a></li>`).join('')}</ul></nav>
      <p>Signed in as ${esc(session.user?.name || session.role)}</p>
      <button type="button" data-action="logout">Log out</button>`;
    this.#sidebarEl.querySelector('[data-action="logout"]').addEventListener('click', () => {
      this.#context.controllers?.auth?.signOut();
      this.go('home');
    });
  }

  /** Links to the other pages, so the app can be explored before the screens are built. */
  #otherPages() {
    return [...this.#routes.values()].filter((r) => Router.canAccess(r, session.role) && r !== this.#current);
  }

  /** Shown for a page whose view class has no render() yet. */
  static notBuiltPage(route, others = []) {
    return `
      <section>
        <h1>${esc(route.title)}</h1>
        <p><strong>Not built yet.</strong> The owner of this screen writes it in <code>js/views/${esc(route.View?.name || '')}.js</code> (see the README).</p>
        ${others.length ? `<p>Other pages: ${others.map((r) => `<a href="#/${r.name}">${esc(r.title)}</a>`).join(' · ')}</p>` : ''}
      </section>`;
  }
}
