import { GENDERS, NATIONALITIES } from '../../data/mockData';

export { GENDERS, NATIONALITIES };

export const PROVINCE_LIST = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
  'Islamabad Capital Territory',
] as const;

export const COUNTRY_LIST = [
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
] as const;

export const PURPOSE_LIST = [
  'Employment Abroad',
  'Higher Studies / Admission',
  'Immigration',
  'Professional License',
  'Equivalence Certificate',
  'Other',
] as const;

export const DOC_TYPE_OPTIONS = ['Original Degree Certificate', 'Photocopy', 'Both'] as const;
export const SPEED_OPTIONS = ['Normal', 'Urgent'] as const;
export const DELIVERY_OPTIONS = ['Self Pickup', 'Courier'] as const;
export const PAYMENT_METHODS = ['Card', 'Bank Deposit', 'Mobile Wallet'] as const;

export const EDUCATION_LEVELS = [
  'Matric / Secondary',
  'Intermediate / Higher Secondary',
  "Bachelor's",
  "Master's",
  'MPhil',
  'PhD',
  'Other',
] as const;

export const RESULT_TYPES = ['CGPA', 'Marks', 'Grade'] as const;
