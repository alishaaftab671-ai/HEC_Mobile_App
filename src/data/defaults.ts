import type {
  AppNotification,
  Application,
  AttestationForm,
  PersonalInfo,
  TimelineEvent,
} from '../types/models';
import { uid, generateReferenceId } from '../utils/id';

export function emptyPersonal(): PersonalInfo {
  return {
    fullName: '',
    fatherName: '',
    cnic: '',
    dob: '',
    gender: '',
    nationality: 'Pakistani',
  };
}

export function emptyAttestationForm(user: { fullName: string; cnic: string; email: string; phone: string }): AttestationForm {
  const now = new Date().toISOString();
  return {
    personal: {
      ...emptyPersonal(),
      fullName: user.fullName,
      cnic: user.cnic,
    },
    contact: {
      email: user.email,
      phone: user.phone,
      altPhone: '',
      address: '',
      province: '',
      city: '',
    },
    educationRecords: [],
    degree: {
      degreeTitle: '',
      level: "Bachelor's",
      major: '',
      sessionFrom: '',
      sessionTo: '',
      passingYear: '',
      resultType: 'CGPA',
      cgpa: '',
      obtainedMarks: '',
      totalMarks: '',
      grade: '',
    },
    institution: {
      universityId: '',
      universityName: '',
      campus: '',
      city: '',
      country: 'Pakistan',
      rollNo: '',
    },
    attestation: {
      purpose: '',
      destinationCountry: '',
      docType: '',
      numberOfSets: 1,
      serviceType: 'Normal',
      delivery: '',
    },
    documents: [],
    declarationAccepted: false,
    payment: null,
    otpVerified: false,
    currentStep: 0,
    startedAt: now,
    updatedAt: now,
    savedAt: null,
  };
}

function timelineFor(statusIndex: number, baseDate: Date): TimelineEvent[] {
  const stages = ['Submitted', 'Verification', 'Under Review', 'Processing', 'Completed'];
  return stages.map((label, i) => ({
    label,
    date:
      i <= statusIndex
        ? new Date(baseDate.getTime() + i * 36 * 3600 * 1000).toISOString()
        : null,
    state: i < statusIndex ? 'done' : i === statusIndex ? 'current' : 'upcoming',
  }));
}

/** Demo history so the app looks alive on first launch. */
export function seedApplications(userId: string, applicantName: string, cnic: string): Application[] {
  const now = Date.now();
  const a1Date = new Date(now - 12 * 24 * 3600 * 1000);
  const a2Date = new Date(now - 40 * 24 * 3600 * 1000);

  const app1: Application = {
    id: uid(),
    referenceId: generateReferenceId(),
    userId,
    applicantName,
    cnic,
    serviceName: 'Degree Attestation — Urgent',
    documentCount: 5,
    feeTotal: 4900,
    paymentMethod: 'Card',
    status: 'Processing',
    submittedAt: a1Date.toISOString(),
    updatedAt: new Date(now - 1 * 24 * 3600 * 1000).toISOString(),
    timeline: timelineFor(3, a1Date),
    documents: [],
  };

  const app2: Application = {
    id: uid(),
    referenceId: generateReferenceId(),
    userId,
    applicantName,
    cnic,
    serviceName: 'Degree Attestation — Normal',
    documentCount: 4,
    feeTotal: 1800,
    paymentMethod: 'Bank Deposit',
    status: 'Completed',
    submittedAt: a2Date.toISOString(),
    updatedAt: new Date(now - 18 * 24 * 3600 * 1000).toISOString(),
    timeline: timelineFor(4, a2Date),
    documents: [],
  };

  return [app1, app2];
}

export function seedNotifications(): AppNotification[] {
  const now = Date.now();
  return [
    {
      id: uid(),
      category: 'application',
      title: 'Application moved to Processing',
      body: 'Your attestation request is being processed by the Attestation Wing. Expected completion within 3 working days.',
      createdAt: new Date(now - 26 * 3600 * 1000).toISOString(),
      read: false,
    },
    {
      id: uid(),
      category: 'action',
      title: 'Payment confirmed',
      body: 'We received your payment of PKR 4,900. Reference has been updated in your application.',
      createdAt: new Date(now - 27 * 3600 * 1000).toISOString(),
      read: false,
    },
    {
      id: uid(),
      category: 'announcement',
      title: 'Urgent service turnaround reduced to 3 days',
      body: 'Urgent attestation cases are now completed within three working days of verification clearance.',
      createdAt: new Date(now - 2 * 24 * 3600 * 1000).toISOString(),
      read: true,
    },
    {
      id: uid(),
      category: 'application',
      title: 'Documents verified',
      body: 'All uploaded documents for your previous application passed verification.',
      createdAt: new Date(now - 20 * 24 * 3600 * 1000).toISOString(),
      read: true,
    },
  ];
}
