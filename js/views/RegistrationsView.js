// Owner: Lojaine Ahmed Mohamed (Patient Module)
// Week-1 placeholder from the Team Leader. TODO(Lojaine Ahmed Mohamed): build the real screen – see your task PDF.
import BaseView, { esc } from './common/BaseView.js';
import { isoDate } from '../store/sampleData.js';

export default class RegistrationsView extends BaseView {
  render() {
    const today = isoDate(0);
    void today; void esc;
    return this.placeholder({
      title: 'Patient registrations',
      owners: 'Lojaine Ahmed Mohamed (Patient Module)',
      pdf: 'Lojaine task PDF',
      checks: [
        `Registered patients: ${this.c.patients.all().map((p) => esc(p.name)).join(', ')}`,
      ],
    });
  }
}
