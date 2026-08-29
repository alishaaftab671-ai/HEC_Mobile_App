import type { AttestationForm } from '../../types/models';

export interface StepProps {
  form: AttestationForm;
  update: (partial: Partial<AttestationForm>) => void;
  errors: Record<string, string>;
}

export const STEPS = [
  'Personal Details',
  'Contact Information',
  'Education History',
  'Degree & Institution',
  'Service Details',
  'Documents',
  'Payment',
  'Verification',
  'Review & Submit',
] as const;
