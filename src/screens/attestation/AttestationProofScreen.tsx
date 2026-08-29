import { useState } from 'react';
import { Alert, Share, StyleSheet, Text, View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import HECLogo from '../../components/HECLogo';
import { CardIn } from '../../components/Motion';
import { useApp } from '../../context/AppContext';
import { colors, gradients, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'AttestationProof'>;

export default function AttestationProofScreen({ navigation }: Props) {
  const { session, applications } = useApp();
  const [sharing, setSharing] = useState(false);

  const completedApp = applications.find((a) => a.status === 'Completed') || applications[0];

  const handleShare = async () => {
    setSharing(true);
    try {
      const refId = completedApp?.referenceId ?? 'HEC-2026-98124';
      const name = session?.user.fullName ?? 'Applicant';
      const message = `Official HEC e-Attestation Proof\nApplicant: ${name}\nRef ID: ${refId}\nVerified by Higher Education Commission Pakistan.\nVerify online: https://eservices.hec.gov.pk/verify?ref=${refId}`;

      await Share.share({
        title: 'HEC Degree Attestation Proof',
        message,
      });
    } catch {
      Alert.alert('Share', 'Proof link copied to clipboard.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Share Attestation Proof"
        subtitle="Digital Verification & QR Certificate"
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <CardIn style={[styles.certificateCard, shadow.raised]}>
          <LinearGradient
            style={styles.certHeader}
            colors={['#05382A', '#0A7A50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <HECLogo size={42} />
            <Text style={styles.certHeaderTitle}>Higher Education Commission</Text>
            <Text style={styles.certHeaderSub}>Islamic Republic of Pakistan</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.lime} />
              <Text style={styles.verifiedBadgeText}>OFFICIALLY VERIFIED</Text>
            </View>
          </LinearGradient>

          <View style={styles.certContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Applicant Name:</Text>
              <Text style={styles.value}>{session?.user.fullName ?? 'Ayesha Khan'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>CNIC Number:</Text>
              <Text style={styles.value}>{session?.user.cnic ?? '35202-1234567-1'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Reference Number:</Text>
              <Text style={[styles.value, { color: colors.navy, fontWeight: '800' }]}>
                {completedApp?.referenceId ?? 'HEC-2026-88129'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Service Type:</Text>
              <Text style={styles.value}>{completedApp?.serviceName ?? 'Degree Attestation — Normal'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Attestation Status:</Text>
              <View style={styles.statusPill}>
                <Ionicons name="checkmark-circle" size={14} color={colors.greenDark} />
                <Text style={styles.statusText}>
                  {completedApp?.status ?? 'Completed'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Issue Date:</Text>
              <Text style={styles.value}>
                {completedApp ? formatDate(completedApp.submittedAt) : '15 Jan 2026'}
              </Text>
            </View>

            {/* QR Placeholder */}
            <View style={styles.qrContainer}>
              <View style={styles.qrBox}>
                <Ionicons name="qr-code" size={90} color={colors.greenDeep} />
              </View>
              <Text style={styles.qrCaption}>Scan with camera or HEC eServices app to verify authenticity</Text>
            </View>
          </View>
        </CardIn>

        <View style={styles.actionsBox}>
          <Button
            label="Share Verification Proof"
            icon="share-social-outline"
            onPress={handleShare}
            loading={sharing}
          />

          <Button
            label="Download PDF Copy"
            variant="secondary"
            icon="download-outline"
            onPress={() => Alert.alert('Download', 'Attestation proof PDF saved to downloads.')}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    padding: spacing.lg,
  },
  certificateCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  certHeader: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  certHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  certHeaderSub: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  verifiedBadgeText: {
    color: colors.lime,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  certContent: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.greenDark,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  qrBox: {
    padding: spacing.md,
    backgroundColor: '#F7FAF8',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrCaption: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  actionsBox: {
    marginTop: spacing.lg,
  },
});
