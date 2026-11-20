// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Screen 5 (+ 6): the admin's appointment table with doctor/date filters, Complete, Cancel (opens CancelDialog)
// and Write report (hands over to the medical-reports page of Loay).

import AppointmentView from './AppointmentView.js';
import CancelDialog from './CancelDialog.js';
import { esc } from './common/BaseView.js';

export default class AppointmentsView extends AppointmentView {
  #filters = { doctorId: 'all', date: '' };

  get title() { return 'Appointments'; }
  get subtitle() { return 'Complete visits or cancel when a doctor is not available'; }

  #doctors() {
    return this.c.doctors?.all?.() ?? this.store?.doctors ?? [];
  }

  #needsReport(a) {
    if (!a.isCompleted) return false;
    const has = this.c.reports?.forAppointment?.(a.id);
    return !has;
  }

  content() {
    const rows = this.appointments.all(this.#filters);
    return `
      <div class="ad">
        <section class="ap-card ad__filters" aria-label="Filters">
          <label class="ap-field" for="ad-doctor"><span>Doctor</span>
            <select id="ad-doctor">
              <option value="all">All doctors</option>
              ${this.#doctors().map((d) => `<option value="${esc(d.id)}"${d.id === this.#filters.doctorId ? ' selected' : ''}>${esc(d.name)}</option>`).join('')}
            </select>
          </label>
          <label class="ap-field" for="ad-date"><span>Date</span>
            <input id="ad-date" type="date" value="${esc(this.#filters.date)}">
          </label>
          <button type="button" class="ap-btn" data-ad="clear">Clear filters</button>
          <span class="ad__count" aria-live="polite">${rows.length} appointment(s)</span>
        </section>

        <section class="ap-card ad__table-card" aria-label="Appointments">
          <div class="ad__scroll">
            <table class="ad__table">
              <thead>
                <tr><th scope="col">Date</th><th scope="col">Time</th><th scope="col">Patient</th><th scope="col">Doctor</th>
                    <th scope="col">Department</th><th scope="col">Status</th><th scope="col">Actions</th></tr>
              </thead>
              <tbody>${rows.map((a) => this.#row(a)).join('')}</tbody>
            </table>
          </div>
          ${rows.length === 0 ? '<p class="ap-muted ad__empty">No appointments match these filters.</p>' : ''}
        </section>
      </div>`;
  }

  #row(a) {
    const info = this.appointments.details(a);
    const actions = [];
    if (a.isScheduled) {
      actions.push(`<button type="button" class="ap-btn ap-btn--ok-ghost ap-btn--small" data-ad="complete" data-id="${esc(a.id)}">Complete</button>`);
      actions.push(`<button type="button" class="ap-btn ap-btn--danger-ghost ap-btn--small" data-ad="cancel" data-id="${esc(a.id)}">Cancel</button>`);
    }
    if (this.#needsReport(a)) {
      actions.push(`<button type="button" class="ap-btn ap-btn--primary ap-btn--small" data-ad="report" data-id="${esc(a.id)}">Write report</button>`);
    }
    if (a.isCancelled && a.cancelReason) actions.push(`<span class="ad__reason">Reason: ${esc(a.cancelReason)}</span>`);
    return `
      <tr>
        <td>${esc(AppointmentView.label(a.date))}</td>
        <td class="ad__time">${esc(a.time)}</td>
        <td>${esc(info.patientName)}</td>
        <td>${esc(info.doctorName)}</td>
        <td class="ap-muted">${esc(info.department)}</td>
        <td>${AppointmentView.badge(a.status)}</td>
        <td><div class="ad__actions">${actions.join('')}</div></td>
      </tr>`;
  }

  bindContent(screen) {
    screen.querySelector('#ad-doctor')?.addEventListener('change', (e) => { this.#filters.doctorId = e.target.value; this.refresh(); });
    screen.querySelector('#ad-date')?.addEventListener('change', (e) => { this.#filters.date = e.target.value; this.refresh(); });
    screen.querySelector('[data-ad="clear"]')?.addEventListener('click', () => { this.#filters = { doctorId: 'all', date: '' }; this.refresh(); });
    screen.querySelectorAll('[data-ad]').forEach((el) => {
      const { ad: action, id } = el.dataset;
      if (action === 'complete') el.addEventListener('click', () => this.#complete(id));
      if (action === 'cancel') el.addEventListener('click', () => this.#cancel(id));
      if (action === 'report') el.addEventListener('click', () => this.router.go('medical-reports', { appointmentId: id }));
    });
  }

  #complete(id) {
    try {
      this.appointments.complete(id);
      this.notify('Appointment marked as completed.');
    } catch (error) {
      this.notifyError(error);
    }
    this.refresh();
  }

  #cancel(id) {
    new CancelDialog(this.ctx, {
      appointmentId: id,
      onDone: (reason) => { this.notify(`Appointment cancelled. The patient was notified: ${reason}.`); this.refresh(); },
      onError: (error) => { this.notifyError(error); this.refresh(); },
    }).open();
  }
}
