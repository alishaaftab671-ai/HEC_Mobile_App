import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Button from '../../components/Button';
import HECLogo from '../../components/HECLogo';
import { CardIn } from '../../components/Motion';
import { useApp } from '../../context/AppContext';
import { colors, gradients, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AttestationIntro'>;

const REQUIREMENTS = [
  'Scanned copy of original degree certificate',
  'Final transcript / detailed marks certificate',
  'Valid CNIC — clear scans of front and back',
  'Supporting documents requested by the receiving authority (optional)',
];

const STEPS_OVERVIEW = [
  'Fill personal & academic details',
  'Choose service type and upload documents',
  'Pay the fee and verify via OTP',
  'Track approval status in real time',
];

export default function AttestationIntroScreen({ navigation }: Props) {
  const { discardDraft, draft } = useApp();

  const handleStart = async () => {
    if (draft && !draft.payment) {
      // keep existing draft — user can resume or explicitly restart below
    }
    navigation.navigate('AttestationFlow');
  };

  return (
      <View style={styles.root}>
      <LinearGradient style={styles.header} colors={gradients.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerLogo}>
          <HECLogo size={38} />
        </View>
        <Text style={styles.headerTitle}>Degree Attestation</Text>
        <Text style={styles.headerSub}>Government of Pakistan · Higher Education Commission</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <CardIn delay={0} style={[styles.card, shadow.card]}>
          <Text style={styles.cardTitle}>What is this service?</Text>
          <Text style={styles.cardBody}>
            HEC attests degrees issued by chartered Pakistani universities so they are recognised
            abroad for employment, immigration and further studies. Submit your request online,
            pay securely and track every stage without visiting an office.
          </Text>
          <View style={{ marginTop: spacing.md }}>
            {STEPS_OVERVIEW.map((s, i) => (
              <View key={s} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepLabel}>{s}</Text>
              </View>
            ))}
          </View>
        </CardIn>

        <CardIn delay={90} style={[styles.card, shadow.card]}>
          <Text style={styles.cardTitle}>Fee schedule</Text>
          <FeeRow label="Original Degree Certificate" value="PKR 1,800 / set" />
          <FeeRow label="Photocopy attestation" value="PKR 900 / set" />
          <FeeRow label="Both (original + photocopy)" value="PKR 2,400 / set" />
          <FeeRow label="Urgent service surcharge" value="+ PKR 2,500" accent />
          <FeeRow label="Courier delivery" value="+ PKR 650" accent last />
        </CardIn>

        <CardIn delay={180} style={[styles.card, shadow.card]}>
          <Text style={styles.cardTitle}>Before you begin</Text>
          {REQUIREMENTS.map((r) => (
            <View key={r} style={styles.checkRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.green} />
              <Text style={styles.checkText}>{r}</Text>
            </View>
          ))}
          <Text style={styles.note}>
            Normal service completes in ~10 working days; urgent in ~3 working days after verification.
          </Text>
        </CardIn>

        {draft && !draft.payment ? (
          <Button
            label="Discard saved draft"
            variant="danger"
            icon="trash-outline"
            onPress={() => void discardDraft()}
            style={styles.draftBtn}
          />
        ) : null}

        <Button
          label={draft && draft.currentStep > 0 ? 'Resume application' : 'Start application'}
          icon="arrow-forward"
          onPress={handleStart}
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function FeeRow({ label, value, accent, last }: { label: string; value: string; accent?: boolean; last?: boolean }) {
  return (
    <View style={[styles.feeRow, !last && styles.feeBorder]}>
      <Text style={[styles.feeLabel, accent && { color: colors.warning }]}>{label}</Text>
      <Text style={[styles.feeValue, accent && { color: colors.warning }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: 4,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: spacing.xl + 8,
    left: spacing.lg,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    elevation: 4,
  },
  headerLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: spacing.sm,
    shadowColor: '#032015',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12.5,
  },
  body: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.greenDark,
  },
  stepLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  feeBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  feeLabel: {
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  feeValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  checkRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  checkText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  note: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  draftBtn: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
});
