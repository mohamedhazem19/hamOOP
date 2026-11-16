// Owner: Mohamed Hazem (Team Leader)
// Starts the app: loads sample data, creates the controllers, registers every page, starts the router.

import DataStore from './store/DataStore.js';
import { createSampleData } from './store/sampleData.js';
import session from './session.js';
import Router, { ACCESS } from './router.js';

import AuthController from './controllers/AuthController.js';
import PatientController from './controllers/PatientController.js';
import DoctorController from './controllers/DoctorController.js';
import AppointmentController from './controllers/AppointmentController.js';
import ReportController from './controllers/ReportController.js';
import StatsController from './controllers/StatsController.js';

import HomeView from './views/HomeView.js';
import LoginView from './views/LoginView.js';
import SignUpView from './views/SignUpView.js';
import DashboardView from './views/DashboardView.js';
import RegistrationsView from './views/RegistrationsView.js';
import DoctorsView from './views/DoctorsView.js';
import BookingView from './views/BookingView.js';
import MyAppointmentsView from './views/MyAppointmentsView.js';
import AppointmentsView from './views/AppointmentsView.js';
import ReportsView from './views/ReportsView.js';
import ReportEditorView from './views/ReportEditorView.js';
import StatisticsView from './views/StatisticsView.js';

// Set to true later to keep data after a refresh (needs toJSON on every model first).
const KEEP_DATA_AFTER_REFRESH = false;

const store = DataStore.instance;
if (!(KEEP_DATA_AFTER_REFRESH && store.restore())) store.load(createSampleData());

const patients = new PatientController();
const appointments = new AppointmentController();
const controllers = {
  patients,
  appointments,
  auth: new AuthController(patients),
  doctors: new DoctorController(appointments),
  reports: new ReportController(),
  stats: new StatsController(),
};

const router = new Router({
  appEl: document.getElementById('app'),
  sidebarEl: document.getElementById('sidebar'),
  context: { store, session, controllers },
});

const { PUBLIC, PATIENT, ADMIN } = ACCESS;
// Sidebar order = registration order (patients see theirs, admins see theirs).
router
  .register('home', HomeView, { access: PUBLIC, title: 'Home' })
  .register('login', LoginView, { access: PUBLIC, title: 'Sign in' })
  .register('signup', SignUpView, { access: PUBLIC, title: 'Create account' })
  .register('my-appointments', MyAppointmentsView, { access: PATIENT, title: 'My Appointments', nav: true })
  .register('my-reports', ReportsView, { access: PATIENT, title: 'My Reports', nav: true })
  .register('dashboard', DashboardView, { access: ADMIN, title: 'Dashboard', nav: true })
  .register('registrations', RegistrationsView, { access: ADMIN, title: 'Registrations', nav: true })
  .register('doctors', DoctorsView, { access: [PATIENT, ADMIN], title: 'Doctors', nav: true })
  .register('booking', BookingView, { access: PATIENT, title: 'Book Appointment', nav: true })
  .register('appointments', AppointmentsView, { access: ADMIN, title: 'Appointments', nav: true })
  .register('medical-reports', ReportEditorView, { access: ADMIN, title: 'Medical Reports', nav: true })
  .register('statistics', StatisticsView, { access: ADMIN, title: 'Statistics', nav: true })
  .start('home');

if (KEEP_DATA_AFTER_REFRESH) window.addEventListener('beforeunload', () => store.save());

// Handy while developing: open the browser console and type ham.store, ham.controllers ...
window.ham = { store, session, router, controllers };
