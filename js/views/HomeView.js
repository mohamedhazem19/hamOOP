// Owner: Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed (GUI general)
// Week-1 placeholder from the Team Leader. TODO(Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed): build the real screen – see your task PDF.
import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

export default class HomeView extends BaseView {
  render() {
    const today = isoDate(0);
    void today; void esc;
    return this.placeholder({
      title: 'Home page',
      owners: 'Mohammed Wagdy Abdellalem & Belal Mohamed Ahmed (GUI general)',
      pdf: 'Mohammed_Wagdy / Belal task PDF',
      checks: [
        `Doctors on staff: ${this.c.doctors.all().length}`,
        `Departments: ${this.c.doctors.departments().join(', ')}`,
      ],
    }) + `<p><a class="btn" href="#/login">Sign in</a> <a class="btn btn--ghost" href="#/signup">Create account</a></p>`;
  }
}
