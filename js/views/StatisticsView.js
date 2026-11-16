// Owner: Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed (GUI general)
// Week-1 placeholder from the Team Leader. TODO(Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed): build the real screen – see your task PDF.
import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

export default class StatisticsView extends BaseView {
  render() {
    const today = isoDate(0);
    void today; void esc;
    return this.placeholder({
      title: 'Statistics',
      owners: 'Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed (GUI general)',
      pdf: 'Mohammed_Wagdy task PDF',
      checks: [
        `Revenue (completed visits): ${this.c.stats.revenue()} EGP`,
        `Per department: ${this.c.stats.perDepartment().map((d) => `${d.department} ${d.total}`).join(' · ')}`,
      ],
    });
  }
}
