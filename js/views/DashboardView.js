// Owner: Nourhan Alaa Eldin & Rotage Waleed Ahmed (Login & Dashboard)
// Admin dashboard: number tiles, quick buttons, new registrations,
// waiting for a report, today's appointments.
//
// All the HTML is built here in JavaScript (render() returns text, bind() adds the clicks).
// Data comes from the controllers in the README "Contracts" table:
//   patients.all() / patients.newest(4)   (Lojaine)
//   doctors.all()                         (Rodina)
//   appointments.all({ date })            (Malak)
//   reports.waitingForReport()            (Loay)
// While a teammate has not written a method yet, the view falls back to the DataStore,
// so the screen still opens instead of crashing.

import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NEWEST_COUNT = 4;

export default class DashboardView extends BaseView {
  // ---------- Data (controller first, DataStore as a safe fallback) ----------

  /** Reads a value from a model object (works with getters and with plain objects). */
  #get(obj, key) {
    return obj?.[key];
  }

  #patients() {
    return this.c.patients?.all?.() ?? this.store?.patients ?? [];
  }

  #doctors() {
    return this.c.doctors?.all?.() ?? this.store?.doctors ?? [];
  }

  #newestPatients() {
    const viaController = this.c.patients?.newest?.(NEWEST_COUNT);
    if (viaController) return viaController;
    return [...this.#patients()]
      .sort((a, b) => String(this.#get(b, 'registeredOn') || '').localeCompare(String(this.#get(a, 'registeredOn') || '')))
      .slice(0, NEWEST_COUNT);
  }

  #todayAppointments() {
    const today = isoDate(0);
    const list = this.c.appointments?.all?.({ date: today })
      ?? (this.store?.appointments ?? []).filter((a) => this.#get(a, 'date') === today);
    return [...list].sort((a, b) => String(this.#get(a, 'time')).localeCompare(String(this.#get(b, 'time'))));
  }

  #waitingForReport() {
    return this.c.reports?.waitingForReport?.() ?? [];
  }

  #findPatient(id) {
    return this.c.patients?.findById?.(id) ?? this.store?.findPatient?.(id) ?? null;
  }

  #findDoctor(id) {
    return this.c.doctors?.findById?.(id) ?? this.store?.findDoctor?.(id) ?? null;
  }

  // ---------- Small helpers ----------

  /** '2026-11-16' -> a Date at local midnight. */
  #parseDate(iso) {
    const [y, m, d] = String(iso || '').split('-').map(Number);
    return y ? new Date(y, m - 1, d) : null;
  }

  /** Date -> 'Mon 16 Nov'. */
  #formatDay(date) {
    return date ? `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}` : '';
  }

  /** '2026-11-15' -> 'Yesterday' / '6 days ago' (empty text when the date is unknown). */
  #ago(iso) {
    const then = this.#parseDate(iso);
    if (!then) return '';
    const now = this.#parseDate(isoDate(0));
    const days = Math.round((now - then) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }

  #badgeClass(status) {
    return `dash-badge dash-badge--${String(status || '').toLowerCase()}`;
  }

  // ---------- Pieces of the screen ----------

  #tile(label, value) {
    return `
        <article class="dash-tile">
          <p class="dash-tile__label">${esc(label)}</p>
          <p class="dash-tile__value">${esc(value)}</p>
        </article>`;
  }

  #registrationRow(patient) {
    const name = this.#get(patient, 'name') || '';
    return `
          <li class="dash-row">
            <span class="dash-avatar" aria-hidden="true">${esc(name.trim().charAt(0).toUpperCase())}</span>
            <span class="dash-row__main">
              <strong class="dash-row__title">${esc(name)}</strong>
              <span class="dash-row__sub">${esc(this.#get(patient, 'phone'))}</span>
            </span>
            <span class="dash-row__when">${esc(this.#ago(this.#get(patient, 'registeredOn')))}</span>
          </li>`;
  }

  #waitingRow(appointment) {
    const patient = this.#findPatient(this.#get(appointment, 'patientId'));
    const doctor = this.#findDoctor(this.#get(appointment, 'doctorId'));
    const day = this.#formatDay(this.#parseDate(this.#get(appointment, 'date')));
    const sub = [this.#get(doctor, 'name'), day].filter(Boolean).join(' · ');
    return `
          <li class="dash-row dash-row--report">
            <span class="dash-row__main">
              <strong class="dash-row__title">${esc(this.#get(patient, 'name'))}</strong>
              <span class="dash-row__sub">${esc(sub)}</span>
            </span>
            <button type="button" class="dash-btn dash-btn--primary dash-btn--small"
                    data-go="medical-reports" data-appointment="${esc(this.#get(appointment, 'id'))}">Write report</button>
          </li>`;
  }

  #appointmentRow(appointment) {
    const patient = this.#findPatient(this.#get(appointment, 'patientId'));
    const doctor = this.#findDoctor(this.#get(appointment, 'doctorId'));
    const status = this.#get(appointment, 'status') || '';
    return `
            <tr>
              <td class="dash-table__time">${esc(this.#get(appointment, 'time'))}</td>
              <td>${esc(this.#get(patient, 'name'))}</td>
              <td>${esc(this.#get(doctor, 'name'))}</td>
              <td class="dash-table__muted">${esc(this.#get(doctor, 'department'))}</td>
              <td class="dash-table__status"><span class="${this.#badgeClass(status)}">${esc(status)}</span></td>
            </tr>`;
  }

  // ---------- BaseView contract ----------

  render() {
    const newest = this.#newestPatients();
    const waiting = this.#waitingForReport();
    const today = this.#todayAppointments();

    const newestHtml = newest.length
      ? newest.map((p) => this.#registrationRow(p)).join('')
      : '<li class="dash-empty">No registrations yet.</li>';
    const waitingHtml = waiting.length
      ? waiting.map((a) => this.#waitingRow(a)).join('')
      : '<li class="dash-empty">No visits are waiting for a report.</li>';
    const todayHtml = today.length
      ? today.map((a) => this.#appointmentRow(a)).join('')
      : '<tr><td colspan="5" class="dash-empty">No appointments today.</td></tr>';

    return `
      <section class="dash" aria-labelledby="dash-title">
        <header class="dash__header">
          <div>
            <h1 id="dash-title" class="dash__title">Dashboard</h1>
            <p class="dash__subtitle">Overview of today at the hospital</p>
          </div>
          <p class="dash__date">Today: ${esc(this.#formatDay(new Date()))}</p>
        </header>

        <div class="dash-tiles">
          ${this.#tile('Patients', this.#patients().length)}
          ${this.#tile('Doctors', this.#doctors().length)}
          ${this.#tile("Today's appointments", today.length)}
          ${this.#tile('Waiting for a report', waiting.length)}
        </div>

        <div class="dash-actions">
          <button type="button" class="dash-btn dash-btn--primary" data-go="medical-reports">+ Write a report</button>
          <button type="button" class="dash-btn dash-btn--ghost" data-go="doctors" data-action="add-doctor">+ Add doctor</button>
          <button type="button" class="dash-btn dash-btn--warn" data-go="doctors" data-action="doctor-unavailable">Doctor not available?</button>
          <button type="button" class="dash-btn dash-btn--ghost" data-go="registrations">View registrations</button>
        </div>

        <div class="dash-grid">
          <section class="dash-card" aria-labelledby="dash-new-title">
            <header class="dash-card__header">
              <h2 id="dash-new-title" class="dash-card__title">New registrations</h2>
              <button type="button" class="dash-link" data-go="registrations">See all →</button>
            </header>
            <ul class="dash-list">${newestHtml}
            </ul>
          </section>

          <section class="dash-card dash-card--fit" aria-labelledby="dash-waiting-title">
            <header class="dash-card__header">
              <h2 id="dash-waiting-title" class="dash-card__title">Waiting for a report (${esc(waiting.length)})</h2>
              <button type="button" class="dash-link" data-go="medical-reports">Open →</button>
            </header>
            <ul class="dash-list">${waitingHtml}
            </ul>
          </section>
        </div>

        <section class="dash-card dash-card--wide" aria-labelledby="dash-today-title">
          <h2 id="dash-today-title" class="dash-card__title">Today's appointments</h2>
          <table class="dash-table">
            <colgroup>
              <col class="dash-col--time"><col class="dash-col--patient"><col class="dash-col--doctor"><col class="dash-col--department"><col class="dash-col--status">
            </colgroup>
            <thead class="dash-sr-only">
              <tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Department</th><th>Status</th></tr>
            </thead>
            <tbody>${todayHtml}
            </tbody>
          </table>
        </section>

        <p class="dash__note">Prototype with sample data. Changes reset when the page reloads.</p>
      </section>`;
  }

  bind(root) {
    // One listener for every button that moves to another page: <button data-go="page">
    root.querySelectorAll('[data-go]').forEach((button) => {
      button.addEventListener('click', () => {
        const params = {};
        if (button.dataset.appointment) params.appointmentId = button.dataset.appointment;
        if (button.dataset.action) params.action = button.dataset.action;
        this.router.go(button.dataset.go, params);
      });
    });
  }
}
