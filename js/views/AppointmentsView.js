// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Week-1 placeholder from the Team Leader. TODO(Malak Sherif Gamal Eldeen): build the real screen – see your task PDF.
import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

export default class AppointmentsView extends BaseView {
  render() {
    const today = isoDate(0);
    void today; void esc;
    return this.placeholder({
      title: 'Appointments (admin)',
      owners: 'Malak Sherif Gamal Eldeen (Booking & Schedule)',
      pdf: 'Malak task PDF',
      checks: [
        `All appointments: ${this.c.appointments.all().length}`,
        `Scheduled: ${this.c.appointments.all({ status: 'Scheduled' }).length}`,
      ],
    });
  }
}
