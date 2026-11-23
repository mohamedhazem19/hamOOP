// Owner: Loay Hossam (Patient Module) – with Lojaine Ahmed Mohamed (published reports list)
// Admin page "Medical Reports" (#/medical-reports):
//   1. "Waiting for a report": completed visits without a report (Dashboard and Appointments open
//      this page with { appointmentId } to pre-select one).
//   2. The report form: title, diagnosis, vitals, notes, prescriptions and scans (rows can be added).
//   3. "Published reports": every report, newest first; [View] shows it in the Modal.
// All rules live in ReportController (publish refuses bad input); this page only collects and shows.

import BaseView, { esc } from './common/BaseView.js';
import Toast from './common/Toast.js';
import Modal from './common/Modal.js';
import Scan from '../models/Scan.js';
import ReportDetails from './ReportDetails.js';

const SCAN_LABELS = { xray: 'X-ray', dexa: 'Bone density', ecg: 'ECG', lab: 'Blood test' };

export default class ReportEditorView extends BaseView {
  #selectedId = null; // the appointment being written up

  get #reports() { return this.c.reports; }

  #visitInfo(appointment) {
    return this.c.appointments.details(appointment);
  }

  #selected(waiting) {
    if (this.#selectedId === null && this.params.appointmentId) this.#selectedId = this.params.appointmentId;
    return waiting.find((a) => a.id === this.#selectedId) ?? null;
  }

  // ---------- Drawing ----------

  render() {
    const waiting = this.#reports.waitingForReport();
    const chosen = this.#selected(waiting);
    const published = this.#reports.all();
    return `
      <section class="rp" aria-labelledby="rp-title">
        <header class="rp-head">
          <h1 class="rp-title" id="rp-title">Medical Reports</h1>
          <p class="rp-muted">Write the report for a completed visit; the patient sees it in My Reports</p>
        </header>

        <div class="rp-layout rp-layout--editor">
          <article class="rp-card rp-waiting" aria-labelledby="rp-wait-title">
            <h2 class="rp-card__title" id="rp-wait-title">Waiting for a report <span class="rp-count">${waiting.length}</span></h2>
            ${waiting.length ? `<ul>${waiting.map((a) => this.#waitingItem(a, a === chosen)).join('')}</ul>`
              : '<p class="rp-muted">Every completed visit has a report.</p>'}
          </article>

          <article class="rp-card" aria-labelledby="rp-form-title">
            ${chosen ? this.#form(chosen) : `
              <h2 class="rp-card__title" id="rp-form-title">Write a report</h2>
              <p class="rp-muted">${waiting.length ? 'Choose a visit on the left to start.' : 'Nothing to write right now. Complete a visit in Appointments first.'}</p>`}
          </article>
        </div>

        <article class="rp-card" aria-labelledby="rp-pub-title">
          <h2 class="rp-card__title" id="rp-pub-title">Published reports <span class="rp-count">${published.length}</span></h2>
          ${this.#publishedTable(published)}
        </article>
      </section>`;
  }

  #waitingItem(appointment, active) {
    const info = this.#visitInfo(appointment);
    return `
      <li>
        <button type="button" class="rp-item${active ? ' is-active' : ''}" data-visit="${esc(appointment.id)}"${active ? ' aria-current="true"' : ''}>
          <strong>${esc(info.patientName)}</strong>
          <span>${esc(info.doctorName)} · ${esc(info.department)}</span>
          <span class="rp-muted">${esc(ReportDetails.longDate(appointment.date))} · ${esc(appointment.time)}</span>
        </button>
      </li>`;
  }

  #form(appointment) {
    const info = this.#visitInfo(appointment);
    return `
      <form class="rp-form" data-role="form" novalidate aria-labelledby="rp-form-title">
        <h2 class="rp-card__title" id="rp-form-title">Report for ${esc(info.patientName)}</h2>
        <p class="rp-muted">${esc(info.doctorName)} · ${esc(info.department)} · ${esc(ReportDetails.longDate(appointment.date))} at ${esc(appointment.time)}</p>

        <p class="rp-error" data-role="error" role="alert" hidden></p>

        <label class="rp-field" for="rp-f-title"><span>Title *</span>
          <input id="rp-f-title" name="title" type="text" maxlength="80" placeholder="e.g. Left wrist injury" autocomplete="off">
        </label>
        <label class="rp-field" for="rp-f-diagnosis"><span>Diagnosis *</span>
          <textarea id="rp-f-diagnosis" name="diagnosis" rows="2"></textarea>
        </label>
        <div class="rp-row2">
          <label class="rp-field" for="rp-f-vitals"><span>Vitals</span>
            <input id="rp-f-vitals" name="vitals" type="text" placeholder="BP 120/80 · Pulse 76 · Temp 36.8 °C" autocomplete="off">
          </label>
        </div>
        <label class="rp-field" for="rp-f-notes"><span>Doctor's notes</span>
          <textarea id="rp-f-notes" name="notes" rows="3"></textarea>
        </label>

        <fieldset class="rp-set">
          <legend>Prescriptions</legend>
          <div data-role="meds">${ReportEditorView.#medRow()}</div>
          <button type="button" class="rp-btn rp-btn--ghost" data-add="med">+ Add medicine</button>
        </fieldset>

        <fieldset class="rp-set">
          <legend>Scans and tests</legend>
          <div data-role="scans"></div>
          <button type="button" class="rp-btn rp-btn--ghost" data-add="scan">+ Add scan</button>
        </fieldset>

        <div class="rp-actions">
          <button type="button" class="rp-btn rp-btn--ghost" data-role="cancel">Cancel</button>
          <button type="submit" class="rp-btn">Publish report</button>
        </div>
      </form>`;
  }

  static #medRow() {
    return `
      <div class="rp-line" data-row="med">
        <input type="text" name="medicine" placeholder="Medicine" aria-label="Medicine" autocomplete="off">
        <input type="text" name="how" placeholder="How to take it" aria-label="How to take it" autocomplete="off">
        <button type="button" class="rp-x" data-remove aria-label="Remove this medicine">×</button>
      </div>`;
  }

  static #scanRow() {
    return `
      <div class="rp-line rp-line--scan" data-row="scan">
        <select name="type" aria-label="Scan type">
          ${Scan.TYPES.map((t) => `<option value="${esc(t)}">${esc(SCAN_LABELS[t] ?? t)}</option>`).join('')}
        </select>
        <input type="text" name="name" placeholder="Name, e.g. X-ray – Left wrist" aria-label="Scan name" autocomplete="off">
        <input type="text" name="finding" placeholder="Finding" aria-label="Finding" autocomplete="off">
        <input type="text" name="imagePath" placeholder="Picture path (optional)" aria-label="Picture path" autocomplete="off">
        <button type="button" class="rp-x" data-remove aria-label="Remove this scan">×</button>
      </div>`;
  }

  #publishedTable(list) {
    if (list.length === 0) return '<p class="rp-muted">No reports yet.</p>';
    return `
      <div class="rp-table-scroll">
        <table class="rp-table">
          <thead><tr><th scope="col">Visit</th><th scope="col">Title</th><th scope="col">Patient</th>
            <th scope="col">Doctor</th><th scope="col">Scans</th><th scope="col"><span class="rp-sr">Actions</span></th></tr></thead>
          <tbody>
            ${list.map((r) => {
              const info = this.#reports.details(r);
              return `
                <tr>
                  <td>${esc(ReportDetails.longDate(info.date))}</td>
                  <td><strong>${esc(r.title)}</strong></td>
                  <td>${esc(info.patientName)}</td>
                  <td>${esc(info.doctorName)}</td>
                  <td>${r.scanCount}</td>
                  <td><button type="button" class="rp-btn rp-btn--small rp-btn--ghost" data-view="${esc(r.id)}">View</button></td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  // ---------- Events ----------

  bind(root) {
    this.root = root;
    root.querySelectorAll('[data-visit]').forEach((button) => {
      button.addEventListener('click', () => {
        this.#selectedId = button.dataset.visit;
        this.#repaint();
        this.root.querySelector('#rp-f-title')?.focus();
      });
    });
    root.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => this.#view(button.dataset.view));
    });

    const form = root.querySelector('[data-role="form"]');
    if (!form) return;
    form.querySelector('[data-add="med"]').addEventListener('click', () => this.#addRow(form, 'meds', ReportEditorView.#medRow()));
    form.querySelector('[data-add="scan"]').addEventListener('click', () => this.#addRow(form, 'scans', ReportEditorView.#scanRow()));
    form.addEventListener('click', (event) => {
      if (event.target.closest('[data-remove]')) event.target.closest('[data-row]')?.remove();
    });
    form.querySelector('[data-role="cancel"]').addEventListener('click', () => { this.#selectedId = ''; this.#repaint(); });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#publish(form);
    });
  }

  #addRow(form, where, html) {
    const box = form.querySelector(`[data-role="${where}"]`);
    box.insertAdjacentHTML('beforeend', html);
    box.lastElementChild.querySelector('input, select')?.focus();
  }

  #collect(form) {
    const rows = (kind) => [...form.querySelectorAll(`[data-row="${kind}"]`)].map((row) =>
      Object.fromEntries([...row.querySelectorAll('input, select')].map((el) => [el.name, el.value.trim()])));
    return {
      title: form.elements.title.value,
      diagnosis: form.elements.diagnosis.value,
      vitals: form.elements.vitals.value,
      notes: form.elements.notes.value,
      prescriptions: rows('med').filter((m) => m.medicine),
      scans: rows('scan').filter((s) => s.name || s.finding || s.imagePath),
    };
  }

  #publish(form) {
    const error = form.querySelector('[data-role="error"]');
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    error.hidden = true;
    try {
      const report = this.#reports.publish(this.#selectedId, this.#collect(form));
      const info = this.#reports.details(report);
      this.#selectedId = '';
      this.#repaint();
      ReportEditorView.#toast(`Report published for ${info.patientName}.`, 'ok');
    } catch (problem) {
      error.textContent = problem.message;
      error.hidden = false;
      const field = form.elements[problem.field];
      if (field && field.focus) { field.setAttribute('aria-invalid', 'true'); field.focus(); } else error.focus?.();
    }
  }

  #view(reportId) {
    const report = this.#reports.byId(reportId);
    if (!report) return;
    const details = new ReportDetails(this.#reports.details(report));
    const box = Modal.open(`<div class="rp-modal">${details.render({ showPatient: true })}</div>`);
    details.bind(box);
  }

  #repaint() {
    this.root.innerHTML = this.render();
    this.bind(this.root);
  }

  static #toast(message, type) {
    if (typeof Toast?.show === 'function') Toast.show(message, type);
  }
}
