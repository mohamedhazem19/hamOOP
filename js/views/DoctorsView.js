// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// Screens 1 + 2: the Doctors page (#/doctors).
//   patient: "Our Doctors" – cards with [Book with this doctor]
//   admin:   "Doctor Management" – the Add doctor form + cards with [Upload real photo] and [Mark not available]
// This view only collects clicks and shows results. All rules live in DoctorController
// (add, setPhoto, markUnavailable) – views never change the DataStore (project rule).

import BaseView, { esc } from './common/BaseView.js';
import Toast from './common/Toast.js';
import { isoDate } from '../store/sampleData.js';
import DoctorCard, { shortDate } from './DoctorCard.js';
import UnavailableDialog from './UnavailableDialog.js';
import DoctorController from '../controllers/DoctorController.js';

export default class DoctorsView extends BaseView {
  #department = 'all'; // the department chosen in the filter ('all' = every doctor)

  get #admin() { return Boolean(this.session?.isAdmin); }
  get #today() { return isoDate(0); }
  get #doctors() { return this.c.doctors; }

  // ---------- Drawing ----------
  render() {
    const admin = this.#admin;
    return `
      <section class="dr" aria-labelledby="dr-title">
        <header class="dr-head">
          <div>
            <h1 class="dr-title" id="dr-title">${admin ? 'Doctor Management' : 'Our Doctors'}</h1>
            <p class="dr-sub">${admin ? 'Doctors, departments and working hours' : 'Choose a doctor and book a free time slot'}</p>
          </div>
          <p class="dr-today">Today: ${esc(shortDate(this.#today))}</p>
        </header>

        ${admin ? this.#form() : ''}

        ${this.#filter()}

        <p class="dr-status" data-role="status" role="status" aria-live="polite" hidden></p>
        <div class="dr-grid" data-role="grid">${this.#cards()}</div>

        <p class="dr-foot">Prototype with sample data. Changes reset when the page reloads.</p>
      </section>`;
  }

  #form() {
    const departments = this.#doctors.departments();
    return `
      <form class="dr-add" data-role="add" novalidate aria-labelledby="dr-add-title">
        <h2 class="dr-add__title" id="dr-add-title">Add doctor</h2>
        <div class="dr-add__row">
          <label class="dr-field" for="dr-name"><span>Full name</span>
            <input id="dr-name" name="name" type="text" placeholder="Dr. ..." autocomplete="off">
          </label>
          <label class="dr-field" for="dr-dept"><span>Department</span>
            <select id="dr-dept" name="department">
              ${departments.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join('')}
            </select>
          </label>
          <label class="dr-field" for="dr-type"><span>Type</span>
            <select id="dr-type" name="type">
              ${Object.values(DoctorController.TYPES).map((type) => `<option value="${esc(type)}">${esc(type)}</option>`).join('')}
            </select>
          </label>
          <label class="dr-field" for="dr-fee"><span>Fee (EGP)</span>
            <input id="dr-fee" name="fee" type="number" min="1" step="1" inputmode="numeric">
          </label>
          <button type="submit" class="dr-btn dr-btn--primary">Save doctor</button>
        </div>
        <p class="dr-error" data-role="form-error" role="alert" hidden></p>
      </form>`;
  }

  /** "Show: All departments / Cardiology / ..." – the cards are filtered by department. */
  #filter() {
    const departments = this.#doctors.departments();
    return `
      <div class="dr-filter">
        <label class="dr-field" for="dr-filter"><span>Show</span>
          <select id="dr-filter">
            <option value="all">All departments</option>
            ${departments.map((name) => `<option value="${esc(name)}"${name === this.#department ? ' selected' : ''}>${esc(name)}</option>`).join('')}
          </select>
        </label>
      </div>`;
  }

  #cards() {
    const today = this.#today;
    const admin = this.#admin;
    const doctors = this.#department === 'all' ? this.#doctors.all() : this.#doctors.byDepartment(this.#department);
    if (doctors.length === 0) return `<p class="dr-empty">No doctors in ${esc(this.#department)} yet.</p>`;
    return doctors
      .map((doctor) => new DoctorCard(doctor, { today, admin, booked: this.#doctors.bookingsOn(doctor.id, today).length }).render())
      .join('');
  }

  // ---------- Events ----------
  bind(root) {
    const grid = root.querySelector('[data-role="grid"]');
    this.root = root;

    grid.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const { action, id } = button.dataset;
      if (action === 'book') this.router.go('booking', { doctorId: id });
      if (action === 'upload') grid.querySelector(`input[data-photo-for="${id}"]`)?.click();
      if (action === 'unavailable') this.#openDialog(id, button);
    });

    grid.addEventListener('change', (event) => {
      const input = event.target.closest('input[data-photo-for]');
      if (input?.files?.length) this.#uploadPhoto(input.dataset.photoFor, input.files[0], input);
    });

    root.querySelector('#dr-filter')?.addEventListener('change', (event) => {
      this.#department = event.target.value;
      this.#repaint();
    });

    root.querySelector('[data-role="add"]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#addDoctor(event.currentTarget);
    });
  }

  #addDoctor(form) {
    const error = form.querySelector('[data-role="form-error"]');
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    error.hidden = true;
    try {
      const doctor = this.#doctors.add({
        name: form.elements.name.value,
        department: form.elements.department.value,
        type: form.elements.type.value,
        fee: form.elements.fee.value,
      });
      form.elements.name.value = '';
      form.elements.fee.value = '';
      this.#repaint();
      this.#say(`${doctor.name} was added to ${doctor.department}.`, 'ok');
      form.elements.name.focus();
    } catch (problem) {
      // InvalidInputError carries `field`: highlight that input and show the message.
      error.textContent = problem.message;
      error.hidden = false;
      const field = form.elements[problem.field];
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    }
  }

  #uploadPhoto(id, file, input) {
    this.#doctors.setPhoto(id, file)
      .then(() => {
        this.#repaint();
        this.#say('Photo updated.', 'ok');
      })
      .catch((problem) => this.#say(problem.message, 'err'))
      .finally(() => { input.value = ''; });
  }

  #openDialog(id, opener) {
    const doctor = this.#doctors.findById(id);
    if (!doctor) return;
    new UnavailableDialog({
      doctor,
      today: this.#today,
      controller: this.#doctors,
      onDone: ({ date, cancelled }) => {
        this.#repaint();
        const n = cancelled.length;
        this.#say(`${doctor.name} is not available on ${shortDate(date)}. ${n === 0 ? 'No bookings were affected.' : `${n} appointment${n > 1 ? 's were' : ' was'} cancelled and the patient${n > 1 ? 's' : ''} notified.`}`, 'ok');
      },
    }).open(opener);
  }

  // ---------- Helpers ----------
  #repaint() {
    this.root.querySelector('[data-role="grid"]').innerHTML = this.#cards();
  }

  /** Belal's Toast when it is written, otherwise a message line above the cards. */
  #say(message, type = 'ok') {
    if (typeof Toast?.show === 'function') {
      Toast.show(message, type);
      return;
    }
    const line = this.root.querySelector('[data-role="status"]');
    line.textContent = message;
    line.className = `dr-status dr-status--${type}`;
    line.hidden = false;
  }
}
