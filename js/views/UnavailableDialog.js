// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// Screen 3: "Dr. X is not available". The admin picks a date and an optional reason, sees how many
// bookings will be cancelled, and confirms. The rules live in DoctorController.markUnavailable().
//
// It uses the browser's own <dialog> element (showModal): Escape closes it, focus stays inside it
// and the page behind is dimmed, without needing Belal's Modal class.

import { esc } from './common/BaseView.js';
import { shortDate } from './DoctorCard.js';

let counter = 0;

export default class UnavailableDialog {
  #doctor;
  #today;
  #controller;
  #onDone;
  #opener;
  #dialog;

  /**
   * @param {{doctor: Doctor, today: string, controller: DoctorController, onDone: Function}} options
   *   onDone({ doctor, date, cancelled }) runs after a successful confirm.
   */
  constructor({ doctor, today, controller, onDone }) {
    this.#doctor = doctor;
    this.#today = today;
    this.#controller = controller;
    this.#onDone = onDone;
  }

  /** Opens the dialog. `opener` (the button that was clicked) gets the focus back when it closes. */
  open(opener = null) {
    this.#opener = opener;
    const id = `dr-dlg-${++counter}`;
    const dialog = document.createElement('dialog');
    dialog.className = 'dr-dialog';
    dialog.setAttribute('aria-labelledby', `${id}-title`);
    dialog.innerHTML = `
      <form class="dr-dialog__form" novalidate>
        <h2 class="dr-dialog__title" id="${id}-title">${esc(this.#doctor.name)} is not available</h2>
        <label class="dr-field" for="${id}-date"><span>Date</span>
          <input id="${id}-date" name="date" type="date" value="${esc(this.#today)}" min="${esc(this.#today)}" required>
        </label>
        <label class="dr-field" for="${id}-reason"><span>Reason (optional)</span>
          <input id="${id}-reason" name="reason" type="text" maxlength="80" placeholder="e.g. Emergency surgery" autocomplete="off">
        </label>
        <p class="dr-note dr-note--warn" data-role="count" role="status"></p>
        <p class="dr-error" data-role="error" role="alert" hidden></p>
        <div class="dr-dialog__actions">
          <button type="button" class="dr-btn dr-btn--outline" data-role="back">Back</button>
          <button type="submit" class="dr-btn dr-btn--danger" data-role="confirm">Confirm &amp; notify patients</button>
        </div>
      </form>`;
    (document.getElementById('modal-root') || document.body).appendChild(dialog);
    this.#dialog = dialog;
    this.#bind(dialog);
    this.#updateCount();
    dialog.showModal();
    dialog.querySelector('input[name="date"]').focus();
  }

  #bind(dialog) {
    const form = dialog.querySelector('form');
    form.elements.date.addEventListener('input', () => this.#updateCount());
    dialog.querySelector('[data-role="back"]').addEventListener('click', () => dialog.close());
    // Escape or Back: remove the dialog from the page and give the focus back.
    dialog.addEventListener('close', () => {
      dialog.remove();
      this.#opener?.focus?.();
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#confirm(form);
    });
  }

  /** "2 booked appointments will be cancelled and the patients notified." (updates when the date changes) */
  #updateCount() {
    const form = this.#dialog.querySelector('form');
    const note = form.querySelector('[data-role="count"]');
    const confirm = form.querySelector('[data-role="confirm"]');
    this.#showError('');
    const date = form.elements.date.value;
    let affected = [];
    try {
      affected = this.#controller.affectedBy(this.#doctor.id, date);
    } catch {
      note.textContent = 'Please choose a valid date.';
      note.classList.add('dr-note--warn');
      confirm.disabled = true;
      return;
    }
    if (date < this.#today) {
      note.textContent = 'You cannot choose a day in the past.';
      confirm.disabled = true;
      return;
    }
    if (!this.#doctor.isAvailable(date)) {
      note.textContent = `${this.#doctor.name} is already not available on ${shortDate(date)}.`;
      confirm.disabled = true;
      return;
    }
    confirm.disabled = false;
    const n = affected.length;
    note.classList.toggle('dr-note--warn', n > 0);
    note.textContent = n === 0
      ? 'No bookings on this day, so nobody needs to be notified.'
      : `${n} booked appointment${n > 1 ? 's' : ''} will be cancelled and the patient${n > 1 ? 's' : ''} notified.`;
  }

  #confirm(form) {
    try {
      const date = form.elements.date.value;
      const cancelled = this.#controller.markUnavailable(this.#doctor.id, date, form.elements.reason.value);
      this.#dialog.close();
      this.#onDone?.({ doctor: this.#doctor, date, cancelled });
    } catch (error) {
      // InvalidInputError: show the reason inside the dialog and keep it open.
      this.#showError(error.message);
    }
  }

  #showError(message) {
    const box = this.#dialog.querySelector('[data-role="error"]');
    box.textContent = message;
    box.hidden = !message;
  }
}
