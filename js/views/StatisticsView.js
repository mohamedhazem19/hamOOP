// Owner: Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed (GUI general)
// Statistics page (#/statistics, admin only): number tiles, bars per doctor and per department,
// and an income table. All numbers come from StatsController (this.c.stats); this view only draws.
// Bars grow in with Belal's animate() (css/animations.css), and stay still for reduced motion.

import BaseView, { esc } from './common/BaseView.js';
import animate from './common/animate.js';
import { isoDate } from '../store/sampleData.js';

const money = (value) => `${Number(value).toLocaleString('en-US')} EGP`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default class StatisticsView extends BaseView {
  get #stats() { return this.c.stats; }

  // ---------- Drawing ----------

  render() {
    const sum = this.#stats.summary();
    const doctors = this.#stats.perDoctor();
    const departments = this.#stats.perDepartment();
    const today = new Date(`${isoDate(0)}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

    return `
      <section class="st" aria-labelledby="st-title">
        <header class="st-head">
          <div>
            <h1 class="st-title" id="st-title">Statistics</h1>
            <p class="st-sub">Visits and income per doctor and department</p>
          </div>
          <p class="st-date">Today: ${esc(today)}</p>
        </header>

        <div class="st-tiles">
          ${StatisticsView.#tile('Revenue', money(sum.revenue), 'from completed visits', true)}
          ${StatisticsView.#tile('Completed visits', sum.completed, `of ${plural(sum.total, 'visit')}`)}
          ${StatisticsView.#tile('Upcoming visits', sum.upcoming, 'still scheduled')}
          ${StatisticsView.#tile('Cancelled', sum.cancelled, 'not counted in revenue')}
        </div>

        <div class="st-grid">
          <article class="st-card" aria-labelledby="st-doc-title">
            <h2 class="st-card__title" id="st-doc-title">Visits per doctor</h2>
            ${StatisticsView.#legend()}
            ${StatisticsView.#bars(doctors.map((r) => ({
              label: r.doctor.name, note: r.doctor.department, total: r.total, completed: r.completed,
            })))}
          </article>

          <article class="st-card" aria-labelledby="st-dept-title">
            <h2 class="st-card__title" id="st-dept-title">Visits per department</h2>
            ${StatisticsView.#legend()}
            ${StatisticsView.#bars(departments.map((r) => ({
              label: r.department, note: plural(r.doctors, 'doctor'), total: r.total, completed: r.completed,
            })))}
          </article>

          <article class="st-card st-card--wide" aria-labelledby="st-money-title">
            <h2 class="st-card__title" id="st-money-title">Income per doctor</h2>
            <div class="st-table-scroll">
              <table class="st-table">
                <thead>
                  <tr><th scope="col">Doctor</th><th scope="col">Department</th><th scope="col">Type</th>
                    <th scope="col" class="st-num">Fee</th><th scope="col" class="st-num">Completed</th>
                    <th scope="col" class="st-num">Revenue</th></tr>
                </thead>
                <tbody>
                  ${doctors.map((r) => `
                    <tr>
                      <td class="st-strong">${esc(r.doctor.name)}</td>
                      <td>${esc(r.doctor.department)}</td>
                      <td>${esc(r.doctor.type ?? '')}</td>
                      <td class="st-num">${esc(money(r.doctor.calculateFee?.() ?? r.doctor.fee ?? 0))}</td>
                      <td class="st-num">${esc(r.completed)}</td>
                      <td class="st-num st-strong">${esc(money(r.revenue))}</td>
                    </tr>`).join('')}
                </tbody>
                <tfoot>
                  <tr><th scope="row" colspan="4">Total</th><td class="st-num">${esc(sum.completed)}</td>
                    <td class="st-num st-strong">${esc(money(sum.revenue))}</td></tr>
                </tfoot>
              </table>
            </div>
          </article>
        </div>

        <p class="st-foot">Prototype with sample data. Revenue counts completed visits only.</p>
      </section>`;
  }

  static #tile(label, value, note, main = false) {
    return `
      <div class="st-tile${main ? ' st-tile--main' : ''}">
        <span class="st-tile__label">${esc(label)}</span>
        <strong class="st-tile__value">${esc(value)}</strong>
        <span class="st-tile__note">${esc(note)}</span>
      </div>`;
  }

  static #legend() {
    return `
      <p class="st-legend">
        <span><i class="st-key st-key--done" aria-hidden="true"></i>Completed</span>
        <span><i class="st-key st-key--all" aria-hidden="true"></i>Scheduled</span>
      </p>`;
  }

  /** Horizontal bars. The longest bar is 100%; the dark part of a bar is the completed visits. */
  static #bars(rows) {
    if (rows.length === 0) return '<p class="st-empty">No data yet.</p>';
    const max = Math.max(1, ...rows.map((r) => r.total));
    return `
      <ul class="st-bars">
        ${rows.map((r) => {
          const width = Math.round((r.total / max) * 100);
          const done = r.total ? Math.round((r.completed / r.total) * 100) : 0;
          return `
            <li class="st-bar">
              <div class="st-bar__label"><strong>${esc(r.label)}</strong><span>${esc(r.note)}</span></div>
              <div class="st-bar__track" role="img" aria-label="${esc(`${r.label}: ${plural(r.total, 'visit')}, ${r.completed} completed`)}">
                <div class="st-bar__fill" style="width: ${width}%">
                  <div class="st-bar__done" style="width: ${done}%"></div>
                </div>
              </div>
              <span class="st-bar__value">${esc(r.total)}</span>
            </li>`;
        }).join('')}
      </ul>`;
  }

  // ---------- Events ----------

  bind(root) {
    // Nothing to click: the bars and tiles just animate in.
    root.querySelectorAll('.st-bar__fill').forEach((bar, i) => animate(bar, 'grow', i * 60));
    animate.stagger?.(root.querySelector('.st-tiles'), 'fadeUp', 70);
  }
}
