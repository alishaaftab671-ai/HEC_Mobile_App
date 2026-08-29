import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import Button from '../../../components/Button';
import SectionCard from '../../../components/SectionCard';
import TextField from '../../../components/TextField';
import { PAYMENT_METHODS } from '../wizardOptions';
import { computeFee, feeBreakdown, payWithMethod } from '../../../services/fees';
import { colors, radius, spacing } from '../../../theme';
import type { PaymentInfo } from '../../../types/models';
import type { StepProps } from '../stepProps';
import { formatCardNumber, formatExpiry, formatPKR } from '../../../utils/formatters';

type IconName = ComponentProps<typeof Ionicons>['name'];

const METHOD_ICONS: Record<PaymentInfo['method'], IconName> = {
  Card: 'card-outline',
  'Bank Deposit': 'business-outline',
  'Mobile Wallet': 'phone-portrait-outline',
};

export function validate(form: StepProps['form']): Record<string, string> {
  if (!form.payment) return { payment: 'Complete the payment to continue.' };
  return {};
}

export default function PaymentStep({ form, update, errors }: StepProps) {
  const [method, setMethod] = useState<PaymentInfo['method']>('Card');
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const amount = computeFee(form.attestation);
  const lines = feeBreakdown(form.attestation);

  const pay = () => {
    if (method === 'Card') {
      const next: Record<string, string> = {};
      if (cardNo.replace(/\s/g, '').length !== 16) next.cardNo = 'Enter the 16-digit card number.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) next.expiry = 'MM/YY';
      if (cvv.length !== 3) next.cvv = '3 digits';
      setLocalErrors(next);
      if (Object.keys(next).length) return;
    }
    update({
      payment: {
        ...payWithMethod(method, method === 'Card' ? cardNo.replace(/\D/g, '').slice(-4) : undefined),
        amount,
      },
    });
  };

  if (form.payment) {
    return (
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.paidCard, shadowPaid]}>
          <View style={styles.paidIcon}>
            <Text style={styles.paidCheck}>✓</Text>
          </View>
          <Text style={styles.paidTitle}>Payment successful</Text>
          <Text style={styles.paidAmount}>{formatPKR(form.payment.amount)}</Text>
          <Text style={styles.paidMeta}>
            via {form.payment.method}
            {form.payment.cardLast4 ? ` •••• ${form.payment.cardLast4}` : ''}
          </Text>
          <View style={styles.txnRow}>
            <Text style={styles.txnLabel}>Transaction ID</Text>
            <Text style={styles.txnValue}>{form.payment.txnId}</Text>
          </View>
          <Text style={styles.paidNote}>
            Payments are simulated in this demo — no real charge is made.
          </Text>
        </View>
        <Button
          label="Change payment method"
          variant="ghost"
          small
          onPress={() => update({ payment: null })}
          style={styles.changeBtn}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <SectionCard title={`Fee summary · ${formatPKR(amount)}`}>
        {lines.map((l) => (
          <View key={l.label} style={styles.feeRow}>
            <Text style={styles.feeLabel}>{l.label}</Text>
            <Text style={styles.feeValue}>{formatPKR(l.amount)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total due now</Text>
          <Text style={styles.totalValue}>{formatPKR(amount)}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Payment method" style={styles.gap}>
        {PAYMENT_METHODS.map((m) => {
          const active = m === method;
          return (
            <Pressable
              key={m}
              onPress={() => setMethod(m)}
              style={({ pressed }) => [styles.methodRow, active && styles.methodActive, pressed && { opacity: 0.75 }]}
            >
              <View style={[styles.methodRadio, active && styles.methodRadioOn]}>
                {active ? <View style={styles.methodDot} /> : null}
              </View>
              <View style={[styles.methodIcon, active && styles.methodIconOn]}>
                <Ionicons name={METHOD_ICONS[m]} size={18} color={active ? colors.greenDark : colors.navyMuted} />
              </View>
              <Text style={[styles.methodLabel, active && styles.methodLabelOn]}>{m}</Text>
            </Pressable>
          );
        })}
      </SectionCard>

      {method === 'Card' ? (
        <SectionCard title="Card details" style={styles.gap}>
          <TextField
            label="Card Number"
            required
            placeholder="0000 0000 0000 0000"
            keyboardType="number-pad"
            value={cardNo}
            onChangeText={(t) => setCardNo(formatCardNumber(t))}
            error={localErrors.cardNo}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Expiry"
                required
                placeholder="MM/YY"
                keyboardType="number-pad"
                value={expiry}
                onChangeText={(t) => setExpiry(formatExpiry(t))}
                error={localErrors.expiry}
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 1 }}>
              <TextField
                label="CVV"
                required
                placeholder="123"
                keyboardType="number-pad"
                maxLength={3}
                secure
                value={cvv}
                onChangeText={(t) => setCvv(t.replace(/\D/g, ''))}
                error={localErrors.cvv}
              />
            </View>
          </View>
          <Text style={styles.demoNote}>Demo mode — any valid-format values are accepted.</Text>
        </SectionCard>
      ) : (
        <View style={[styles.infoCard, shadowInfo]}>
          <Ionicons name="information-circle" size={18} color={colors.navyMuted} />
          <Text style={styles.infoText}>
            {method === 'Bank Deposit'
              ? 'A payment slip reference will be generated. Deposit within 48 hours at any 1Link bank or via IBFT.'
              : 'You will receive a wallet prompt on your registered mobile number to approve the payment.'}
          </Text>
        </View>
      )}

      {errors.payment && !form.payment ? (
        <Text style={styles.submitError}>{errors.payment}</Text>
      ) : null}

      <Button label={`Pay ${formatPKR(amount)}`} icon="lock-closed-outline" onPress={pay} style={styles.payBtn} />
      <Text style={styles.secureNote}>
        Secured by HEC eServices · PCI-DSS compliant gateway
      </Text>
    </ScrollView>
  );
}

const shadowPaid = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.greenSoft,
};

const shadowInfo = {
  backgroundColor: colors.limeSoft,
  borderRadius: radius.md,
};

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.xl,
  },
  gap: {
    marginTop: spacing.md,
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
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  methodActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodRadioOn: {
    borderColor: colors.green,
  },
  methodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  methodIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  methodIconOn: {
    backgroundColor: '#FFFFFF',
  },
  methodLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  methodLabelOn: {
    fontWeight: '800',
    color: colors.greenDark,
  },
  row: {
    flexDirection: 'row',
  },
  demoNote: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: colors.textMuted,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#8A6508',
  },
  submitError: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.error,
  },
  payBtn: {
    marginTop: spacing.lg,
  },
  secureNote: {
    textAlign: 'center',
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  paidCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  paidIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  paidCheck: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.green,
  },
  paidTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  paidAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.greenDark,
    marginTop: spacing.xs,
  },
  paidMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.md,
  },
  txnLabel: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  txnValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: 0.5,
  },
  paidNote: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  changeBtn: {
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
});
