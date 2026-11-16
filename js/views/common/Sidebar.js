// Owner: Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed (GUI general) – styling
// The Router (Mohamed) decides which items appear; this component only draws them.
import BaseView, { esc } from './BaseView.js';

export default class Sidebar extends BaseView {
  render() {
    const user = this.ctx.session.user;
    const items = this.params.items.map((i) => `
      <a href="#/${i.name}" class="sidebar__link${i.active ? ' is-active' : ''}" ${i.active ? 'aria-current="page"' : ''}>${esc(i.title)}</a>`).join('');
    return `
      <div class="sidebar__brand">HAM Hospital</div>
      <nav aria-label="Main">${items}</nav>
      <div class="sidebar__footer">
        <span>Signed in as <strong>${esc(user?.name)}</strong></span>
        <button type="button" class="btn btn--ghost" data-action="logout">Log out</button>
      </div>`;
  }

  bind(root) {
    root.querySelector('[data-action="logout"]').addEventListener('click', () => {
      this.c.auth.signOut();
      this.ctx.router.go('home');
    });
  }
}
