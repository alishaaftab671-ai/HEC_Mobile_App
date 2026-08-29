import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import Button from '../../components/Button';
import InfoRow from '../../components/InfoRow';
import SectionCard from '../../components/SectionCard';
import { Breathe, CardIn } from '../../components/Motion';
import { useApp } from '../../context/AppContext';
import { colors, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';
import { formatDateTime, formatPKR } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'SubmissionSuccess'>;

export default function SubmissionSuccessScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { applications } = useApp();
  const [copied, setCopied] = useState(false);
  const app = applications.find((a) => a.id === route.params.applicationId);

  const copyRef = async () => {
    if (!app) return;
    await Clipboard.setStringAsync(app.referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const startNewApplication = () => {
    navigation.reset({
      index: 1,
      routes: [{ name: 'Main' }, { name: 'AttestationIntro' }],
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.hero}>
        <CardIn>
          <Breathe style={styles.checkCircle}>
            <Ionicons name="checkmark-sharp" size={44} color="#FFFFFF" />
          </Breathe>
        </CardIn>
        <Text style={styles.title}>Application submitted!</Text>
        <Text style={styles.subtitle}>
          Your attestation request has been received and is now queued for verification.
        </Text>

        {app ? (
          <Pressable style={[styles.refCard, shadow.raised]} onPress={() => void copyRef()}>
            <View style={{ flex: 1 }}>
              <Text style={styles.refLabel}>Reference number</Text>
              <Text style={styles.refValue}>{app.referenceId}</Text>
            </View>
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={20} color={copied ? colors.green : colors.navy} />
          </Pressable>
        ) : null}
        {copied ? <Text style={styles.copiedNote}>Copied to clipboard</Text> : null}
      </View>

      {app ? (
        <CardIn delay={80}>
          <SectionCard title="Submission summary" style={styles.summary}>
            <InfoRow label="Service" value={app.serviceName} />
            <InfoRow label="Submitted" value={formatDateTime(app.submittedAt)} />
            <InfoRow label="Documents" value={`${app.documentCount} file(s)`} />
            <InfoRow label="Fee paid" value={`${formatPKR(app.feeTotal)} · ${app.paymentMethod}`} />
            <InfoRow label="Current status" value={app.status} last />
          </SectionCard>
        </CardIn>
      ) : null}

      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          label="Start New Application"
          icon="add-circle"
          onPress={startNewApplication}
        />
        {app ? (
          <Button
            label="Track this application"
            variant="secondary"
            icon="navigate-outline"
            onPress={() => navigation.replace('ApplicationStatusDetail', { applicationId: app.id })}
            style={{ marginTop: spacing.sm }}
          />
        ) : null}
        <Pressable onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} hitSlop={8}>
          <Text style={styles.homeLink}>Back to home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003D25',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  refCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.greenSoft,
    alignSelf: 'stretch',
  },
  refLabel: {
    fontSize: 11.5,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  refValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  copiedNote: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.greenDark,
    marginTop: spacing.sm,
  },
  summary: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  homeLink: {
    textAlign: 'center',
    color: colors.navyMuted,
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
});
