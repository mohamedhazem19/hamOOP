// Owner: Mohammed Wagdy Abdellalem (GUI general)
// The menu on the left after signing in. The Router decides which items to show
// (only pages the signed-in role may open) and passes them in params.items.

import BaseView, { esc } from './BaseView.js';

export default class Sidebar extends BaseView {
  /** params.items = [{ name: 'dashboard', title: 'Dashboard', active: true }, …] */
  get items() { return this.params.items || []; }

  render() {
    const user = this.session?.user;
    const who = user?.name || (this.session?.isAdmin ? 'Admin' : 'Guest');
    const role = this.session?.isAdmin ? 'Admin' : 'Patient';

    const links = this.items.map((item) => `
        <li>
          <a href="#/${esc(item.name)}" class="sidebar__link${item.active ? ' is-active' : ''}"${item.active ? ' aria-current="page"' : ''}>
            ${esc(item.title)}
          </a>
        </li>`).join('');

    return `
      <div class="sidebar__brand">
        <img src="assets/images/logo.svg" alt="" width="32" height="32">
        <strong>HAM Hospital</strong>
      </div>
      <nav class="sidebar__nav" aria-label="Main">
        <ul>${links}</ul>
      </nav>
      <div class="sidebar__user">
        <p>Signed in as <strong>${esc(who)}</strong> <span class="sidebar__role">${role}</span></p>
        <button type="button" class="btn btn--ghost" data-action="logout">Log out</button>
      </div>`;
  }

  bind(root) {
    const logout = root.querySelector('[data-action="logout"]');
    logout?.addEventListener('click', () => {
      this.c.auth?.signOut();
      this.router?.go('home');
    });
  }
}
