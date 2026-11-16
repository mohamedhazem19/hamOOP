// Owner: Rodina Elsayed Mohamed (Doctor Registration)
// Week-1 placeholder from the Team Leader. TODO(Rodina Elsayed Mohamed): build the real screen – see your task PDF.
import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

export default class DoctorsView extends BaseView {
  render() {
    const today = isoDate(0);
    void today; void esc;
    return this.placeholder({
      title: 'Doctors',
      owners: 'Rodina Elsayed Mohamed (Doctor Registration)',
      pdf: 'Rodina task PDF',
      checks: [
        `Signed in as: ${this.ctx.session.role} (admin sees Add doctor / Mark not available)`,
        `Doctors: ${this.c.doctors.all().map((d) => `${esc(d.name)} – ${d.type}, ${d.calculateFee()} EGP`).join(' · ')}`,
      ],
    });
  }
}
