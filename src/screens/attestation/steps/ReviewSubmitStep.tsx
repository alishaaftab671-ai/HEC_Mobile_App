import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import InfoRow from '../../../components/InfoRow';
import SectionCard from '../../../components/SectionCard';
import { colors, radius, spacing } from '../../../theme';
import type { StepProps } from '../stepProps';
import { formatPKR } from '../../../utils/formatters';

export function validate(form: StepProps['form']): Record<string, string> {
  if (!form.declarationAccepted) {
    return { declaration: 'Please accept the declaration before submitting.' };
  }
  return {};
}

export default function ReviewSubmitStep({ form, update, errors }: StepProps) {
  const p = form.personal;
  const c = form.contact;
  const d = form.degree;
  const inst = form.institution;
  const a = form.attestation;

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <SectionCard title="Applicant">
        <InfoRow label="Full name" value={p.fullName} />
        <InfoRow label="Father's name" value={p.fatherName} />
        <InfoRow label="CNIC" value={p.cnic} />
        <InfoRow label="Date of birth" value={p.dob} />
        <InfoRow label="Gender" value={p.gender} />
        <InfoRow label="Nationality" value={p.nationality} />
      </SectionCard>

      <SectionCard title="Contact" style={styles.gap}>
        <InfoRow label="Email" value={c.email} />
        <InfoRow label="Mobile" value={c.phone} />
        <InfoRow label="Address" value={[c.address, c.city, c.province].filter(Boolean).join(', ')} />
      </SectionCard>

      <SectionCard title="Degree & institution" style={styles.gap}>
        <InfoRow label="Degree" value={`${d.degreeTitle} (${d.level})`} />
        <InfoRow label="Major" value={d.major} />
        <InfoRow label="Session" value={d.sessionFrom && d.sessionTo ? `${d.sessionFrom} – ${d.sessionTo}` : ''} />
        <InfoRow label="Passing year" value={d.passingYear} />
        <InfoRow
          label="Result"
          value={
            d.resultType === 'CGPA'
              ? `CGPA ${d.cgpa}`
              : d.resultType === 'Marks'
                ? `${d.obtainedMarks}/${d.totalMarks}`
                : `Grade ${d.grade}`
          }
        />
        <InfoRow label="University" value={inst.universityName} />
        <InfoRow label="Campus / city" value={[inst.campus, inst.city].filter(Boolean).join(', ')} />
        <InfoRow label="Roll no." value={inst.rollNo} />
      </SectionCard>

      <SectionCard title="Education history" style={styles.gap}>
        {form.educationRecords.map((r) => (
          <View key={r.id} style={styles.recordBox}>
            <Text style={styles.recordTitle}>{r.degreeTitle || r.level}</Text>
            <Text style={styles.recordSub}>
              {[r.institution, r.city, r.completionYear].filter(Boolean).join(' · ')}
            </Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Service requested" style={styles.gap}>
        <InfoRow label="Purpose" value={a.purpose} />
        <InfoRow label="Destination" value={a.destinationCountry} />
        <InfoRow label="Document type" value={a.docType} />
        <InfoRow label="Sets" value={String(a.numberOfSets)} />
        <InfoRow label="Service speed" value={a.serviceType === 'Urgent' ? 'Urgent (~3 working days)' : 'Normal (~10 working days)'} />
        <InfoRow label="Delivery" value={a.delivery} />
      </SectionCard>

      <SectionCard title={`Documents (${form.documents.length})`} style={styles.gap}>
        {form.documents.map((doc) => (
          <View key={doc.id} style={styles.docRow}>
            <Ionicons name="document-attach-outline" size={15} color={colors.greenDark} />
            <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Payment & verification" style={styles.gap}>
        <InfoRow
          label="Fee paid"
          value={form.payment ? `${formatPKR(form.payment.amount)} · ${form.payment.method}` : ''}
        />
        <InfoRow label="Transaction ID" value={form.payment?.txnId ?? ''} />
        <InfoRow label="OTP verification" value={form.otpVerified ? 'Verified' : ''} />
      </SectionCard>

      <Pressable
        onPress={() => update({ declarationAccepted: !form.declarationAccepted })}
        style={({ pressed }) => [styles.declaration, pressed && { opacity: 0.8 }]}
      >
        <View style={[styles.checkbox, form.declarationAccepted && styles.checkboxOn]}>
          {form.declarationAccepted ? <Ionicons name="checkmark-sharp" size={14} color="#FFFFFF" /> : null}
        </View>
        <Text style={styles.declarationText}>
          I hereby declare that the information provided is correct and the documents uploaded are
          true copies of the originals. I understand that any false statement may lead to permanent
          disqualification from HEC services under the rules of the Government of Pakistan.
        </Text>
      </Pressable>
      {errors.declaration ? <Text style={styles.error}>{errors.declaration}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.lg,
  },
  gap: {
    marginTop: spacing.md,
  },
  recordBox: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  recordTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recordSub: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  docName: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  declaration: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    padding: spacing.md,
    marginTop: spacing.lg,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  declarationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17.5,
    color: colors.textSecondary,
  },
  error: {
    marginTop: spacing.sm,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.error,
  },
});
