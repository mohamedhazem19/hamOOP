// Owner: Loay Hossam & Lojaine Ahmed Mohamed (Patient Module)
// Week-1 placeholder from the Team Leader. TODO(Loay Hossam & Lojaine Ahmed Mohamed): build the real screen – see your task PDF.
import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

export default class ReportEditorView extends BaseView {
  render() {
    const today = isoDate(0);
    void today; void esc;
    return this.placeholder({
      title: 'Medical reports (admin)',
      owners: 'Loay Hossam & Lojaine Ahmed Mohamed (Patient Module)',
      pdf: 'Loay task PDF',
      checks: [
        `Visits waiting for a report: ${this.c.reports.waitingForReport().length}`,
      ],
    });
  }
}
