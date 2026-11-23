// Owner: Mohamed Hazem (Team Leader)
// Run: open tests.html with Live Server. Green = pass, red = fail, yellow = waiting for a teammate.
// These checks cover Mohamed's code only (store, sign in, router).
// Each teammate adds a section for their own controller at the bottom.

import DataStore from '../store/DataStore.js';
import { createSampleData, isoDate } from '../store/sampleData.js';
import session from '../session.js';
import Router from '../router.js';
import AuthController from '../controllers/AuthController.js';
import PatientController from '../controllers/PatientController.js';
import StatsController from '../controllers/StatsController.js';
import ReportController from '../controllers/ReportController.js';
import InvalidInputError from '../errors/InvalidInputError.js';
import SlotUnavailableError from '../errors/SlotUnavailableError.js';
import AppointmentController from '../controllers/AppointmentController.js';

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

// ---------- Malak: AppointmentController (book, cancel, freeSlots) ----------
// Sample data: today d1 is booked at 09:00 (a1, Karim) and 10:30 (a4, Hana); Youssef (p1) has a6 with d3 in 3 days at 10:30.
function bookingSetup() {
  const { store } = fresh();
  // Keep the clock at 08:00 so today's 09:00+ slots remain future during these checks.
  const todayAtEight = new Date(); todayAtEight.setHours(8, 0, 0, 0);
  return { store, ac: new AppointmentController(store, () => new Date(todayAtEight)) };
}

/** Runs fn and returns the error it throws (or null), so a check can look at the error's class. */
function errorOf(fn) {
  try { fn(); } catch (e) { return e; }
  return null;
}
const slotState = (ac, doctorId, date) => ac.freeSlots(doctorId, date).map((s) => `${s.time}:${s.free ? 'free' : s.reason}`).join(' ');

check('freeSlots(): returns the 8 slots 09:00–12:30 (every 30 min) for a free day', () => {
  const { ac } = bookingSetup();
  const slots = ac.freeSlots('d1', isoDate(2));
  assert(slots.map((s) => s.time).join() === '09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30', 'slot times');
  assert(slots.every((s) => s.free === true && s.reason === ''), 'a day without appointments is completely free');
});
check('freeSlots(): marks the doctor\'s booked slots as Booked and leaves the rest free', () => {
  const { ac } = bookingSetup();
  assert(slotState(ac, 'd1', isoDate(0)) === '09:00:Booked 09:30:free 10:00:free 10:30:Booked 11:00:free 11:30:free 12:00:free 12:30:free', slotState(ac, 'd1', isoDate(0)));
  assert(ac.freeSlots('d2', isoDate(0)).filter((s) => !s.free).map((s) => s.time).join() === '10:00', 'another doctor has only 10:00 taken');
});
check('freeSlots(): a cancelled appointment frees its slot, a completed one keeps it taken', () => {
  const { ac } = bookingSetup();
  ac.cancel('a1', 'Doctor not available');
  assert(ac.freeSlots('d1', isoDate(0))[0].free, '09:00 is free again after cancel');
  ac.complete('a4');
  assert(!ac.freeSlots('d1', isoDate(0))[3].free, '10:30 stays taken after complete');
});
check('freeSlots(): a past date has no free slots; an unknown doctor or a bad date is refused', () => {
  const { ac } = bookingSetup();
  assert(ac.freeSlots('d1', isoDate(-1)).every((s) => !s.free && s.reason === 'Past date'), 'yesterday is closed');
  assert(errorOf(() => ac.freeSlots('nope', isoDate(1))) instanceof InvalidInputError, 'unknown doctor');
  assert(errorOf(() => ac.freeSlots('d1', '2026-02-31')) instanceof InvalidInputError, 'impossible date');
  assert(errorOf(() => ac.freeSlots('d1', 'tomorrow')) instanceof InvalidInputError, 'not a date');
});
check('freeSlots(): a day off closes every slot (uses the doctor\'s isAvailable)', () => {
  const { store, ac } = bookingSetup();
  needs(typeof store.findDoctor('d2').addOffDay === 'function', 'Rodina: Doctor.addOffDay()');
  store.findDoctor('d2').addOffDay(isoDate(4));
  assert(ac.freeSlots('d2', isoDate(4)).every((s) => !s.free && s.reason === 'Doctor not available'));
  assert(ac.freeSlots('d2', isoDate(5)).every((s) => s.free), 'the next day is still free');
});

check('book(): a free slot is booked, becomes taken, and shows up in all() and forPatient()', () => {
  const { ac } = bookingSetup();
  const a = ac.book('p1', 'd1', isoDate(2), '09:00');
  assert(a.isScheduled && a.patientId === 'p1' && a.doctorId === 'd1' && a.time === '09:00');
  assert(ac.all({ date: isoDate(2) }).length === 1 && ac.forPatient('p1').includes(a), 'stored');
  assert(!ac.freeSlots('d1', isoDate(2))[0].free, 'slot is now taken');
});
check('book(): an already taken slot is rejected with SlotUnavailableError and nothing is saved', () => {
  const { ac } = bookingSetup();
  const before = ac.all().length;
  const e = errorOf(() => ac.book('p1', 'd1', isoDate(0), '09:00')); // a1 already holds d1 today 09:00
  assert(e instanceof SlotUnavailableError, `expected SlotUnavailableError, got ${e?.name}`);
  assert(e.who === 'doctor' && e.message.length > 0, 'the message says who is busy');
  assert(ac.all().length === before, 'no appointment was added');
});
check('book(): booking the same slot twice – the second try is rejected', () => {
  const { ac } = bookingSetup();
  ac.book('p1', 'd2', isoDate(2), '11:00');
  assert(errorOf(() => ac.book('p2', 'd2', isoDate(2), '11:00')) instanceof SlotUnavailableError, 'second patient, same doctor and time');
});
check('book(): the same patient cannot have two appointments at the same date and time', () => {
  const { ac } = bookingSetup();
  const e = errorOf(() => ac.book('p1', 'd1', isoDate(3), '10:30')); // p1 already has a6 (d3) then
  assert(e instanceof SlotUnavailableError && e.who === 'patient', `got ${e?.name}`);
});
check('book(): past dates, bad times, unknown people are refused and nothing is saved', () => {
  const { ac } = bookingSetup();
  const before = ac.all().length;
  assert(errorOf(() => ac.book('p1', 'd2', isoDate(-1), '09:00')) instanceof InvalidInputError, 'past date');
  assert(errorOf(() => ac.book('p1', 'd2', isoDate(1), '13:00')) instanceof InvalidInputError, 'time outside the slots');
  assert(errorOf(() => ac.book('p1', 'd2', isoDate(1), '09:15')) instanceof InvalidInputError, 'time between slots');
  assert(errorOf(() => ac.book('nobody', 'd2', isoDate(1), '09:00')) instanceof InvalidInputError, 'unknown patient');
  assert(errorOf(() => ac.book('p1', 'nobody', isoDate(1), '09:00')) instanceof InvalidInputError, 'unknown doctor');
  assert(ac.all().length === before, 'nothing saved');
});

check('book(): any slot today can be booked, even late in the evening', () => {
  const { store } = bookingSetup();
  const todayEvening = new Date(); todayEvening.setHours(19, 35, 0, 0);
  const ac = new AppointmentController(store, () => new Date(todayEvening));
  const appointment = ac.book('p1', 'd4', isoDate(0), '09:30');
  assert(appointment.isScheduled && appointment.time === '09:30', '09:30 today booked at 19:35');
});
check('book(): a date before today is still refused', () => {
  const { store } = bookingSetup();
  const todayEvening = new Date(); todayEvening.setHours(19, 35, 0, 0);
  const ac = new AppointmentController(store, () => new Date(todayEvening));
  assert(errorOf(() => ac.book('p1', 'd4', isoDate(-1), '11:00')) instanceof InvalidInputError, 'yesterday refused');
});
check('freeSlots(): every slot today is open unless already booked', () => {
  const { store } = bookingSetup();
  const todayEvening = new Date(); todayEvening.setHours(19, 35, 0, 0);
  const ac = new AppointmentController(store, () => new Date(todayEvening));
  const slots = ac.freeSlots('d4', isoDate(0));
  assert(slots.every((s) => s.free || s.reason === 'Booked'), 'no slot closed because of the time of day');
  assert(slots.find((s) => s.time === '09:00')?.free === true, '09:00 is free in the evening');
});

check('cancel(): stores the status and the reason', () => {
  const { ac } = bookingSetup();
  const a = ac.cancel('a6', 'Hospital emergency');
  assert(a.isCancelled && a.cancelReason === 'Hospital emergency');
  assert(ac.all({ status: 'Cancelled' }).some((x) => x.id === 'a6'), 'visible through all({ status })');
});
check('cancel(): frees the slot so another patient can book it', () => {
  const { ac } = bookingSetup();
  assert(errorOf(() => ac.book('p1', 'd1', isoDate(0), '09:00')) instanceof SlotUnavailableError, 'taken before the cancel');
  ac.cancel('a1', 'Patient request');
  const again = ac.book('p1', 'd1', isoDate(0), '09:00');
  assert(again.isScheduled && again.patientId === 'p1', 'p1 can now book the cancelled slot');
  assert(!ac.freeSlots('d1', isoDate(0))[0].free, 'and the slot is taken again');
});
check('cancel(): needs a reason, and a cancelled or completed appointment cannot be cancelled', () => {
  const { ac } = bookingSetup();
  assert(errorOf(() => ac.cancel('a6', '  ')) instanceof InvalidInputError, 'empty reason');
  assert(ac.all().find((a) => a.id === 'a6').isScheduled, 'still scheduled after the refused cancel');
  ac.cancel('a6', 'Other');
  assert(errorOf(() => ac.cancel('a6', 'Other')) instanceof InvalidInputError, 'cancel twice');
  assert(errorOf(() => ac.cancel('a7', 'Other')) instanceof InvalidInputError, 'a7 is already completed');
  assert(errorOf(() => ac.cancel('zzz', 'Other')) instanceof InvalidInputError, 'unknown id');
});

// ---------- Wagdy & Belal: StatsController ----------
check('Stats: revenue counts completed visits only (sample data = 1,400 EGP)', () => {
  const { store } = fresh();
  const stats = new StatsController(store);
  assert(stats.revenue() === 1400, `revenue was ${stats.revenue()}`);
  const sum = stats.summary();
  assert(sum.completed === 4 && sum.upcoming === 6 && sum.cancelled === 1, 'completed 4, upcoming 6, cancelled 1');
  assert(sum.total === 10, 'total = scheduled + completed (cancelled not counted)');
});
check('Stats: one row per doctor and per department', () => {
  const { store } = fresh();
  const stats = new StatsController(store);
  const d1 = stats.perDoctor().find((r) => r.doctor.id === 'd1');
  assert(d1.total === 4 && d1.completed === 2 && d1.revenue === 800, 'Dr. Ahmed Fathy: 4 visits, 2 completed, 800 EGP');
  const depts = stats.perDepartment();
  assert(depts.length === 4 && depts.every((r) => r.doctors === 1), '4 departments, 1 doctor each');
  assert(depts.reduce((t, r) => t + r.revenue, 0) === stats.revenue(), 'departments add up to the revenue');
});
check('Stats: a cancelled visit never adds revenue', () => {
  const { store } = fresh();
  const stats = new StatsController(store);
  const before = stats.revenue();
  store.appointments.find((a) => a.id === 'a1').cancel('Patient request');
  assert(stats.revenue() === before && stats.summary().cancelled === 2);
});

// ---------- Loay: ReportController ----------
check('Reports: completed visits without a report are waiting (sample data = a7, a8)', () => {
  const { store } = fresh();
  const reports = new ReportController(store);
  const ids = reports.waitingForReport().map((a) => a.id).sort();
  assert(ids.join(',') === 'a7,a8', `waiting: ${ids.join(',')}`);
  assert(reports.forAppointment('a10')?.id === 'r1' && reports.forAppointment('a7') === null);
  assert(reports.forPatient('p1').map((r) => r.id).join(',') === 'r1,r2', 'p1 has r1 and r2, newest first');
});
check('Reports: publish needs a completed visit, a title and a diagnosis', () => {
  const { store } = fresh();
  const reports = new ReportController(store);
  throwsError(() => reports.publish('a1', { title: 'x', diagnosis: 'y' }), 'a1 is not completed');
  throwsError(() => reports.publish('a7', { title: 'Check-up', diagnosis: '' }), 'empty diagnosis');
  throwsError(() => reports.publish('a10', { title: 'Again', diagnosis: 'y' }), 'a10 already has a report');
  assert(store.reports.length === 2, 'nothing was stored');
});
check('Reports: publish stores the report and the visit stops waiting', () => {
  const { store } = fresh();
  const reports = new ReportController(store);
  const r = reports.publish('a7', { title: 'Heart follow-up', diagnosis: 'Stable',
    prescriptions: [{ medicine: 'Aspirin 81 mg', how: 'Once daily' }, { medicine: '' }],
    scans: [{ type: 'ecg', name: 'ECG – follow-up' }] });
  assert(store.reports.length === 3 && reports.forAppointment('a7') === r);
  assert(r.prescriptions.length === 1 && r.scanCount === 1, 'empty medicine row dropped, scan kept');
  assert(!reports.waitingForReport().some((a) => a.id === 'a7'));
});

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
