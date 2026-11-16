// Owner: Mohamed Hazem (Team Leader)
// Plain sample data. DataStore.load() turns these objects into model objects.
// Dates are relative to "today" so the demo always has upcoming and past visits.

export function isoDate(offsetDays = 0, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + offsetDays);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function createSampleData(from = new Date()) {
  const day = (n) => isoDate(n, from);
  return {
    hospital: { name: 'HAM Hospital' },
    departments: ['Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology'],

    doctors: [
      { id: 'd1', name: 'Dr. Ahmed Fathy', phone: '01000000001', department: 'Cardiology', type: 'Specialist', fee: 400, specialty: 'Heart rhythm', photo: '', offDays: [] },
      { id: 'd2', name: 'Dr. Sara Nabil', phone: '01000000002', department: 'Pediatrics', type: 'General', fee: 250, photo: '', offDays: [] },
      { id: 'd3', name: 'Dr. Omar Khaled', phone: '01000000003', department: 'Orthopedics', type: 'Specialist', fee: 350, specialty: 'Sports injuries', photo: '', offDays: [] },
      { id: 'd4', name: 'Dr. Mona Adel', phone: '01000000004', department: 'Dermatology', type: 'General', fee: 200, photo: '', offDays: [] },
    ],

    // Demo password for every sample patient: 1234
    patients: [
      { id: 'p1', name: 'Youssef Ali', phone: '01012345678', age: 34, gender: 'Male', password: '1234', registeredOn: day(-60) },
      { id: 'p2', name: 'Hana Mostafa', phone: '01198765432', age: 27, gender: 'Female', password: '1234', registeredOn: day(-21) },
      { id: 'p3', name: 'Karim Samir', phone: '01234567890', age: 45, gender: 'Male', password: '1234', registeredOn: day(-6) },
      { id: 'p4', name: 'Nour Ibrahim', phone: '01555123456', age: 8, gender: 'Female', password: '1234', registeredOn: day(-1) },
    ],

    appointments: [
      { id: 'a1', patientId: 'p3', doctorId: 'd1', date: day(0), time: '09:00', status: 'Scheduled' },
      { id: 'a2', patientId: 'p4', doctorId: 'd2', date: day(0), time: '10:00', status: 'Scheduled' },
      { id: 'a3', patientId: 'p3', doctorId: 'd3', date: day(0), time: '11:30', status: 'Scheduled' },
      { id: 'a4', patientId: 'p2', doctorId: 'd1', date: day(0), time: '10:30', status: 'Scheduled' },
      { id: 'a5', patientId: 'p2', doctorId: 'd4', date: day(1), time: '09:30', status: 'Scheduled' },
      { id: 'a6', patientId: 'p1', doctorId: 'd3', date: day(3), time: '10:30', status: 'Scheduled' },
      { id: 'a7', patientId: 'p3', doctorId: 'd1', date: day(-1), time: '09:30', status: 'Completed' },
      { id: 'a8', patientId: 'p4', doctorId: 'd2', date: day(-1), time: '11:00', status: 'Completed' },
      { id: 'a9', patientId: 'p1', doctorId: 'd4', date: day(-1), time: '10:00', status: 'Cancelled', cancelReason: 'Patient request' },
      { id: 'a10', patientId: 'p1', doctorId: 'd3', date: day(-8), time: '10:00', status: 'Completed' },
      { id: 'a11', patientId: 'p1', doctorId: 'd1', date: day(-34), time: '11:30', status: 'Completed' },
    ],

    reports: [
      {
        id: 'r1', appointmentId: 'a10', title: 'Left wrist injury', followUpId: 'a6',
        diagnosis: 'Hairline (non-displaced) fracture of the left radius, near the wrist',
        vitals: 'BP 120/80 · Pulse 76 · Temp 36.8 °C',
        notes: 'Fell on an outstretched hand. Small hairline fracture with good alignment. Splint for 3–4 weeks.',
        prescriptions: [{ name: 'Pain relief tablets', how: 'As directed on the pack, after meals, only when needed' },
                        { name: 'Calcium + Vitamin D', how: 'Once daily for 6 weeks' }],
        scans: [
          { id: 's1', type: 'xray', name: 'X-ray – Left wrist (PA view)', finding: 'Thin non-displaced fracture line at the distal radius.', imagePath: 'assets/images/scans/xray-wrist.png' },
          { id: 's2', type: 'dexa', name: 'Bone density (DEXA) – Lumbar spine', finding: 'Normal bone density for age (T-score −0.8).', imagePath: 'assets/images/scans/dexa-spine.png' },
        ],
      },
      {
        id: 'r2', appointmentId: 'a11', title: 'Routine heart check-up', followUpId: null,
        diagnosis: 'Healthy heart rhythm; cholesterol slightly above normal',
        vitals: 'BP 128/82 · Pulse 72 · Temp 36.7 °C',
        notes: 'ECG normal sinus rhythm. Total cholesterol a little high: diet advice and walking 30 minutes a day.',
        prescriptions: [{ name: 'No medication needed', how: 'Diet and exercise advice only' }],
        scans: [
          { id: 's3', type: 'ecg', name: 'ECG – Resting, Lead II', finding: 'Normal sinus rhythm at 72 bpm.', imagePath: 'assets/images/scans/ecg.png' },
          { id: 's4', type: 'lab', name: 'Blood test – CBC & lipids', finding: 'All normal except total cholesterol 212 mg/dL.', imagePath: 'assets/images/scans/blood-test.png' },
        ],
      },
    ],
  };
}
