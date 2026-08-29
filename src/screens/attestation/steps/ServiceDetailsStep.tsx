import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SelectField from '../../../components/SelectField';
import SectionCard from '../../../components/SectionCard';
import {
  COUNTRY_LIST,
  DELIVERY_OPTIONS,
  DOC_TYPE_OPTIONS,
  PURPOSE_LIST,
  SPEED_OPTIONS,
} from '../wizardOptions';
import { feeBreakdown } from '../../../services/fees';
import { colors, radius, spacing } from '../../../theme';
import type { StepProps } from '../stepProps';
import { formatPKR } from '../../../utils/formatters';

export function validate(form: StepProps['form']): Record<string, string> {
  const e: Record<string, string> = {};
  const a = form.attestation;
  if (!a.purpose) e.purpose = 'Select the purpose of attestation.';
  if (!a.destinationCountry) e.destinationCountry = 'Select the destination country.';
  if (!a.docType) e.docType = 'Select document type.';
  if (!a.serviceType) e.serviceType = 'Select service speed.';
  if (!a.delivery) e.delivery = 'Select delivery mode.';
  return e;
}

export default function ServiceDetailsStep({ form, update, errors }: StepProps) {
  const a = form.attestation;
  const lines = a.docType ? feeBreakdown(a) : [];

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <SectionCard title="Attestation purpose">
        <SelectField
          label="Purpose"
          required
          value={a.purpose}
          options={PURPOSE_LIST}
          onSelect={(v) => update({ attestation: { ...a, purpose: v } })}
          error={errors.purpose}
        />
        <SelectField
          label="Destination Country"
          required
          value={a.destinationCountry}
          options={COUNTRY_LIST}
          onSelect={(v) => update({ attestation: { ...a, destinationCountry: v } })}
          error={errors.destinationCountry}
          hint="Country where the documents will be presented."
        />
      </SectionCard>

      <SectionCard title="Documents & sets" style={styles.gap}>
        <SelectField
          label="Document Type"
          required
          value={a.docType}
          options={DOC_TYPE_OPTIONS}
          onSelect={(v) => update({ attestation: { ...a, docType: v } })}
          error={errors.docType}
        />
        <Text style={styles.fieldLabel}>
          Number of Sets<Text style={styles.req}> *</Text>
        </Text>
        <View style={styles.stepperRow}>
          <Pressable
            style={[styles.stepBtn, a.numberOfSets <= 1 && styles.stepBtnDisabled]}
            onPress={() => update({ attestation: { ...a, numberOfSets: Math.max(1, a.numberOfSets - 1) } })}
            hitSlop={6}
          >
            <Ionicons name="remove" size={18} color={colors.navy} />
          </Pressable>
          <Text style={styles.setCount}>{a.numberOfSets}</Text>
          <Pressable
            style={[styles.stepBtn, a.numberOfSets >= 5 && styles.stepBtnDisabled]}
            onPress={() => update({ attestation: { ...a, numberOfSets: Math.min(5, a.numberOfSets + 1) } })}
            hitSlop={6}
          >
            <Ionicons name="add" size={18} color={colors.navy} />
          </Pressable>
          <Text style={styles.stepperHint}>Max 5 sets per application</Text>
        </View>
      </SectionCard>

      <SectionCard title="Service & delivery" style={styles.gap}>
        <Text style={styles.fieldLabel}>
          Service Speed<Text style={styles.req}> *</Text>
        </Text>
        <View style={styles.segmentRow}>
          {SPEED_OPTIONS.map((opt) => (
            <SegmentButton
              key={opt}
              active={a.serviceType === opt}
              label={opt}
              sub={opt === 'Normal' ? '~10 working days' : '~3 working days'}
              onPress={() => update({ attestation: { ...a, serviceType: opt === 'Normal' ? 'Normal' : 'Urgent' } })}
            />
          ))}
        </View>
        {errors.serviceType ? <Text style={styles.error}>{errors.serviceType}</Text> : null}

        <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
          Delivery Mode<Text style={styles.req}> *</Text>
        </Text>
        <View style={styles.segmentRow}>
          {DELIVERY_OPTIONS.map((opt) => (
            <SegmentButton
              key={opt}
              active={a.delivery === opt}
              label={opt}
              sub={opt === 'Courier' ? 'Delivered to your address' : 'Collect at HEC office'}
              onPress={() => update({ attestation: { ...a, delivery: opt === 'Self Pickup' ? 'Self Pickup' : 'Courier' } })}
            />
          ))}
        </View>
        {errors.delivery ? <Text style={styles.error}>{errors.delivery}</Text> : null}
      </SectionCard>

      {lines.length > 0 ? (
        <SectionCard title="Fee summary" style={styles.gap}>
          {lines.map((l) => (
            <View key={l.label} style={styles.feeRow}>
              <Text style={styles.feeLabel}>{l.label}</Text>
              <Text style={styles.feeValue}>{formatPKR(l.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total payable</Text>
            <Text style={styles.totalValue}>
              {formatPKR(lines.reduce((sum, l) => sum + l.amount, 0))}
            </Text>
          </View>
        </SectionCard>
      ) : null}
    </ScrollView>
  );
}

function SegmentButton({
  active,
  label,
  sub,
  onPress,
}: {
  active: boolean;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.segment, active && styles.segmentActive, pressed && { opacity: 0.8 }]}>
      <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{label}</Text>
      <Text style={[styles.segmentSub, active && styles.segmentSubActive]}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.lg,
  },
  gap: {
    marginTop: spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  req: {
    color: colors.error,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greenSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  setCount: {
    minWidth: 34,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  stepperHint: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  segmentActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  segmentLabelActive: {
    color: colors.greenDark,
  },
  segmentSub: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  segmentSubActive: {
    color: '#007A55',
  },
  error: {
    marginTop: 5,
    fontSize: 12,
    color: colors.error,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  feeLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  feeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    marginTop: spacing.xs,
    paddingTop: spacing.sm + 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.greenDark,
  },
});
