// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Screen 3 + 4: the patient's tracker. Greeting, hospital-cancellation alerts, next appointment with a
// countdown and a 4-step tracker, and the list of all the patient's appointments.

import AppointmentView from './AppointmentView.js';
import CancelDialog from './CancelDialog.js';
import { esc } from './common/BaseView.js';

const STEPS = ['Booked', 'Waiting', 'Visit day', 'Completed'];

export default class MyAppointmentsView extends AppointmentView {
  get title() { return 'My Appointments'; }
  get subtitle() { return 'Track your bookings'; }

  get #patient() { return this.session?.user; }

  // ---------- Data ----------
  #mine() { return this.appointments.forPatient(this.#patient.id); }

  /** Cancelled by the hospital, still in the future, and not yet replaced by a new visit with the same doctor. */
  #alerts(mine) {
    return mine.filter((a) => a.isCancelled && a.cancelReason && a.cancelReason !== 'Patient request' && a.date >= this.today
      && !mine.some((b) => b.isUpcoming(this.today) && b.doctorId === a.doctorId));
  }

  /** Next visit first, then the other upcoming ones, then history (newest first). */
  #ordered(mine, next) {
    const upcoming = mine.filter((a) => a.isUpcoming(this.today) && a !== next);
    const rest = mine.filter((a) => !a.isUpcoming(this.today)).reverse();
    return (next ? [next] : []).concat(upcoming, rest);
  }

  #headline(mine, next) {
    const count = mine.filter((a) => a.isUpcoming(this.today)).length;
    if (!next) return 'You have no upcoming appointments.';
    const parts = AppointmentView.dateParts(next.date);
    return `You have ${count} upcoming appointment${count > 1 ? 's' : ''}. The next one is ${this.countdown(next.date).toLowerCase()} (${parts.day} ${parts.month}).`;
  }

  // ---------- Drawing ----------
  content() {
    const mine = this.#mine();
    const next = this.appointments.nextFor(this.#patient.id);
    const first = String(this.#patient.name).split(' ')[0];
    return `
      <div class="ma">
        <section class="ma__hero">
          <div>
            <p class="ma__hello">Hello, ${esc(first)}</p>
            <p class="ma__headline">${esc(this.#headline(mine, next))}</p>
          </div>
          <button type="button" class="ap-btn ap-btn--light" data-ma="book">+ Book new appointment</button>
        </section>
        ${this.#alerts(mine).map((a) => this.#alert(a)).join('')}
        ${next ? this.#nextCard(next) : this.#emptyCard()}
        ${this.#list(this.#ordered(mine, next))}
      </div>`;
  }

  #alert(a) {
    const info = this.appointments.details(a);
    return `
      <div class="ap-note ap-note--warn ma__alert" role="alert">
        <span><strong>Appointment cancelled by the hospital.</strong> ${esc(info.doctorName)} on ${esc(AppointmentView.label(a.date))} at ${esc(a.time)} – ${esc(a.cancelReason)}.</span>
        <button type="button" class="ap-btn ap-btn--warn" data-ma="rebook" data-id="${esc(a.id)}">Rebook now</button>
      </div>`;
  }

  #emptyCard() {
    return `
      <section class="ap-card ma__empty">
        <strong>No upcoming appointments</strong>
        <span class="ap-muted">Choose a doctor and book a free time slot.</span>
        <button type="button" class="ap-btn ap-btn--primary" data-ma="book">Book an appointment  →</button>
      </section>`;
  }

  #nextCard(a) {
    const info = this.appointments.details(a);
    const p = AppointmentView.dateParts(a.date);
    return `
      <section class="ap-card ma__next" aria-label="Your next appointment">
        <div class="ma__next-head">
          <h2 class="ap-card__title">Your next appointment</h2>
          <span class="ma__countdown">${esc(this.countdown(a.date))}</span>
        </div>
        <div class="ma__next-body">
          <div class="ma__tile" aria-hidden="true"><span>${esc(p.month)}</span><strong>${esc(p.day)}</strong><small>${esc(p.weekday)}</small></div>
          <div class="ma__next-info">
            <strong class="ma__doctor">${esc(info.doctorName)}</strong>
            <span>${esc(info.department)} · ${esc(a.time)} · ${esc(info.fee)} EGP</span>
            <span class="ap-muted ap-small">Please arrive 15 minutes early and bring your ID.</span>
          </div>
          <div class="ma__next-actions">
            <button type="button" class="ap-btn" data-ma="resched" data-id="${esc(a.id)}">Reschedule</button>
            <button type="button" class="ap-btn ap-btn--danger-ghost" data-ma="cancel" data-id="${esc(a.id)}">Cancel</button>
          </div>
        </div>
        ${this.#tracker(a, p)}
      </section>`;
  }

  /** Booked ✓ → Waiting (until the day) → Visit day (today) → Completed. */
  #tracker(a, p) {
    const days = this.today === a.date ? 0 : Math.max(1, Math.round((new Date(`${a.date}T00:00:00`) - new Date(`${this.today}T00:00:00`)) / 86400000));
    const current = days > 0 ? 1 : 2; // index of the step in progress
    const sub = [
      'Confirmed by the hospital',
      days > 0 ? `${this.countdown(a.date)} to go` : 'Done',
      `${p.weekday}, ${p.day} ${p.month} at ${a.time}`,
      'After your visit',
    ];
    return `
      <ol class="ma__steps" aria-label="Booking progress">
        ${STEPS.map((label, i) => {
          const state = i < current ? 'done' : i === current ? 'now' : 'todo';
          return `
            <li class="ma__step is-${state}"${state === 'now' ? ' aria-current="step"' : ''}>
              <div class="ma__step-row">
                <span class="ma__dot">${state === 'done' ? '✓' : i + 1}</span>
                <span class="ma__line"></span>
              </div>
              <strong>${esc(label)}</strong>
              <span class="ap-muted ap-small">${esc(sub[i])}</span>
            </li>`;
        }).join('')}
      </ol>`;
  }

  #list(rows) {
    return `
      <section class="ap-card ma__list" aria-label="All my appointments">
        <h2 class="ap-card__title">All my appointments (${rows.length})</h2>
        ${rows.length === 0 ? '<p class="ap-muted">You haven\'t booked anything yet.</p>' : rows.map((a) => this.#row(a)).join('')}
      </section>`;
  }

  #row(a) {
    const info = this.appointments.details(a);
    const p = AppointmentView.dateParts(a.date);
    const report = a.isCompleted ? this.c.reports?.forAppointment?.(a.id) : null;
    const canRebook = a.isCancelled && a.date >= this.today;
    return `
      <div class="ma__row">
        <div class="ma__mini-tile" aria-hidden="true"><span>${esc(p.month)}</span><strong>${esc(p.day)}</strong></div>
        <div class="ma__row-info">
          <strong>${esc(info.doctorName)}</strong>
          <span class="ap-muted ap-small">${esc(info.department)} · ${esc(p.weekday)} at ${esc(a.time)}</span>
          ${a.isCancelled && a.cancelReason ? `<span class="ma__reason">Cancelled: ${esc(a.cancelReason)}</span>` : ''}
        </div>
        <span class="ma__rel">${esc(this.countdown(a.date))}</span>
        ${canRebook ? `<button type="button" class="ap-btn ap-btn--primary ap-btn--small" data-ma="rebook" data-id="${esc(a.id)}">Rebook</button>` : ''}
        ${report ? `<button type="button" class="ap-btn ap-btn--small" data-ma="report" data-id="${esc(a.id)}">View report</button>` : ''}
        ${AppointmentView.badge(a.status)}
      </div>`;
  }

  // ---------- Events ----------
  bindContent(screen) {
    screen.querySelectorAll('[data-ma]').forEach((el) => el.addEventListener('click', () => this.#act(el.dataset.ma, el.dataset.id)));
  }

  #act(action, id) {
    if (action === 'book') return this.router.go('booking');
    if (action === 'resched') return this.router.go('booking', { rescheduleId: id });
    if (action === 'rebook') {
      const a = this.appointments.forPatient(this.#patient.id).find((x) => x.id === id);
      return this.router.go('booking', { doctorId: a.doctorId, date: a.date });
    }
    if (action === 'report') return this.router.go('my-reports', { appointmentId: id });
    if (action === 'cancel') {
      return new CancelDialog(this.ctx, {
        appointmentId: id, reason: 'Patient request', lockReason: true,
        onDone: () => { this.notify('Your appointment was cancelled.'); this.refresh(); },
        onError: (e) => this.notifyError(e),
      }).open();
    }
    return undefined;
  }
}
