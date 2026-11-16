// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Week-1 placeholder from the Team Leader. TODO(Malak Sherif Gamal Eldeen): build the real screen – see your task PDF.
import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

export default class MyAppointmentsView extends BaseView {
  render() {
    const today = isoDate(0);
    void today; void esc;
    return this.placeholder({
      title: 'My Appointments',
      owners: 'Malak Sherif Gamal Eldeen (Booking & Schedule)',
      pdf: 'Malak task PDF',
      checks: [
        `Hello ${esc(this.ctx.session.user?.name)}`,
        `Next appointment: ${(() => { const n = this.c.appointments.nextFor(this.ctx.session.user?.id); return n ? `${n.date} at ${n.time}` : 'none'; })()}`,
        `All my appointments: ${this.c.appointments.forPatient(this.ctx.session.user?.id).length}`,
      ],
    });
  }
}
