import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../../components/Button';
import { colors, radius, shadow, spacing } from '../../../theme';
import type { StepProps } from '../stepProps';
import type { RootStackParamList } from '../../../types/navigation';
import { maskPhone } from '../../../utils/formatters';

type Nav = NativeStackScreenProps<RootStackParamList>['navigation'];

export function validate(form: StepProps['form']): Record<string, string> {
  if (!form.otpVerified) return { otp: 'Verify your identity via the one-time code to continue.' };
  return {};
}

export default function VerificationStep({ form, errors }: StepProps) {
  const navigation = useNavigation<Nav>();
  const target = maskPhone(form.contact.phone || '03000000000');

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={[styles.card, shadow.card]}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={26} color={colors.green} />
        </View>
        <Text style={styles.title}>Identity verification</Text>
        <Text style={styles.body2}>
          To protect your academic record, HEC confirms every request with a one-time password sent
          to the applicant's registered mobile number.
        </Text>

        <View style={styles.targetRow}>
          <Ionicons name="call" size={16} color={colors.navyMuted} />
          <Text style={styles.target}>{target}</Text>
        </View>

        {form.otpVerified ? (
          <View style={styles.verifiedCard}>
            <Ionicons name="checkmark-circle" size={20} color={colors.green} />
            <View style={{ flex: 1 }}>
              <Text style={styles.verifiedTitle}>Verified successfully</Text>
              <Text style={styles.verifiedSub}>Your identity has been confirmed for this application.</Text>
            </View>
          </View>
        ) : (
          <>
            <Button
              label="Send verification code"
              icon="chatbubble-ellipses-outline"
              onPress={() => navigation.navigate('Otp', { target, mode: 'attestation' })}
              style={styles.cta}
            />
            {errors.otp ? <Text style={styles.error}>{errors.otp}</Text> : null}
            <Text style={styles.note}>
              Standard SMS rates apply. Codes expire after 10 minutes.
            </Text>
          </>
        )}
      </View>

      <View style={[styles.privacyCard, shadow.card]}>
        <Ionicons name="lock-closed" size={17} color={colors.navyMuted} />
        <Text style={styles.privacyText}>
          Your documents are stored on-device in this demo build and are only used to assemble the
          attestation request.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greenSoft,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body2: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    marginTop: spacing.md,
  },
  target: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: 0.5,
  },
  cta: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  error: {
    marginTop: spacing.sm,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.error,
    textAlign: 'center',
  },
  note: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: colors.mantisSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  verifiedTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.greenDark,
  },
  verifiedSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
});
