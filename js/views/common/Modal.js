// Owner: Belal Mohamed Ahmed (GUI general)
// Modal.open(content, { dark: false }) · Modal.close()
// content = HTML string or DOM element. The dialog is placed inside #modal-root (index.html),
// so screens like CancelDialog can find their buttons there after open().

import animate from './animate.js';

export default class Modal {
  static open(content, opts = {}) {
    Modal.close();
    Modal._prev = document.activeElement;
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.id = 'modal-backdrop';
    const box = document.createElement('div');
    box.className = 'modal-box' + (opts.dark ? ' modal-dark' : '');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.tabIndex = -1;
    if (typeof content === 'string') box.insertAdjacentHTML('beforeend', content);
    else if (content) box.appendChild(content);
    const x = document.createElement('button');
    x.type = 'button'; x.className = 'modal-x';
    x.setAttribute('aria-label', 'Close'); x.textContent = '\u00d7';
    x.addEventListener('click', Modal.close);
    box.prepend(x);
    back.appendChild(box);
    (document.getElementById('modal-root') || document.body).appendChild(back);
    document.body.style.overflow = 'hidden';
    animate(box, 'pop');

    back.addEventListener('mousedown', (e) => { if (e.target === back) Modal.close(); });
    Modal._key = (e) => {
      if (e.key === 'Escape') return Modal.close();
      if (e.key !== 'Tab') return;                 // keep focus inside the dialog
      const f = box.querySelectorAll('button,[href],input,select,textarea');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', Modal._key);
    (box.querySelector('input,select,textarea') || box).focus();
    return box;
  }
  static close() {
    const b = document.getElementById('modal-backdrop');
    if (!b) return;
    b.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', Modal._key);
    if (Modal._prev && Modal._prev.focus) Modal._prev.focus();
  }
}
