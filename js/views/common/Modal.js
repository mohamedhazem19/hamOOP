// Owner: Belal Mohamed Ahmed (GUI general)
// Week-1 starter. TODO(Belal): pop-in animation, focus trap, close on Escape.
export default class Modal {
  static open(html) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal__card">${html}</div></div>`;
    return root.querySelector('.modal__card');
  }

  static close() {
    document.getElementById('modal-root').innerHTML = '';
  }
}
