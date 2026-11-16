// Owner: Mohamed Hazem (Team Leader) – every member adds checks for their own controller below.
// Run: open tests.html with Live Server. Green = pass, red = fail.

import DataStore from '../store/DataStore.js';
import { createSampleData, isoDate } from '../store/sampleData.js';
import session from '../session.js';
import Router from '../router.js';
import AuthController from '../controllers/AuthController.js';
import PatientController from '../controllers/PatientController.js';
import DoctorController from '../controllers/DoctorController.js';
import AppointmentController from '../controllers/AppointmentController.js';
import ReportController from '../controllers/ReportController.js';
import StatsController from '../controllers/StatsController.js';
import SlotUnavailableError from '../errors/SlotUnavailableError.js';
import InvalidInputError from '../errors/InvalidInputError.js';

const results = [];
function check(name, fn) {
  try { fn(); results.push({ name, ok: true }); }
  catch (e) { results.push({ name, ok: false, msg: e.message }); }
}
function assert(cond, msg = 'expected true') { if (!cond) throw new Error(msg); }
function throws(fn, ErrorClass, msg = `expected ${ErrorClass.name}`) {
  try { fn(); } catch (e) { if (e instanceof ErrorClass) return; throw new Error(`${msg}, got ${e.name}: ${e.message}`); }
  throw new Error(`${msg}, but nothing was thrown`);
}

function fresh() {
  DataStore.instance.load(createSampleData());
  session.end();
  const patients = new PatientController();
  const appointments = new AppointmentController();
  return { store: DataStore.instance, patients, appointments, auth: new AuthController(patients),
    doctors: new DoctorController(appointments), reports: new ReportController(), stats: new StatsController() };
}

// ---------- Mohamed: store, auth, router ----------
check('DataStore is a singleton', () => {
  assert(DataStore.instance === DataStore.instance);
  let blocked = false; try { new DataStore(); } catch { blocked = true; }
  assert(blocked, 'new DataStore() should be blocked');
});
check('Sample data loads into model objects', () => {
  const { store } = fresh();
  assert(store.doctors.length === 4 && store.patients.length === 4, 'counts');
  assert(store.doctors[0].calculateFee() === 400, 'Dr. Ahmed fee');
});
check('ADMIN / 1234 signs in as admin (any letter case)', () => {
  const { auth } = fresh();
  auth.signIn('admin', '1234');
  assert(session.isAdmin && session.role === 'admin');
});
check('Wrong admin password is refused', () => { const { auth } = fresh(); throws(() => auth.signIn('ADMIN', '0000'), InvalidInputError); });
check('Patient signs in with phone + password', () => {
  const { auth } = fresh();
  const p = auth.signIn('01012345678', '1234');
  assert(p.name === 'Youssef Ali' && session.isPatient);
});
check('Unknown phone gets the same message as a wrong password', () => {
  const { auth } = fresh();
  let a = '', b = '';
  try { auth.signIn('01099999999', '1234'); } catch (e) { a = e.message; }
  try { auth.signIn('01012345678', 'nope'); } catch (e) { b = e.message; }
  assert(a && a === b, `"${a}" vs "${b}"`);
});
check('Sign up creates a patient and signs in', () => {
  const { auth, store } = fresh();
  auth.signUp({ name: 'Sara Ahmed', phone: '01122334455', age: '29', gender: 'Female', password: 'abcd', confirmPassword: 'abcd' });
  assert(store.patients.length === 5 && session.user.name === 'Sara Ahmed');
});
check('Sign up refuses a phone that is already used', () => {
  const { auth } = fresh();
  throws(() => auth.signUp({ name: 'Copy Cat', phone: '01012345678', age: 20, password: 'abcd', confirmPassword: 'abcd' }), InvalidInputError);
});
check('Sign up refuses passwords that do not match', () => {
  const { auth } = fresh();
  throws(() => auth.signUp({ name: 'Sara Ahmed', phone: '01122334455', age: 20, password: 'abcd', confirmPassword: 'abce' }), InvalidInputError);
});
check('Router: patients cannot open admin pages', () => {
  assert(!Router.canAccess({ access: ['admin'] }, 'patient'));
  assert(Router.canAccess({ access: ['patient', 'admin'] }, 'patient'));
  assert(Router.canAccess({ access: ['public'] }, 'guest'));
  assert(Router.fallbackFor('patient') === 'my-appointments' && Router.fallbackFor('guest') === 'login');
});

// ---------- Malak: appointments ----------
check('Booking a taken slot throws SlotUnavailableError', () => {
  const { appointments } = fresh();
  throws(() => appointments.book('p1', 'd1', isoDate(0), '09:00'), SlotUnavailableError);
});
check('Booking a free slot works and the slot becomes taken', () => {
  const { appointments } = fresh();
  appointments.book('p1', 'd2', isoDate(1), '12:00');
  assert(!appointments.freeSlots('d2', isoDate(1)).find((s) => s.time === '12:00').free);
});
check('nextFor() finds Youssef\'s appointment in 3 days', () => {
  const { appointments } = fresh();
  assert(appointments.nextFor('p1')?.date === isoDate(3));
});

// ---------- Rodina: doctors ----------
check('Doctor not available cancels that day and blocks slots', () => {
  const { doctors, appointments } = fresh();
  const cancelled = doctors.markUnavailable('d1', isoDate(0), 'Sick leave');
  assert(cancelled.length === 2, `cancelled ${cancelled.length}`);
  assert(appointments.freeSlots('d1', isoDate(0)).every((s) => !s.free));
});

// ---------- Loay: reports ----------
check('Youssef has 2 reports; 2 visits wait for a report', () => {
  const { reports } = fresh();
  assert(reports.forPatient('p1').length === 2 && reports.waitingForReport().length === 2);
});

// ---------- Wagdy & Belal: statistics ----------
check('Statistics: revenue counts completed visits only', () => {
  const { stats } = fresh();
  assert(stats.revenue() === 400 + 250 + 350 + 400, `revenue ${stats.revenue()}`);
});

// ---------- Lojaine: add your PatientController checks here ----------

// ---------- show results ----------
const ul = document.getElementById('results');
results.forEach((r) => {
  const li = document.createElement('li');
  li.className = r.ok ? 'pass' : 'fail';
  li.textContent = `${r.ok ? '✔' : '✘'} ${r.name}${r.ok ? '' : ' — ' + r.msg}`;
  ul.appendChild(li);
});
const failed = results.filter((r) => !r.ok).length;
const summary = document.getElementById('summary');
summary.textContent = failed ? `${failed} of ${results.length} checks failed` : `All ${results.length} checks passed`;
summary.className = failed ? 'fail' : 'pass';
window.__checks = { total: results.length, failed, results };
