// Owner: Nourhan Alaa Eldin & Rotage Waleed Ahmed (Login & Dashboard)
// Week-1 placeholder from the Team Leader. TODO(Nourhan Alaa Eldin & Rotage Waleed Ahmed): build the real screen – see your task PDF.
import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

export default class DashboardView extends BaseView {
  render() {
    const today = isoDate(0);
    void today; void esc;
    return this.placeholder({
      title: 'Admin dashboard',
      owners: 'Nourhan Alaa Eldin & Rotage Waleed Ahmed (Login & Dashboard)',
      pdf: 'Nourhan / Rotage task PDF',
      checks: [
        `Patients: ${this.c.patients.all().length}`,
        `Doctors: ${this.c.doctors.all().length}`,
        `Today's appointments: ${this.c.appointments.all({ date: today }).filter((a) => a.status !== 'Cancelled').length}`,
        `Waiting for a report: ${this.c.reports.waitingForReport().length}`,
        `Newest registration: ${esc(this.c.patients.newest(1)[0]?.name)}`,
      ],
    });
  }
}
