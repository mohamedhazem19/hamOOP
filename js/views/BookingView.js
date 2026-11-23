// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Screen 1 + 2: pick department -> doctor -> date -> free slot, see the summary, confirm.
// All rules live in AppointmentController; this view only collects choices and shows the result.
// Router params: { doctorId, date }  -> start with that doctor (Rebook now, "Book with this doctor")
//                { rescheduleId }    -> move an existing appointment instead of booking a new one.

import AppointmentView from './AppointmentView.js';
import { esc } from './common/BaseView.js';
import SlotUnavailableError from '../errors/SlotUnavailableError.js';
import Appointment from '../models/Appointment.js';

export default class BookingView extends AppointmentView {
  #choice;

  constructor(ctx, params) {
    super(ctx, params);
    this.rescheduling = this.params.rescheduleId ? this.#findAppointment(this.params.rescheduleId) : null;
    const doctorId = this.rescheduling?.doctorId || this.params.doctorId || '';
    const doctor = this.#doctorById(doctorId) || this.#doctorList(this.#departments()[0])[0];
    const wanted = this.rescheduling?.date || this.params.date || this.#firstOpenDay();
    this.#choice = {
      dept: doctor?.department || this.#departments()[0] || '',
      doctorId: doctor?.id || '',
      date: wanted < this.today ? this.today : wanted,
      time: '',
    };
  }

  /** Today, or tomorrow once the last time slot of today has already passed. */
  #firstOpenDay() {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (time < Appointment.SLOTS.at(-1)) return this.today;
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
  }

  get title() { return 'Book Appointment'; }
  get subtitle() { return 'Pick a department, doctor and a free time slot'; }

  // ---------- Reading the other modules (Rodina's DoctorController, with the store as backup) ----------
  #departments() {
    const list = this.c.doctors?.departments?.()
      ?? this.store?.hospital?.departments
      ?? [...new Set((this.store?.doctors ?? []).map((d) => d.department))];
    return list.map((d) => (typeof d === 'string' ? d : d.name));
  }

  #doctorList(dept) {
    if (typeof this.c.doctors?.byDepartment === 'function') return this.c.doctors.byDepartment(dept);
    return (this.store?.doctors || []).filter((d) => d.department === dept);
  }

  #doctorById(id) {
    if (!id) return null;
    return this.c.doctors?.findById?.(id) ?? this.store?.findDoctor?.(id) ?? null;
  }

  #findAppointment(id) {
    return this.appointments.all().find((a) => a.id === id && a.isScheduled) || null;
  }

  get #patient() { return this.session?.user; }

  // ---------- Drawing ----------
  content() {
    const ch = this.#choice;
    const doctors = this.#doctorList(ch.dept);
    const doctor = this.#doctorById(ch.doctorId);
    const slots = doctor ? this.#slots() : [];
    const off = slots.length > 0 && slots.every((s) => s.reason === 'Doctor not available');
    const fee = doctor ? this.appointments.feeFor(doctor.id) : null;
    const when = ch.time ? `${AppointmentView.label(ch.date)} at ${ch.time}` : 'Choose a time slot';

    return `
      ${this.rescheduling ? `
        <div class="ap-note ap-note--warn">
          <span>Rescheduling your appointment. Pick a new date and time.</span>
          <button type="button" class="ap-btn ap-btn--small" data-bk="stop">Stop rescheduling</button>
        </div>` : ''}
      <div class="bk">
        <section class="ap-card bk__form" aria-label="Choose doctor, date and time">
          <div class="bk__fields">
            <label class="ap-field" for="bk-dept"><span>Department</span>
              <select id="bk-dept" ${this.rescheduling ? 'disabled' : ''}>
                ${this.#departments().map((d) => `<option value="${esc(d)}"${d === ch.dept ? ' selected' : ''}>${esc(d)}</option>`).join('')}
              </select>
            </label>
            <label class="ap-field" for="bk-doctor"><span>Doctor</span>
              <select id="bk-doctor" ${this.rescheduling ? 'disabled' : ''}>
                ${doctors.map((d) => `<option value="${esc(d.id)}"${d.id === ch.doctorId ? ' selected' : ''}>${esc(d.name)}${d.type ? ` (${esc(d.type)})` : ''}</option>`).join('')}
              </select>
            </label>
            <label class="ap-field" for="bk-date"><span>Date</span>
              <input id="bk-date" type="date" value="${esc(ch.date)}" min="${esc(this.today)}">
            </label>
          </div>

          <div class="bk__slots">
            <span class="bk__label" id="bk-slots-label">Available time slots</span>
            ${doctor ? '' : '<p class="ap-muted">No doctors in this department yet.</p>'}
            <div class="bk__grid" role="group" aria-labelledby="bk-slots-label">
              ${slots.map((s) => this.#slotButton(s)).join('')}
            </div>
            ${off ? '<p class="ap-note ap-note--warn">This doctor is not available on this day. Please choose another date.</p>' : ''}
            ${!off && slots.length && slots.every((s) => s.reason === 'Past time') ? '<p class="ap-note ap-note--warn">All of today\'s time slots have passed. Please choose another date.</p>' : ''}
            <p class="ap-muted ap-small">Crossed-out slots are already booked for this doctor.</p>
          </div>
        </section>

        <aside class="ap-card bk__summary" aria-label="Booking summary">
          <h2 class="ap-card__title">Summary</h2>
          <dl class="bk__list">
            <dt>Patient</dt><dd>${esc(this.#patient?.name || '–')}</dd>
            <dt>Doctor</dt><dd>${doctor ? `${esc(doctor.name)}` : 'Choose a doctor'}</dd>
            <dt>Department</dt><dd>${esc(ch.dept || '–')}</dd>
            <dt>When</dt><dd>${esc(when)}</dd>
            <dt>Fee</dt><dd class="bk__fee">${fee === null ? '–' : `${esc(fee)} EGP`}</dd>
          </dl>
          <button type="button" class="ap-btn ap-btn--primary ap-btn--block" data-bk="confirm">${this.rescheduling ? 'Confirm new time' : 'Confirm booking'}</button>
        </aside>
      </div>`;
  }

  #slots() {
    try {
      return this.appointments.freeSlots(this.#choice.doctorId, this.#choice.date);
    } catch {
      return []; // a date that is not valid yet (e.g. while typing): show nothing
    }
  }

  #slotButton(slot) {
    const selected = this.#choice.time === slot.time && slot.free;
    const cls = ['bk__slot', selected ? 'is-selected' : '', slot.free ? '' : 'is-taken'].filter(Boolean).join(' ');
    const labels = { Booked: 'Booked', 'Past date': 'Past', 'Past time': 'Past' };
    const note = slot.free ? '' : `<span class="bk__slot-note">${labels[slot.reason] || 'Off'}</span>`;
    return `<button type="button" class="${cls}" data-time="${esc(slot.time)}" aria-pressed="${selected}" ${slot.free ? '' : 'disabled'}>${esc(slot.time)}${note}</button>`;
  }

  // ---------- Events ----------
  bindContent(screen) {
    const ch = this.#choice;
    screen.querySelector('#bk-dept')?.addEventListener('change', (e) => {
      const first = this.#doctorList(e.target.value)[0];
      Object.assign(ch, { dept: e.target.value, doctorId: first?.id || '', time: '' });
      this.refresh();
    });
    screen.querySelector('#bk-doctor')?.addEventListener('change', (e) => {
      Object.assign(ch, { doctorId: e.target.value, time: '' });
      this.refresh();
    });
    screen.querySelector('#bk-date')?.addEventListener('change', (e) => {
      if (e.target.value && e.target.value < this.today) this.notify('You cannot book a date in the past.', 'err');
      ch.date = !e.target.value || e.target.value < this.today ? this.today : e.target.value;
      ch.time = '';
      this.refresh();
    });
    screen.querySelectorAll('[data-time]').forEach((btn) => btn.addEventListener('click', () => {
      ch.time = btn.dataset.time;
      this.refresh();
    }));
    screen.querySelector('[data-bk="confirm"]')?.addEventListener('click', () => this.#confirm());
    screen.querySelector('[data-bk="stop"]')?.addEventListener('click', () => this.router.go('my-appointments'));
  }

  #confirm() {
    const ch = this.#choice;
    if (!ch.doctorId || !ch.date || !ch.time) {
      this.notify('Choose a doctor, a date and a time slot first.', 'err');
      return;
    }
    try {
      const done = this.rescheduling
        ? this.appointments.reschedule(this.rescheduling.id, ch.date, ch.time)
        : this.appointments.book(this.#patient.id, ch.doctorId, ch.date, ch.time);
      this.notify(`${this.rescheduling ? 'Appointment moved to' : 'Appointment booked for'} ${AppointmentView.label(done.date)} at ${done.time}.`);
      this.router.go('my-appointments');
    } catch (error) {
      // Double booking: show the reason, drop the chosen slot, stay on this page so the patient can pick again.
      this.notifyError(error);
      if (error instanceof SlotUnavailableError) ch.time = '';
      this.refresh();
    }
  }
}
