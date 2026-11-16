# HAM Hospital – Hospital Appointment Manager

OOP course project · **frontend only** (HTML, CSS, JavaScript classes) · no backend, no database.
Team leader: **Mohamed Hazem (192400006)**.

The app is one page (`index.html`). The **Router** shows one screen at a time inside `<main id="app">`.
All data lives in memory in the **DataStore**, filled from `js/store/sampleData.js` on start-up (it resets on refresh).

---

## 1. Run it (2 minutes)

1. Install **VS Code** and the **Live Server** extension.
2. Clone the repo (see section 4) and open the folder in VS Code.
3. Right-click `index.html` → **Open with Live Server**.
   (Double-clicking the file will **not** work: JavaScript modules need a local server.)
4. Sign in with:
   - Patient: `01012345678` / `1234`
   - Admin: `ADMIN` / `1234`
5. Open `tests.html` with Live Server. All checks must be green before you open a Pull Request.

Tip: in the browser console, type `ham.store`, `ham.controllers` or `ham.session` to inspect the data.

---

## 2. Who owns what

| Member | Role | Your files |
|---|---|---|
| Mohamed Hazem | Team Leader & System Architect | `index.html`, `js/app.js`, `js/router.js`, `js/session.js`, `js/store/*`, `js/controllers/AuthController.js`, `tests.html`, `js/dev/checks.js` |
| Nourhan Alaa Eldin | Login & Dashboard (coding) – leads Sign in | `js/views/LoginView.js`, `js/views/DashboardView.js`, `css/views/auth.css`, `css/views/dashboard.css` |
| Rotage Waleed Ahmed | Login & Dashboard (coding) – leads Create account | `js/views/SignUpView.js`, `js/views/DashboardView.js`, `css/views/auth.css`, `css/views/dashboard.css` |
| Lojaine Ahmed Mohamed | Patient Module (coding) – registrations | `js/models/Person.js`, `Patient.js`, `Admin.js`, `js/controllers/PatientController.js`, `js/errors/InvalidInputError.js`, `js/views/RegistrationsView.js`, `css/views/patients.css` |
| Loay Hossam | Patient Module (coding) – reports & scans | `js/models/MedicalReport.js`, `Scan.js`, `js/controllers/ReportController.js`, `js/views/ReportsView.js`, `ScanViewer.js` (new), `ReportEditorView.js`, `css/views/reports.css`, `assets/images/scans/` |
| Rodina Elsayed Mohamed | Doctor Registration (coding) | `js/models/Doctor.js`, `GeneralDoctor.js`, `SpecialistDoctor.js`, `Department.js`, `Hospital.js`, `Schedulable.js`, `js/controllers/DoctorController.js`, `js/views/DoctorsView.js`, `css/views/doctors.css`, `assets/images/doctors/` |
| Malak Sherif Gamal Eldeen | Booking & Schedule (coding) | `js/models/Appointment.js`, `js/controllers/AppointmentController.js`, `js/errors/SlotUnavailableError.js`, `DoctorUnavailableError.js`, `js/views/BookingView.js`, `MyAppointmentsView.js`, `AppointmentsView.js`, `css/views/booking.css` |
| Mohammed Wagdy Abdellalem | GUI (general) – theme, components, Home layout, Statistics | `css/theme.css`, `js/views/common/BaseView.js`, `Sidebar.js`, `js/views/HomeView.js`, `css/views/home.css`, `js/controllers/StatsController.js`, `js/views/StatisticsView.js`, `css/views/stats.css` |
| Belal Mohamed Ahmed | GUI (general) – animations, Toast, Modal, images, phone layout | `css/animations.css`, `css/responsive.css`, `js/views/common/Toast.js`, `Modal.js`, `animate.js`, `assets/images/`, Home animations |

Every file starts with an `// Owner:` line. **Only change your own files.** Need a change in someone else's file? Ask them (or Mohamed).

Search the project for `TODO(YourName)` to find your tasks. Your task PDF has screenshots of every screen you build.

---

## 3. How the code fits together

```
View (js/views)  →  Controller (js/controllers)  →  Model (js/models) / DataStore (js/store)
```

- **Views** extend `BaseView`: `render()` returns HTML text, `bind(root)` adds event listeners. No rules here.
- **Controllers** hold the rules and throw custom errors (`InvalidInputError`, `SlotUnavailableError` …). Only controllers change the DataStore.
- **Models** are ES6 classes (inheritance, private fields, getters/setters, polymorphism).
- Inside a view you have `this.c` (all controllers), `this.ctx.session`, `this.ctx.router`.

Move between pages with `this.ctx.router.go('booking', { doctorId: 'd1' })`; the next view reads `this.params.doctorId`.

### Pages (registered in `js/app.js`)

| URL | View | Who can open it |
|---|---|---|
| `#/home` | HomeView | everyone |
| `#/login`, `#/signup` | LoginView, SignUpView | everyone |
| `#/my-appointments`, `#/my-reports`, `#/booking` | MyAppointmentsView, ReportsView, BookingView | patient |
| `#/doctors` | DoctorsView (check `this.ctx.session.isAdmin` to show admin buttons) | patient + admin |
| `#/dashboard`, `#/registrations`, `#/appointments`, `#/medical-reports`, `#/statistics` | admin views | admin |

The Router sends people away from pages they may not open (patients → My Appointments, guests → Sign in).

### Contracts – methods you can already call today

| Controller | Methods |
|---|---|
| `auth` (Mohamed) | `signIn(phoneOrAdmin, password)`, `signUp({name, phone, age, gender, password, confirmPassword})`, `signOut()`, `current()` |
| `patients` (Lojaine) | `all()`, `findById(id)`, `findByPhone(phone)`, `newest(n)`, `register(data)` |
| `doctors` (Rodina) | `all()`, `findById(id)`, `departments()`, `byDepartment(name)`, `isAvailable(id, date)`, `add(data)`, `markUnavailable(id, date, reason)` |
| `appointments` (Malak) | `all({doctorId, date, patientId, status})`, `forPatient(id)`, `nextFor(patientId)`, `freeSlots(doctorId, date)`, `book(patientId, doctorId, date, time)`, `cancel(id, reason)`, `complete(id)` |
| `reports` (Loay) | `byId(id)`, `forAppointment(id)`, `forPatient(id)`, `waitingForReport()`, `publish(appointmentId, data)` |
| `stats` (Wagdy & Belal) | `perDoctor()`, `perDepartment()`, `revenue()` |

These are **week-1 starter versions** written by the team leader so everyone can work in parallel. Each owner finishes their own (look for `TODO`). **Do not rename these methods** – other people call them. Need a new method? Add it and tell the team.

Dates are strings `'YYYY-MM-DD'`, times are `'HH:MM'`. Use `isoDate(0)` from `sampleData.js` for today.

---

## 4. Git workflow (GitHub)

**One time:**
```bash
git clone https://github.com/<team-account>/ham-frontend.git
cd ham-frontend
```

**Every task:**
```bash
git checkout main
git pull                                   # get everyone's latest work
git checkout -b feature/booking-malak      # your branch: feature/<part>-<name>
# ... code, test with Live Server + tests.html ...
git add .
git commit -m "Booking: show free slots for the chosen doctor"
git push -u origin feature/booking-malak
```
Then open a **Pull Request** on GitHub into `main`. Mohamed reviews and merges.

Rules:
- `main` must always run. Never push straight to `main`.
- Small Pull Requests (one screen or one feature).
- No console errors, `tests.html` all green, screen matches your task PDF.
- Add checks for your own controller in `js/dev/checks.js`.

Suggested branch names: `feature/login-nourhan`, `feature/signup-rotage`, `feature/patients-lojaine`, `feature/reports-loay`, `feature/doctors-rodina`, `feature/booking-malak`, `feature/theme-wagdy`, `feature/animations-belal`.

---

## 5. Coding style

- Classes `PascalCase`, methods and variables `camelCase`, constants `UPPER_CASE`, CSS classes `kebab-case`.
- One class per file, `export default`.
- No global variables (except the `window.ham` debug helper in `app.js`).
- Use `esc()` from `BaseView.js` when putting user text into HTML.
- Use the theme colours from `css/theme.css` (`var(--green)`, `var(--mint)` …), never new random colours.
- Buttons: real `<button>`; links: real `<a href>`; every input has a `<label>`.

---

## 6. Plan

| Week | Goal |
|---|---|
| 1 ✅ | Repo, folders, router, session, DataStore + sample data, AuthController, starter controllers, placeholder screens, tests page (**done – team leader**) |
| 2 | Models finished by their owners (private fields, abstract classes, validation); theme.css + common components |
| 3 | Controllers finished with all rules and errors; checks added to `tests.html` |
| 4 | Every placeholder screen replaced with the real design from the prototype |
| 5 | Integration, animations, phone layout, bug fixing |
| 6 | Presentation `TeamName_ProjectName_Presentation.pptx` + code `TeamName_ProjectName_Code.zip`; publish with GitHub Pages |

### Publish with GitHub Pages
Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / root → Save. The app appears at `https://<team-account>.github.io/ham-frontend/`.
