// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Shared parent of BookingView, MyAppointmentsView and AppointmentsView (inheritance).
// It draws the page frame (title, subtitle, today's date) and the messages; each screen only
// writes content() and bindContent(screen) – the same render()/bind() pair as every BaseView.
// Classes come from css/views/booking.css (.ap, .ap__header, .ap-badge, .ap-toast …).

import BaseView, { esc } from './common/BaseView.js';
import Toast from './common/Toast.js';
import Appointment from '../models/Appointment.js';
import { isoDate } from '../store/sampleData.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default class AppointmentView extends BaseView {
  #root = null;

  // ---------- What every appointment screen shares ----------

  /** Malak's AppointmentController (one shared object from app.js). */
  get appointments() { return this.c.appointments; }

  /** Today as 'YYYY-MM-DD', the same format as Appointment.date. */
  get today() { return isoDate(0); }

  /** Subclasses override these two (polymorphism). */
  get title() { return ''; }
  get subtitle() { return ''; }

  /** "Today", "Tomorrow", "In 3 days", "2 days ago". */
  countdown(date) { return Appointment.countdown(date, this.today); }

  // ---------- Date helpers (static: they need no screen) ----------

  /** '2026-11-24' -> { day: 24, month: 'Nov', weekday: 'Tue' } */
  static dateParts(date) {
    const [y, m, d] = String(date || '').split('-').map(Number);
    const day = new Date(y, (m || 1) - 1, d || 1);
    return { day: d || '', month: MONTHS[(m || 1) - 1], weekday: WEEKDAYS[day.getDay()] };
  }

  /** '2026-11-24' -> 'Tue 24 Nov' */
  static label(date) {
    const p = AppointmentView.dateParts(date);
    return `${p.weekday} ${p.day} ${p.month}`;
  }

  /** Coloured status badge: Scheduled / Completed / Cancelled. */
  static badge(status) {
    const s = String(status || '');
    return `<span class="ap-badge ap-badge--${esc(s.toLowerCase())}">${esc(s)}</span>`;
  }

  // ---------- BaseView contract (template method) ----------

  render() {
    const now = AppointmentView.label(this.today);
    return `
      <section class="ap" aria-labelledby="ap-title">
        <header class="ap__header">
          <div>
            <h1 id="ap-title" class="ap__title">${esc(this.title)}</h1>
            <p class="ap__subtitle">${esc(this.subtitle)}</p>
          </div>
          <p class="ap__date">Today: ${esc(now)}</p>
        </header>
        ${this.content()}
      </section>`;
  }

  bind(root) {
    this.#root = root;
    this.bindContent(root);
  }

  /** Subclasses: return the screen's HTML (inside the frame). */
  content() { return ''; }

  /** Subclasses: add the screen's click/change listeners. */
  // eslint-disable-next-line no-unused-vars
  bindContent(screen) {}

  /** Draw the screen again after the data changed (keeps the same view object). */
  refresh() {
    if (!this.#root) return;
    this.#root.innerHTML = this.render();
    this.bind(this.#root);
  }

  // ---------- Messages ----------

  /** Green (ok) or red (err) message. Uses Belal's Toast once it exists. */
  notify(message, type = 'ok') {
    if (typeof Toast.show === 'function') { Toast.show(message, type); return; }
    const host = document.getElementById('toast-root') || document.body;
    host.querySelector('.ap-toast')?.remove();
    const box = document.createElement('div');
    box.className = `ap-toast ap-toast--${type === 'err' ? 'err' : 'ok'}`;
    box.setAttribute('role', type === 'err' ? 'alert' : 'status');
    const text = document.createElement('span');
    text.textContent = message; // textContent: the message can never inject HTML
    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close message');
    close.textContent = '×';
    close.addEventListener('click', () => box.remove());
    box.append(text, close);
    host.append(box);
    setTimeout(() => box.remove(), 4000);
  }

  /** Shows an error's message in red (InvalidInputError, SlotUnavailableError …). */
  notifyError(error) {
    if (!error?.message) console.error(error);
    this.notify(error?.message || 'Something went wrong. Please try again.', 'err');
  }
}
