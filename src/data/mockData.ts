import type { Announcement, FAQ, University } from '../types/models';

export const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
  'Islamabad Capital Territory',
] as const;

export const CITY_BY_PROVINCE: Record<string, string[]> = {
  Punjab: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur'],
  Sindh: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas'],
  'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Mardan', 'Swat', 'Dera Ismail Khan'],
  Balochistan: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar'],
  'Gilgit-Baltistan': ['Gilgit', 'Skardu'],
  'Azad Jammu & Kashmir': ['Muzaffarabad', 'Mirpur', 'Kotli'],
  'Islamabad Capital Territory': ['Islamabad'],
};

export const NATIONALITIES = ['Pakistani', 'Overseas Pakistani / Dual National', 'Other'];

export const GENDERS = ['Male', 'Female', 'Other'] as const;

export const COUNTRIES = [
  'United Arab Emirates',
  'Saudi Arabia',
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Germany',
  'Turkey',
  'China',
  'Malaysia',
  'Qatar',
  'Oman',
  'Other',
];

export const PURPOSES = [
  'Employment Abroad',
  'Higher Studies / Admission',
  'Immigration',
  'Professional License',
  'Equivalence Certificate',
  'Other',
];

export const UNIVERSITIES: University[] = [
  { id: 'uq-01', name: 'Quaid-i-Azam University', city: 'Islamabad' },
  { id: 'pu-02', name: 'University of the Punjab', city: 'Lahore' },
  { id: 'uok-03', name: 'University of Karachi', city: 'Karachi' },
  { id: 'uop-04', name: 'University of Peshawar', city: 'Peshawar' },
  { id: 'ubc-05', name: 'University of Balochistan', city: 'Quetta' },
  { id: 'uaf-06', name: 'University of Agriculture Faisalabad', city: 'Faisalabad' },
  { id: 'uet-07', name: 'University of Engineering & Technology, Lahore', city: 'Lahore' },
  { id: 'nust-08', name: 'National University of Sciences & Technology (NUST)', city: 'Islamabad' },
  { id: 'comsats-09', name: 'COMSATS University Islamabad', city: 'Islamabad' },
  { id: 'buitems-10', name: 'BUITEMS', city: 'Quetta' },
  { id: 'uoh-11', name: 'University of Haripur', city: 'Haripur' },
  { id: 'iub-12', name: 'The Islamia University of Bahawalpur', city: 'Bahawalpur' },
];

export const FAQS: FAQ[] = [
  {
    id: 'faq-1',
    category: 'Degree Attestation',
    question: 'What documents do I need for degree attestation?',
    answer:
      'You need your original degree certificate, final transcript, a valid CNIC (front and back), and any supporting document requested by the receiving authority. Upload clear scans; photos taken with your phone are accepted if all text is readable.',
  },
  {
    id: 'faq-2',
    category: 'Degree Attestation',
    question: 'How long does attestation take?',
    answer:
      'Normal service is completed within 10 working days after successful verification. Urgent service is completed within 3 working days. Timelines start once your documents pass verification.',
  },
  {
    id: 'faq-3',
    category: 'Degree Attestation',
    question: 'What is the difference between normal and urgent service?',
    answer:
      'Urgent service prioritizes your case at every stage — verification, processing and dispatch — reducing the turnaround to roughly 3 working days for an additional fee.',
  },
  {
    id: 'faq-4',
    category: 'Payments',
    question: 'Which payment methods are supported?',
    answer:
      'You can pay by debit/credit card, bank deposit (1Link/IBFT), or mobile wallet (JazzCash / EasyPaisa). A transaction reference is generated for every payment and shown in your application status.',
  },
  {
    id: 'faq-5',
    category: 'Payments',
    question: 'Can I get a refund after submitting?',
    answer:
      'Fees are refundable only while an application is still in "Submitted" state and has not entered verification. Contact support with your reference number to request a refund.',
  },
  {
    id: 'faq-6',
    category: 'Account',
    question: 'Why do I need to verify my phone or email?',
    answer:
      'One-time password (OTP) verification confirms your identity and lets us send you status updates about your applications.',
  },
  {
    id: 'faq-7',
    category: 'Account',
    question: 'Can I apply on behalf of someone else?',
    answer:
      'Yes, but you must enter the applicant\'s own CNIC details in the form and upload their documents. The declaration must be accepted by the person who owns the credentials.',
  },
  {
    id: 'faq-8',
    category: 'Equivalence',
    question: 'Who needs an equivalence certificate?',
    answer:
      'Anyone whose qualification was earned outside Pakistan and needs to be compared against the Pakistani education system — e.g. foreign degree holders applying for jobs or study locally.',
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'annc-1',
    tag: 'Notice',
    title: 'Urgent attestation now delivered in 3 working days',
    snippet: 'Reduced turnaround for urgent cases starting this quarter.',
    body:
      'Following process improvements at the Attestation Wing, urgent service requests are now completed within three working days of verification clearance. Normal service remains at ten working days. No change in fee structure has been made.',
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'annc-2',
    tag: 'Scholarships',
    title: 'Overseas Scholarship Scheme (MS/MPhil) — Phase III open',
    snippet: 'Applications open for HEC overseas scholarships until Sept 30.',
    body:
      'The Higher Education Commission invites applications for the Overseas Scholarship Scheme Phase III. Applicants must hold a 16-year degree with at least 60% marks or 2.5 CGPA. Apply online through the HEC scholarship portal before September 30.',
    date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'annc-3',
    tag: 'Maintenance',
    title: 'Scheduled maintenance: Sunday 2:00 AM – 4:00 AM',
    snippet: 'eServices will be briefly unavailable during the window.',
    body:
      'Planned infrastructure maintenance will make eServices unavailable for approximately two hours on Sunday morning. In-progress drafts are saved automatically and will not be affected.',
    date: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
  },
];
