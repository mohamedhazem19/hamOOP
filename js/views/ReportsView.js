// Owner: Loay Hossam (Patient Module – reports)
// Week-1 placeholder from the Team Leader. TODO(Loay Hossam): build the real screen – see your task PDF.
import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

export default class ReportsView extends BaseView {
  render() {
    const today = isoDate(0);
    void today; void esc;
    return this.placeholder({
      title: 'My Reports',
      owners: 'Loay Hossam (Patient Module – reports)',
      pdf: 'Loay task PDF',
      checks: [
        `My reports: ${this.c.reports.forPatient(this.ctx.session.user?.id).map((r) => esc(r.title)).join(', ') || 'none'}`,
      ],
    });
  }
}
