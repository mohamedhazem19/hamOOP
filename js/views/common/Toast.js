// Owner: Belal Mohamed Ahmed (GUI general)
// Toast.show(message, 'ok' | 'err') – a short message at the top of the page that hides itself.
// Lives in #toast-root (index.html). 'error' also counts as red, because Registrations uses that name.

import animate from './animate.js';

export default class Toast {
  static show(message, type = 'ok', duration = 4000) {
    let box = document.getElementById('toast-root');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast-root';
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    const isError = type === 'err' || type === 'error';
    const t = document.createElement('div');
    t.className = 'toast toast-' + (isError ? 'err' : 'ok');
    t.setAttribute('role', isError ? 'alert' : 'status');
    const text = document.createElement('span');
    text.textContent = message;
    const x = document.createElement('button');
    x.type = 'button'; x.className = 'toast-x';
    x.setAttribute('aria-label', 'Dismiss'); x.textContent = '\u00d7';
    t.append(text, x);
    box.appendChild(t);
    animate(t, 'slideDown');

    const close = () => {
      if (!t.isConnected) return;
      t.style.animation = 'fadeOut .25s forwards';
      setTimeout(() => t.remove(), 260);
    };
    x.addEventListener('click', close);
    setTimeout(close, duration);
    return t;
  }
}
