// Owner: Malak Sherif Gamal Eldeen (Booking & Schedule)
// Week-1 placeholder from the Team Leader. TODO(Malak Sherif Gamal Eldeen): build the real screen – see your task PDF.
import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

export default class BookingView extends BaseView {
  render() {
    const today = isoDate(0);
    void today; void esc;
    return this.placeholder({
      title: 'Book appointment',
      owners: 'Malak Sherif Gamal Eldeen (Booking & Schedule)',
      pdf: 'Malak task PDF',
      checks: [
        `Free slots today for Dr. Ahmed Fathy: ${this.c.appointments.freeSlots('d1', today).filter((s) => s.free).map((s) => s.time).join(', ')}`,
      ],
    });
  }
}
