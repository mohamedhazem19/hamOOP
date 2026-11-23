// Owner: Loay Hossam (Patient Module)
// Patient page "My Reports" (#/my-reports): the list of the patient's reports on the left and the
// chosen report on the right. "View report" in My Appointments opens it with { appointmentId }.
// Data: this.c.reports.forPatient() / details() (ReportController). The report itself is drawn by ReportDetails.

import BaseView, { esc } from './common/BaseView.js';
import ReportDetails from './ReportDetails.js';

export default class ReportsView extends BaseView {
  #selectedId = null;

  get #reports() { return this.c.reports; }

  #myReports() {
    const me = this.session?.user;
    return me ? this.#reports.forPatient(me.id) : [];
  }

  /** The report to show: the one asked for (from My Appointments), else the one clicked, else the newest. */
  #selected(list) {
    if (this.#selectedId === null && this.params.appointmentId) {
      this.#selectedId = this.#reports.forAppointment(this.params.appointmentId)?.id ?? null;
    }
    return list.find((r) => r.id === this.#selectedId) ?? list[0] ?? null;
  }

  // ---------- Drawing ----------

  render() {
    const list = this.#myReports();
    const chosen = this.#selected(list);
    return `
      <section class="rp" aria-labelledby="rp-title">
        <header class="rp-head">
          <h1 class="rp-title" id="rp-title">My Reports</h1>
          <p class="rp-muted">Diagnoses, prescriptions and scans from your completed visits</p>
        </header>
        ${list.length === 0 ? `
          <div class="rp-empty">
            <p><strong>You have no reports yet.</strong></p>
            <p class="rp-muted">After a completed visit, your doctor's report appears here.</p>
            <button type="button" class="rp-btn" data-go="my-appointments">See my appointments</button>
          </div>` : `
          <div class="rp-layout">
            <nav class="rp-list" aria-label="My reports">
              <ul>${list.map((r) => this.#item(r, r === chosen)).join('')}</ul>
            </nav>
            <div class="rp-detail" data-role="detail">${chosen ? new ReportDetails(this.#reports.details(chosen)).render() : ''}</div>
          </div>`}
      </section>`;
  }

  #item(report, active) {
    const info = this.#reports.details(report);
    return `
      <li>
        <button type="button" class="rp-item${active ? ' is-active' : ''}" data-report="${esc(report.id)}"${active ? ' aria-current="true"' : ''}>
          <strong>${esc(report.title)}</strong>
          <span>${esc(info.doctorName)}</span>
          <span class="rp-muted">${esc(ReportDetails.longDate(info.date))} · ${report.scanCount} scan${report.scanCount === 1 ? '' : 's'}</span>
        </button>
      </li>`;
  }

  // ---------- Events ----------

  bind(root) {
    this.root = root;
    root.querySelector('[data-go]')?.addEventListener('click', (e) => this.router.go(e.currentTarget.dataset.go));
    root.querySelectorAll('[data-report]').forEach((button) => {
      button.addEventListener('click', () => {
        this.#selectedId = button.dataset.report;
        this.#repaint();
        this.root.querySelector(`[data-report="${CSS.escape(this.#selectedId)}"]`)?.focus();
      });
    });
    const chosen = this.#selected(this.#myReports());
    if (chosen) new ReportDetails(this.#reports.details(chosen)).bind(root);
  }

  #repaint() {
    this.root.innerHTML = this.render();
    this.bind(this.root);
  }
}
