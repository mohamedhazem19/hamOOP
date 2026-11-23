// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// One doctor card. It only DRAWS: render() returns HTML text. The page (DoctorsView) listens
// to the clicks through the data-action attributes, so this class has no logic about booking.
//   patient: portrait, name, badge, department + fee, today's booked-slots bar, hours, [Book with this doctor]
//   admin:   the same + [Upload real photo] and [Mark not available]

import { esc } from './common/BaseView.js';

const PORTRAITS = 4;
const CAMERA = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1-1.5h6.6l1 1.5h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="12.5" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** '2026-11-16' -> 'Mon 16 Nov' (same style as the rest of the app, "Sept" for September). */
export function shortDate(date) {
  const d = new Date(`${date}T00:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default class DoctorCard {
  /**
   * @param {Doctor} doctor
   * @param {{today: string, admin: boolean, booked: number}} options  booked = scheduled visits today
   */
  constructor(doctor, { today, admin = false, booked = 0 } = {}) {
    this.doctor = doctor;
    this.today = today;
    this.admin = admin;
    this.booked = booked;
  }

  /**
   * The doctor's own uploaded photo, otherwise one of the 4 drawn portraits.
   * The portrait follows the number inside the id (d1 -> 1, d2 -> 2 ... d5 -> 1 again),
   * so a doctor always keeps the same portrait.
   */
  static portrait(doctor) {
    if (doctor.photo) return doctor.photo;
    const number = Number(doctor.id.replace(/\D/g, '')) || 1;
    return `assets/images/doctors/portrait-${((number - 1) % PORTRAITS) + 1}.svg`;
  }

  render() {
    const d = this.doctor;
    const slots = d.getSlots(this.today);          // from the Schedulable mixin
    const hours = d.workingHours;
    const offToday = !d.isAvailable(this.today);
    const upcomingOff = d.offDays.filter((day) => day > this.today).sort().slice(0, 3);
    const percent = Math.round((this.booked / slots.length) * 100);

    return `
      <article class="dr-card" data-doctor="${esc(d.id)}" aria-labelledby="dr-name-${esc(d.id)}">
        <header class="dr-card__head">
          <img class="dr-card__photo" src="${esc(DoctorCard.portrait(d))}" alt="Portrait of ${esc(d.name)}" width="56" height="56">
          <div>
            <h3 class="dr-card__name" id="dr-name-${esc(d.id)}">${esc(d.name)}</h3>
            <span class="dr-badge">${esc(d.type)}</span>
          </div>
        </header>

        <p class="dr-card__line">${esc(d.department)} · ${esc(d.calculateFee())} EGP per visit</p>

        ${offToday
    ? '<p class="dr-note dr-note--off">Not available today</p>'
    : `<p class="dr-card__today">Today: <strong>${this.booked}</strong> of ${slots.length} slots booked</p>
           <div class="dr-meter" role="progressbar" aria-label="Slots booked today" aria-valuemin="0" aria-valuemax="${slots.length}" aria-valuenow="${this.booked}">
             <span style="width:${percent}%"></span>
           </div>`}

        <p class="dr-card__hours">Hours: ${esc(hours.start)} – ${esc(hours.end)} (${hours.minutes}-min slots)</p>
        ${upcomingOff.length ? `<p class="dr-card__off">Not available: ${upcomingOff.map(shortDate).map(esc).join(', ')}</p>` : ''}

        ${this.admin ? `
        <input type="file" class="dr-file" accept="image/*" hidden data-photo-for="${esc(d.id)}" aria-label="Photo file for ${esc(d.name)}">
        <button type="button" class="dr-btn dr-btn--upload" data-action="upload" data-id="${esc(d.id)}">${CAMERA}<span>Upload real photo</span></button>
        <button type="button" class="dr-btn dr-btn--warn" data-action="unavailable" data-id="${esc(d.id)}">Mark not available</button>`
    : `<button type="button" class="dr-btn dr-btn--outline" data-action="book" data-id="${esc(d.id)}">Book with this doctor</button>`}
      </article>`;
  }
}
