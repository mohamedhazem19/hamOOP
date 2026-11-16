// Owner: Loay Hossam (Patient Module – reports)
export default class Scan {
  static TYPES = Object.freeze({ xray: 'X-ray (bone scan)', dexa: 'Bone density scan', ecg: 'ECG', lab: 'Lab test' });

  constructor({ id, type, name, finding = '', imagePath = '' }) {
    this.id = id;
    this.type = type;           // 'xray' | 'dexa' | 'ecg' | 'lab'
    this.name = name;
    this.finding = finding;
    this.imagePath = imagePath;
  }

  get typeLabel() {
    return Scan.TYPES[this.type] || 'Scan';
  }
}
