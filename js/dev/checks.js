// Owner: Mohamed Hazem (Team Leader)
// Run: open tests.html with Live Server. Green = pass, red = fail, yellow = waiting for a teammate.
// These checks cover Mohamed's code only (store, sign in, router).
// Each teammate adds a section for their own controller at the bottom.

import DataStore from '../store/DataStore.js';
import { createSampleData } from '../store/sampleData.js';
import session from '../session.js';
import Router from '../router.js';
import AuthController from '../controllers/AuthController.js';
import PatientController from '../controllers/PatientController.js';

const results = [];
class Waiting extends Error {}
function check(name, fn) {
  try { fn(); results.push({ name, state: 'pass' }); }
  catch (e) { results.push({ name, state: e instanceof Waiting ? 'wait' : 'fail', msg: e.message }); }
}
function assert(cond, msg = 'expected true') { if (!cond) throw new Error(msg); }
function needs(ok, who) { if (!ok) throw new Waiting(`waiting for ${who}`); }
function throwsError(fn, msg = 'expected an error') {
  try { fn(); } catch { return; }
  throw new Error(msg);
}

function fresh() {
  DataStore.instance.load(createSampleData());
  session.end();
  const patients = new PatientController();
  return { store: DataStore.instance, patients, auth: new AuthController(patients) };
}

// ---------- Mohamed: DataStore ----------
check('DataStore is a singleton (new DataStore() is blocked)', () => {
  assert(DataStore.instance === DataStore.instance);
  let blocked = false; try { new DataStore(); } catch { blocked = true; }
  assert(blocked, 'new DataStore() should be blocked');
});
check('Sample data loads (4 doctors, 4 patients, 11 appointments, 2 reports)', () => {
  const { store } = fresh();
  assert(store.doctors.length === 4 && store.patients.length === 4, 'doctors / patients');
  assert(store.appointments.length === 11 && store.reports.length === 2, 'appointments / reports');
});
check('nextId() gives new ids that never repeat', () => {
  const { store } = fresh();
  const a = store.nextId('p'), b = store.nextId('p');
  assert(a !== b && a.startsWith('p'), `${a} ${b}`);
});

// ---------- Mohamed: AuthController + Session ----------
check('ADMIN / 1234 signs in as admin (any letter case)', () => {
  const { auth } = fresh();
  auth.signIn('admin', '1234');
  assert(session.isAdmin && session.role === 'admin');
});
check('Wrong admin password is refused', () => {
  const { auth } = fresh();
  throwsError(() => auth.signIn('ADMIN', '0000'));
  assert(!session.isSignedIn, 'nobody signed in');
});
check('Empty phone or password is refused', () => {
  const { auth } = fresh();
  throwsError(() => auth.signIn('', '1234'));
  throwsError(() => auth.signIn('ADMIN', ''));
});
check('Sign out ends the session', () => {
  const { auth } = fresh();
  auth.signIn('ADMIN', '1234'); auth.signOut();
  assert(!session.isSignedIn && session.role === 'guest');
});
check('Patient signs in with phone + password', () => {
  const { auth, patients } = fresh();
  needs(typeof patients.findByPhone === 'function', 'Lojaine: PatientController.findByPhone()');
  const p = auth.signIn('01012345678', '1234');
  assert(p.name === 'Youssef Ali' && session.isPatient);
});
check('Unknown phone gets the same message as a wrong password', () => {
  const { auth, patients } = fresh();
  needs(typeof patients.findByPhone === 'function', 'Lojaine: PatientController.findByPhone()');
  let a = '', b = '';
  try { auth.signIn('01099999999', '1234'); } catch (e) { a = e.message; }
  try { auth.signIn('01012345678', 'nope'); } catch (e) { b = e.message; }
  assert(a && a === b, `"${a}" vs "${b}"`);
});
check('Sign up refuses short or different passwords', () => {
  const { auth } = fresh();
  throwsError(() => auth.signUp({ name: 'Sara Ahmed', phone: '01122334455', age: 29, password: 'ab', confirmPassword: 'ab' }));
  throwsError(() => auth.signUp({ name: 'Sara Ahmed', phone: '01122334455', age: 29, password: 'abcd', confirmPassword: 'abce' }));
});
check('Sign up creates a patient and signs in', () => {
  const { auth, store, patients } = fresh();
  needs(typeof patients.register === 'function', 'Lojaine: PatientController.register()');
  auth.signUp({ name: 'Sara Ahmed', phone: '01122334455', age: '29', gender: 'Female', password: 'abcd', confirmPassword: 'abcd' });
  assert(store.patients.length === 5 && session.user.name === 'Sara Ahmed');
});

// ---------- Mohamed: Router ----------
check('Router: who may open which page', () => {
  assert(!Router.canAccess({ access: ['admin'] }, 'patient'), 'patient blocked from admin page');
  assert(Router.canAccess({ access: ['patient', 'admin'] }, 'patient'), 'shared page');
  assert(Router.canAccess({ access: ['public'] }, 'guest'), 'public page');
  assert(!Router.canAccess({ access: ['patient'] }, 'guest'), 'guest blocked from patient page');
});
check('Router: where blocked people are sent', () => {
  assert(Router.fallbackFor('admin') === 'dashboard');
  assert(Router.fallbackFor('patient') === 'my-appointments');
  assert(Router.fallbackFor('guest') === 'login');
});
check('Router: a screen that is not built yet shows a friendly page', () => {
  const html = Router.notBuiltPage({ title: 'Booking', View: class BookingView {} });
  assert(html.includes('Not built yet') && html.includes('BookingView.js'));
});

// ---------- Teammates: add your checks below ----------
// Lojaine (PatientController) · Rodina (DoctorController) · Malak (AppointmentController)
// Loay (ReportController) · Wagdy & Belal (StatsController)

session.end();

// ---------- show results ----------
const ul = document.getElementById('results');
const icon = { pass: '✔', fail: '✘', wait: '…' };
results.forEach((r) => {
  const li = document.createElement('li');
  li.className = r.state;
  li.textContent = `${icon[r.state]} ${r.name}${r.msg ? ' — ' + r.msg : ''}`;
  ul.appendChild(li);
});
const failed = results.filter((r) => r.state === 'fail').length;
const waiting = results.filter((r) => r.state === 'wait').length;
const summary = document.getElementById('summary');
summary.textContent = failed
  ? `${failed} of ${results.length} checks failed`
  : `${results.length - waiting} checks passed${waiting ? `, ${waiting} waiting for teammates` : ''}`;
summary.className = failed ? 'fail' : 'pass';
window.__checks = { total: results.length, failed, waiting, results };
