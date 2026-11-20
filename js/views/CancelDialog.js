// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// The "Cancel this appointment?" dialog (admin) – also used by patients with the reason locked to "Patient request".
// It extends BaseView, so it has the same render() / bind() pair as every screen and is opened with open().
// It uses Modal (Belal) when that class is written; until then it mounts itself in #modal-root.

import BaseView, { esc } from './common/BaseView.js';
import Modal from './common/Modal.js';
import Appointment from '../models/Appointment.js';

export default class CancelDialog extends BaseView {
  #onKeydown = null;

  /**
   * @param {object} ctx     the shared context (controllers …)
   * @param {{appointmentId: string, reason?: string, lockReason?: boolean, onDone?: function}} params
   *        onDone(reason) is called after the appointment was really cancelled.
   */
  constructor(ctx, params = {}) {
    super(ctx, params);
    this.reason = params.reason || Appointment.CANCEL_REASONS[0];
  }

  get #host() { return document.getElementById('modal-root'); }

  /** Dialog box (without the dark backdrop). */
  render() {
    const info = this.c.appointments.details(this.params.appointmentId);
    const a = info.appointment;
    const locked = !!this.params.lockReason;
    const when = new Date(`${a.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const who = this.session?.isAdmin ? `${esc(info.patientName)} with ` : 'Your visit with ';
    return `
      <div class="cd" role="dialog" aria-modal="true" aria-labelledby="cd-title">
        <h2 class="cd__title" id="cd-title">Cancel this appointment?</h2>
        <p class="cd__info">${who}${esc(info.doctorName)} on ${esc(when)} at ${esc(a.time)}</p>
        <label class="ap-field" for="cd-reason">
          <span>${locked ? 'Reason' : 'Reason (the patient will see this)'}</span>
          <select id="cd-reason" ${locked ? 'disabled' : ''}>
            ${Appointment.CANCEL_REASONS.map((r) => `<option value="${esc(r)}"${r === this.reason ? ' selected' : ''}>${esc(r)}</option>`).join('')}
          </select>
        </label>
        <div class="cd__actions">
          <button type="button" class="ap-btn ap-btn--ghost" data-cd="keep">Keep it</button>
          <button type="button" class="ap-btn ap-btn--danger" data-cd="confirm">Cancel appointment</button>
        </div>
      </div>`;
  }

  bind(root) {
    root.querySelector('#cd-reason')?.addEventListener('change', (e) => { this.reason = e.target.value; });
    root.querySelector('[data-cd="keep"]')?.addEventListener('click', () => this.close());
    root.querySelector('[data-cd="confirm"]')?.addEventListener('click', () => this.#confirm());
    root.querySelector('.cd-backdrop')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) this.close(); });
    this.#onKeydown = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this.#onKeydown);
    root.querySelector('[data-cd="keep"]')?.focus();
  }

  open() {
    const host = this.#host;
    if (!host) return;
    let html = this.render();
    if (typeof Modal.open === 'function') {
      Modal.open(html);
    } else {
      host.innerHTML = `<div class="cd-backdrop">${html}</div>`;
    }
    this.bind(host);
  }

  close() {
    document.removeEventListener('keydown', this.#onKeydown);
    if (typeof Modal.close === 'function') Modal.close();
    else if (this.#host) this.#host.innerHTML = '';
  }

  #confirm() {
    try {
      this.c.appointments.cancel(this.params.appointmentId, this.reason);
    } catch (error) {
      this.close();
      this.params.onError?.(error);
      return;
    }
    this.close();
    this.params.onDone?.(this.reason);
  }
}
