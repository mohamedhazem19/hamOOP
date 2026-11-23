// Owner: Loay Hossam (Patient Module)
// Draws ONE medical report: header, diagnosis, vitals, notes, prescriptions and scan cards.
// Used by both report pages (patient "My Reports" and admin "Medical Reports"), so the report
// looks the same everywhere. Clicking a scan opens it large in Belal's Modal (dark mode).

import { esc } from './common/BaseView.js';
import Modal from './common/Modal.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export default class ReportDetails {
  #info;

  /** @param {{report, date, time, doctorName, department, patientName}} info  from ReportController.details() */
  constructor(info) {
    this.#info = info;
  }

  /** '2026-11-15' -> '15 Nov 2026' */
  static longDate(date) {
    if (!date) return '';
    const d = new Date(`${date}T00:00:00`);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  /** @param {{showPatient?: boolean}} options  the admin page also shows who the patient is */
  render({ showPatient = false } = {}) {
    const { report, date, time, doctorName, department, patientName } = this.#info;
    const meds = report.prescriptions;
    const scans = report.scans;
    return `
      <article class="rp-report" aria-labelledby="rp-report-${esc(report.id)}">
        <header class="rp-report__head">
          <p class="rp-eyebrow">Medical report · ${esc(ReportDetails.longDate(date))}${time ? ` · ${esc(time)}` : ''}</p>
          <h2 class="rp-report__title" id="rp-report-${esc(report.id)}">${esc(report.title)}</h2>
          <p class="rp-muted">${showPatient ? `${esc(patientName)} · ` : ''}${esc(doctorName)}${department ? ` · ${esc(department)}` : ''}</p>
        </header>

        <section class="rp-block">
          <h3>Diagnosis</h3>
          <p>${esc(report.diagnosis)}</p>
        </section>

        ${report.vitals ? `<section class="rp-block"><h3>Vitals</h3><p class="rp-vitals">${esc(report.vitals)}</p></section>` : ''}
        ${report.notes ? `<section class="rp-block"><h3>Doctor's notes</h3><p>${esc(report.notes)}</p></section>` : ''}

        <section class="rp-block">
          <h3>Prescriptions</h3>
          ${meds.length ? `
            <ul class="rp-meds">
              ${meds.map((m) => `<li><strong>${esc(m.medicine)}</strong>${m.how ? `<span>${esc(m.how)}</span>` : ''}</li>`).join('')}
            </ul>` : '<p class="rp-muted">No medicine prescribed.</p>'}
        </section>

        <section class="rp-block">
          <h3>Scans and tests <span class="rp-count">${scans.length}</span></h3>
          ${scans.length ? `
            <ul class="rp-scans">
              ${scans.map((s) => `
                <li class="rp-scan">
                  <button type="button" class="rp-scan__open" data-scan="${esc(s.id)}" aria-label="Open ${esc(s.name)} large">
                    ${s.imagePath
                      ? `<img src="${esc(s.imagePath)}" alt="" loading="lazy">`
                      : '<span class="rp-scan__none" aria-hidden="true">No picture</span>'}
                  </button>
                  <div class="rp-scan__text">
                    <span class="rp-scan__type">${esc(s.typeLabel)}</span>
                    <strong>${esc(s.name)}</strong>
                    ${s.finding ? `<span class="rp-muted">${esc(s.finding)}</span>` : ''}
                  </div>
                </li>`).join('')}
            </ul>` : '<p class="rp-muted">No scans for this visit.</p>'}
        </section>
      </article>`;
  }

  /** Scan pictures open large in the Modal. Call after the HTML is on the page. */
  bind(root) {
    const scans = this.#info.report.scans;
    root.querySelectorAll('[data-scan]').forEach((button) => {
      button.addEventListener('click', () => {
        const scan = scans.find((s) => s.id === button.dataset.scan);
        if (!scan) return;
        Modal.open(`
          <figure class="rp-viewer">
            ${scan.imagePath ? `<img src="${esc(scan.imagePath)}" alt="${esc(scan.name)}">` : '<p class="rp-viewer__none">No picture for this scan.</p>'}
            <figcaption>
              <span class="rp-scan__type">${esc(scan.typeLabel)}</span>
              <strong>${esc(scan.name)}</strong>
              ${scan.finding ? `<span>${esc(scan.finding)}</span>` : ''}
            </figcaption>
          </figure>`, { dark: true });
      });
    });
  }
}
