// Owner: Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed (GUI general)
// The public Home page from the prototype: menu, hero, departments, about with live numbers,
// why us, and a call to action. The numbers come from the controllers (DataStore as backup),
// so they change when patients register or appointments are booked.

import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

/** Short text and card colour for each department (same as the prototype). */
const DEPARTMENT_INFO = {
  Cardiology: { text: 'Heart checkups, ECG and long-term heart care.', tint: '#EAF5EF', icon: 'heart' },
  Pediatrics: { text: 'Gentle care for babies, children and teens.', tint: '#EEF4F7', icon: 'child' },
  Orthopedics: { text: 'Bones, joints, fractures and sports injuries.', tint: '#F3F6EE', icon: 'bone' },
  Dermatology: { text: 'Skin, hair and nail conditions, treated with care.', tint: '#FBF4EA', icon: 'drop' },
};
const DEFAULT_INFO = { text: 'Expert care from our specialists.', tint: '#EAF5EF', icon: 'heart' };

/** Simple line icons (decoration only, hidden from screen readers). */
const ICONS = {
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  child: '<circle cx="12" cy="12" r="8"/><path d="M9 14.5c1.6 1.6 4.4 1.6 6 0"/><circle cx="9.5" cy="10" r=".6"/><circle cx="14.5" cy="10" r=".6"/>',
  bone: '<path d="M8.6 17.2l8.6-8.6a2.6 2.6 0 1 0 1.2-4.4 2.6 2.6 0 1 0-4.4 1.2l-8.6 8.6a2.6 2.6 0 1 0-1.2 4.4 2.6 2.6 0 1 0 4.4-1.2z"/>',
  drop: '<path d="M12 3.5l5.2 5.2a7.3 7.3 0 1 1-10.4 0z"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  folder: '<path d="M4 6h6l2 2h8v10H4z"/>',
  chart: '<path d="M5 19V9M12 19V5M19 19v-7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};
const icon = (name, size = 24) => `<svg class="home-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

export default class HomeView extends BaseView {
  // ---------- Numbers for the page (controller first, DataStore as backup) ----------

  #doctors() { return this.c.doctors?.all?.() ?? this.store?.doctors ?? []; }
  #patients() { return this.c.patients?.all?.() ?? this.store?.patients ?? []; }

  #departments() {
    const fromHospital = this.store?.hospital?.departments?.map((d) => d.name);
    return fromHospital?.length ? fromHospital : [...new Set(this.#doctors().map((d) => d.department))];
  }

  #todayAppointments() {
    const today = isoDate(0);
    return this.c.appointments?.all?.({ date: today })
      ?? (this.store?.appointments ?? []).filter((a) => a.date === today);
  }

  /** Free slots today across all doctors (0 if the booking module is not ready). */
  #freeSlotsToday() {
    const today = isoDate(0);
    return this.#doctors().reduce((sum, doctor) => {
      try {
        return sum + (this.c.appointments?.freeSlots?.(doctor.id, today) ?? []).filter((s) => s.free).length;
      } catch {
        return sum;
      }
    }, 0);
  }

  // ---------- Pieces ----------

  #departmentCard(name) {
    const info = DEPARTMENT_INFO[name] ?? DEFAULT_INFO;
    return `
      <li>
        <button type="button" class="home-dept" style="--tint: ${esc(info.tint)}" data-home="book" aria-label="Book an appointment in ${esc(name)}">
          <span class="home-dept__icon">${icon(info.icon, 40)}</span>
          <span class="home-dept__name">${esc(name)}</span>
          <span class="home-dept__text">${esc(info.text)}</span>
          <span class="home-dept__go" aria-hidden="true">${icon('arrow', 18)}</span>
        </button>
      </li>`;
  }

  #stat(value, label) {
    return `<div class="home-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`;
  }

  #reason(iconName, title, text) {
    return `
      <li class="home-reason">
        <span class="home-reason__icon">${icon(iconName)}</span>
        <h3>${esc(title)}</h3>
        <p>${esc(text)}</p>
      </li>`;
  }

  // ---------- BaseView contract ----------

  render() {
    const doctors = this.#doctors().length;
    const departments = this.#departments();
    const signedIn = this.session?.isSignedIn;

    return `
      <div class="home">
        <header class="home-nav">
          <a class="home-brand" href="#/home">
            <img src="assets/images/logo.svg" alt="" width="32" height="32">
            <span>HAM Hospital</span>
          </a>
          <nav class="home-nav__links" aria-label="Home page sections">
            <button type="button" data-scroll="home-top">Home</button>
            <button type="button" data-scroll="home-departments">Departments</button>
            <button type="button" data-scroll="home-about">About</button>
            <button type="button" data-scroll="home-why">Why us</button>
          </nav>
          <div class="home-nav__actions">
            <button type="button" class="btn btn--ghost" data-home="account">${signedIn ? 'My account' : 'Sign in'}</button>
            <button type="button" class="btn" data-home="book">Book Appointment ${icon('arrow', 18)}</button>
          </div>
        </header>

        <section class="home-hero" id="home-top" aria-labelledby="home-title">
          <div class="home-hero__text">
            <p class="home-eyebrow">Better Care, Easier Booking</p>
            <h1 id="home-title">Smart Booking for a <span>Healthier</span> You</h1>
            <p class="home-lead">Our Hospital Appointment Manager connects patients with the right doctor in seconds: pick a department, choose a free slot, and you're booked. No double bookings, no waiting on the phone.</p>
            <div class="home-hero__actions">
              <button type="button" class="btn" data-home="book">Book an Appointment ${icon('arrow', 18)}</button>
              <button type="button" class="btn btn--ghost" data-scroll="home-departments">Explore departments</button>
            </div>
          </div>
          <div class="home-hero__art" aria-hidden="true">
            <div class="home-hero__blob"></div>
            <div class="home-float home-float--a"><strong>${esc(doctors)}</strong><span>Doctors on staff</span></div>
            <div class="home-float home-float--b"><span class="home-dot"></span><strong>${esc(this.#freeSlotsToday())} free slots</strong><span>available today</span></div>
            <div class="home-hero__badge">${icon('heart', 56)}<span>Your Health, Our Priority</span></div>
          </div>
        </section>

        <section class="home-section" id="home-departments" aria-labelledby="home-dept-title">
          <p class="home-eyebrow">Departments</p>
          <h2 id="home-dept-title">Care for every part of you</h2>
          <ul class="home-depts">${departments.map((d) => this.#departmentCard(d)).join('')}</ul>
        </section>

        <section class="home-section home-about" id="home-about" aria-labelledby="home-about-title">
          <div class="home-about__text">
            <p class="home-eyebrow">About the system</p>
            <h2 id="home-about-title">Modern Hospital for a Healthier Future</h2>
            <p>Reception staff register patients, manage doctors and their departments, and book appointments only into free time slots. Everything is saved, and clear reports show each doctor's workload.</p>
            <button type="button" class="btn" data-home="account">Open the system ${icon('arrow', 18)}</button>
          </div>
          <div class="home-stats">
            ${this.#stat(doctors, 'Expert doctors')}
            ${this.#stat(departments.length, 'Departments')}
            ${this.#stat(this.#patients().length, 'Registered patients')}
            ${this.#stat(this.#todayAppointments().length, 'Appointments today')}
          </div>
        </section>

        <section class="home-section" id="home-why" aria-labelledby="home-why-title">
          <p class="home-eyebrow">Why choose us</p>
          <h2 id="home-why-title">Trusted Care, Simple Booking</h2>
          <p class="home-section__lead">Built with object-oriented design, so every part (patients, doctors, appointments) is clean, reliable and easy to extend.</p>
          <ul class="home-reasons">
            ${this.#reason('calendar', 'Easy Booking', 'Pick a doctor and a free slot in a few clicks.')}
            ${this.#reason('shield', 'No Double Booking', 'Taken slots are blocked automatically.')}
            ${this.#reason('folder', 'Patient Records', 'Every patient and visit kept in one place.')}
            ${this.#reason('chart', 'Clear Reports', 'Workload and fees per doctor and department.')}
          </ul>
        </section>

        <section class="home-cta" aria-labelledby="home-cta-title">
          <h2 id="home-cta-title">Your Health, Our Mission</h2>
          <p>Take the first step toward a healthier you. Book your appointment today.</p>
          <button type="button" class="btn btn--light" data-home="book">Book Appointment ${icon('arrow', 18)}</button>
        </section>

        <footer class="home-footer">OOP Course Project · Hospital Appointment Manager · Prototype with sample data</footer>
      </div>`;
  }

  bind(root) {
    // Menu links scroll inside the page (the # in the address is used by the Router).
    root.querySelectorAll('[data-scroll]').forEach((button) => {
      button.addEventListener('click', () => {
        root.querySelector(`#${button.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Booking needs a patient account: guests go to Sign in first, then on to booking.
    root.querySelectorAll('[data-home="book"]').forEach((button) => {
      button.addEventListener('click', () => {
        if (this.session?.isPatient) this.router.go('booking');
        else if (this.session?.isAdmin) this.router.go('appointments');
        else this.router.go('login', { next: 'booking' });
      });
    });

    root.querySelectorAll('[data-home="account"]').forEach((button) => {
      button.addEventListener('click', () => {
        if (this.session?.isAdmin) this.router.go('dashboard');
        else if (this.session?.isPatient) this.router.go('my-appointments');
        else this.router.go('login');
      });
    });
  }
}
