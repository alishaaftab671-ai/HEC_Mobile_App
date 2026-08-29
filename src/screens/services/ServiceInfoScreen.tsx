import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CardIn } from '../../components/Motion';
import { colors, gradients, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList, ServiceId } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceInfo'>;

interface ServiceDetail {
  title: string;
  subtitle: string;
  description: string;
  requirements: string[];
  processingTime: string;
  fee: string;
}

const SERVICE_DETAILS: Record<ServiceId, ServiceDetail> = {
  attestation: {
    title: 'Degree Attestation',
    subtitle: 'Verify your academic credentials',
    description: 'HEC attests degrees, transcripts, and certificates issued by Pakistani universities recognized by HEC.',
    requirements: ['Original Degree and Transcripts', 'CNIC / Passport Copy', 'Matric & Intermediate Certificates (for Bachelor/Master degrees)'],
    processingTime: '3 - 5 Working Days',
    fee: 'PKR 1,000 per document',
  },
  equivalence: {
    title: 'Equivalence Certificate',
    subtitle: 'Foreign qualifications comparison',
    description: 'Equivalence of foreign degrees, diplomas, and certificates with corresponding Pakistani qualifications.',
    requirements: ['Original Foreign Degree / Transcript', 'HEC Accredited Institution Proof', 'IBCC equivalence for school level credentials', 'Passport copy with travel history'],
    processingTime: '7 - 10 Working Days',
    fee: 'PKR 5,000',
  },
  scholarships: {
    title: 'HEC Scholarships',
    subtitle: 'Local and international scholarships',
    description: 'Apply for prestigious domestic and international scholarship programs offered by HEC for higher studies.',
    requirements: ['Valid Academic Transcripts', 'Statement of Purpose / Research Proposal', 'Recommendation Letters', 'Valid Test Score (HAT / GRE / GAT)'],
    processingTime: 'Varies by Program Call',
    fee: 'Free / Nominal processing fee',
  },
  'other-services': {
    title: 'Other HEC Services',
    subtitle: 'NOCs, verification letters, and more',
    description: 'Additional services including No Objection Certificates (NOC) for study abroad, duplicate letters, and verification.',
    requirements: ['Application form via portal', 'Supporting Identification Documents', 'University clearance certificate'],
    processingTime: '3 - 7 Working Days',
    fee: 'Varies by service type',
  },
};

export default function ServiceInfoScreen({ route, navigation }: Props) {
  const { serviceId } = route.params;
  const insets = useSafeAreaInsets();
  const service = SERVICE_DETAILS[serviceId] || SERVICE_DETAILS.attestation;

  const handleApply = () => {
    if (serviceId === 'attestation') {
      navigation.navigate('AttestationAuthGate');
    } else {
      navigation.navigate('AttestationFlow');
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient style={styles.background} colors={gradients.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Service Information</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Info Card */}
          <CardIn>
            <View style={[styles.card, shadow.card]}>
              <View style={styles.iconChip}>
                <Ionicons name="document-text" size={24} color={colors.navy} />
              </View>
              <Text style={styles.eyebrow}>HEC SERVICE</Text>
              <Text style={styles.title}>{service.title}</Text>
              <Text style={styles.subtitle}>{service.subtitle}</Text>
              <View style={styles.descriptionBox}>
                <Text style={styles.desc}>{service.description}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaBox}>
                  <Ionicons name="time-outline" size={18} color={colors.greenDark} />
                  <Text style={styles.metaLabel}>Processing Time</Text>
                  <Text style={styles.metaVal}>{service.processingTime}</Text>
                </View>
                <View style={styles.metaBox}>
                  <Ionicons name="card-outline" size={18} color={colors.warning} />
                  <Text style={styles.metaLabel}>Service Fee</Text>
                  <Text style={styles.metaVal}>{service.fee}</Text>
                </View>
              </View>
            </View>
          </CardIn>

          {/* Requirements Section */}
          <CardIn delay={100}>
            <View style={[styles.card, shadow.card, { marginTop: spacing.md }]}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="shield-checkmark-outline" size={17} color={colors.green} />
                </View>
                <Text style={styles.sectionTitle}>Required Documents & Criteria</Text>
              </View>
              {service.requirements.map((req, idx) => (
                <View key={idx} style={styles.reqRow}>
                  <View style={styles.reqIcon}>
                    <Ionicons name="checkmark" size={14} color={colors.greenDark} />
                  </View>
                  <Text style={styles.reqText}>{req}</Text>
                </View>
              ))}
            </View>
          </CardIn>

          {/* Proceed Button */}
          <CardIn delay={200}>
            <Pressable style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Proceed to Application</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </CardIn>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  background: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  body: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconChip: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.1, color: colors.green, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  subtitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginTop: 2, marginBottom: spacing.md },
  descriptionBox: { backgroundColor: colors.mantisSoft, borderRadius: radius.md, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.mantis },
  desc: { fontSize: 13.5, color: colors.greenDeep, lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  metaBox: { flex: 1, backgroundColor: colors.background, padding: spacing.md, borderRadius: radius.md, gap: 4, borderWidth: 1, borderColor: colors.border },
  metaLabel: { fontSize: 10.5, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  metaVal: { fontSize: 12.5, fontWeight: '800', color: colors.textPrimary },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '900', color: colors.textPrimary },
  reqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm, padding: spacing.sm, backgroundColor: colors.background, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  reqIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  reqText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', flex: 1 },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.lg,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  applyBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
