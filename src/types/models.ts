export type ServiceId = 'attestation' | 'equivalence' | 'scholarships' | 'other-services';

export interface User {
  id: string;
  fullName: string;
  cnic: string;
  email: string;
  phone: string;
}

export interface Session {
  user: User;
  loggedInAt: string;
}

export type Gender = 'Male' | 'Female' | 'Other';

export interface PersonalInfo {
  fullName: string;
  fatherName: string;
  cnic: string;
  dob: string; // ISO yyyy-mm-dd
  gender: Gender | '';
  nationality: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  province: string;
  city: string;
}

export type EducationLevel =
  | 'Matric / Secondary'
  | 'Intermediate / Higher Secondary'
  | "Bachelor's"
  | "Master's"
  | 'MPhil'
  | 'PhD'
  | 'Other';

export type ResultType = 'CGPA' | 'Marks' | 'Grade';

export interface EducationRecord {
  id: string;
  level: EducationLevel;
  degreeTitle: string;
  institution: string;
  country: string;
  city: string;
  registrationNo: string;
  enrollmentYear: string;
  completionYear: string;
  resultType: ResultType;
  cgpa: string;
  obtainedMarks: string;
  totalMarks: string;
  grade: string;
}

export interface DegreeInfo {
  degreeTitle: string;
  level: EducationLevel;
  major: string;
  sessionFrom: string;
  sessionTo: string;
  passingYear: string;
  resultType: ResultType;
  cgpa: string;
  obtainedMarks: string;
  totalMarks: string;
  grade: string;
}

export interface InstitutionInfo {
  universityId: string;
  universityName: string;
  campus: string;
  city: string;
  country: string;
  rollNo: string;
}

export type AttestationDocType = 'Original Degree Certificate' | 'Photocopy' | 'Both';
export type ServiceSpeed = 'Normal' | 'Urgent';
export type DeliveryMode = 'Self Pickup' | 'Courier';

export interface AttestationDetails {
  purpose: string;
  destinationCountry: string;
  docType: AttestationDocType | '';
  numberOfSets: number;
  serviceType: ServiceSpeed | '';
  delivery: DeliveryMode | '';
}

export type DocSlot = 'degreeCertificate' | 'transcript' | 'cnicFront' | 'cnicBack' | 'supporting';

export interface UploadedDocMeta {
  id: string;
  slot: DocSlot;
  name: string;
  size: number;
  mimeType: string;
  uri: string;
  uploadedAt: string;
  extractedText?: string;
}

export interface PaymentInfo {
  method: 'Card' | 'Bank Deposit' | 'Mobile Wallet';
  amount: number;
  txnId: string;
  paidAt: string;
  cardLast4?: string;
}

export interface AttestationForm {
  personal: PersonalInfo;
  contact: ContactInfo;
  educationRecords: EducationRecord[];
  degree: DegreeInfo;
  institution: InstitutionInfo;
  attestation: AttestationDetails;
  documents: UploadedDocMeta[];
  declarationAccepted: boolean;
  payment: PaymentInfo | null;
  otpVerified: boolean;
  currentStep: number;
  startedAt: string;
  updatedAt: string;
  savedAt: string | null;
}

export type AppStatus = 'Submitted' | 'Under Review' | 'Verification' | 'Processing' | 'Completed';

export interface TimelineEvent {
  label: string;
  date: string | null;
  state: 'done' | 'current' | 'upcoming';
}

export interface Application {
  id: string;
  referenceId: string;
  userId: string;
  applicantName: string;
  cnic: string;
  serviceName: string;
  documentCount: number;
  feeTotal: number;
  paymentMethod: PaymentInfo['method'];
  status: AppStatus;
  submittedAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  documents: UploadedDocMeta[];
}

export type NotificationCategory = 'application' | 'action' | 'announcement';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface Announcement {
  id: string;
  tag: string;
  title: string;
  snippet: string;
  body: string;
  date: string;
}

export interface University {
  id: string;
  name: string;
  city: string;
}
