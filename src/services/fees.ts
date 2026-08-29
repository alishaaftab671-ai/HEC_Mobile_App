import type { AttestationDetails, AttestationForm } from '../types/models';
import { generateTxnId } from '../utils/id';

const SET_FEE: Record<string, number> = {
  'Original Degree Certificate': 1800,
  Photocopy: 900,
  Both: 2400,
};

const URGENT_SURCHARGE = 2500;
const COURIER_FEE = 650;

/** Computes the total fee in PKR for a given attestation configuration. */
export function computeFee(details: AttestationDetails): number {
  const sets = Math.max(1, details.numberOfSets || 1);
  const base = SET_FEE[details.docType] ?? SET_FEE['Original Degree Certificate'];
  let total = base * sets;
  if (details.serviceType === 'Urgent') total += URGENT_SURCHARGE;
  if (details.delivery === 'Courier') total += COURIER_FEE;
  return total;
}

export interface FeeLine {
  label: string;
  amount: number;
}

export function feeBreakdown(details: AttestationDetails): FeeLine[] {
  const sets = Math.max(1, details.numberOfSets || 1);
  const lines: FeeLine[] = [];
  const perSet = SET_FEE[details.docType] ?? SET_FEE['Original Degree Certificate'];
  lines.push({
    label: `Attestation (${details.docType || 'Original'}) × ${sets} set${sets > 1 ? 's' : ''}`,
    amount: perSet * sets,
  });
  if (details.serviceType === 'Urgent') {
    lines.push({ label: 'Urgent service surcharge', amount: URGENT_SURCHARGE });
  }
  if (details.delivery === 'Courier') {
    lines.push({ label: 'Courier delivery', amount: COURIER_FEE });
  }
  return lines;
}

export function payWithMethod(method: 'Card' | 'Bank Deposit' | 'Mobile Wallet', cardLast4?: string) {
  const txnId = generateTxnId();
  return { method, txnId, paidAt: new Date().toISOString(), cardLast4 };
}

/** True when every required section of the form has been filled. */
export function isFormComplete(form: AttestationForm): boolean {
  return (
    !!form.personal.fullName &&
    !!form.contact.email &&
    form.educationRecords.length > 0 &&
    !!form.degree.degreeTitle &&
    !!form.institution.universityName &&
    !!form.attestation.docType &&
    form.documents.length >= 4 &&
    !!form.payment &&
    form.otpVerified &&
    form.declarationAccepted
  );
}
