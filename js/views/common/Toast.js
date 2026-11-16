// Owner: Belal Mohamed Ahmed (GUI general)
// Week-1 starter. TODO(Belal): slide-down animation, close button, auto-hide timing.
export default class Toast {
  static show(message, type = 'ok') {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', type === 'err' ? 'alert' : 'status');
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}
