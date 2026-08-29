import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { colors, gradients, radius, spacing } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';
import type { AttestationForm } from '../../types/models';
import { STEPS, type StepProps } from './stepProps';
import PersonalStep from './steps/PersonalStep';
import ContactStep from './steps/ContactStep';
import EducationStep, { validate as validateEducation } from './steps/EducationStep';
import DegreeInstitutionStep, { validate as validateDegreeInstitution } from './steps/DegreeInstitutionStep';
import ServiceDetailsStep, { validate as validateServiceDetails } from './steps/ServiceDetailsStep';
import DocumentsStep, { validate as validateDocuments } from './steps/DocumentsStep';
import PaymentStep, { validate as validatePayment } from './steps/PaymentStep';
import VerificationStep, { validate as validateVerification } from './steps/VerificationStep';
import ReviewSubmitStep, { validate as validateReview } from './steps/ReviewSubmitStep';

type Props = NativeStackScreenProps<RootStackParamList, 'AttestationFlow'>;

interface StepModule {
  Component: (props: StepProps) => React.JSX.Element;
  validate: (form: AttestationForm) => Record<string, string>;
}

function validatePersonal(form: AttestationForm): Record<string, string> {
  const e: Record<string, string> = {};
  const p = form.personal;
  if (p.fullName.trim().length < 3) e.fullName = 'Enter your full name as per CNIC.';
  if (p.fatherName.trim().length < 3) e.fatherName = "Enter your father's name.";
  if (p.cnic.replace(/\D/g, '').length !== 13) e.cnic = 'Enter a valid 13-digit CNIC.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.dob)) e.dob = 'Use YYYY-MM-DD.';
  if (!p.gender) e.gender = 'Select gender.';
  return e;
}

function validateContact(form: AttestationForm): Record<string, string> {
  const e: Record<string, string> = {};
  const c = form.contact;
  if (!/^\S+@\S+\.\S+$/.test(c.email.trim())) e.email = 'Enter a valid email address.';
  if (c.phone.replace(/\D/g, '').length !== 11 || !c.phone.startsWith('03'))
    e.phone = 'Enter a valid mobile number e.g. 0300-1234567.';
  if (c.address.trim().length < 8) e.address = 'Enter your complete postal address.';
  if (!c.province) e.province = 'Select province.';
  if (!c.city) e.city = 'Select city.';
  return e;
}

const STEP_MODULES: StepModule[] = [
  { Component: PersonalStep, validate: validatePersonal },
  { Component: ContactStep, validate: validateContact },
  { Component: EducationStep, validate: validateEducation },
  { Component: DegreeInstitutionStep, validate: validateDegreeInstitution },
  { Component: ServiceDetailsStep, validate: validateServiceDetails },
  { Component: DocumentsStep, validate: validateDocuments },
  { Component: PaymentStep, validate: validatePayment },
  { Component: VerificationStep, validate: validateVerification },
  { Component: ReviewSubmitStep, validate: validateReview },
];

export default function AttestationFlowScreen({ navigation }: Props) {
  const { draft, startDraft, updateDraft, submitApplication } = useApp();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBanner, setShowBanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!draft) startDraft();
  }, [draft, startDraft]);

  const stepIndex = Math.min(draft?.currentStep ?? 0, STEPS.length - 1);

  const progressValue = useSharedValue(stepIndex === 0 ? 0 : (stepIndex + 1) / STEPS.length);

  useEffect(() => {
    progressValue.value = withTiming((stepIndex + 1) / STEPS.length, { duration: 380 });
  }, [stepIndex, progressValue]);

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressValue.value }],
  }));

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stepIndex > 0) {
        goPrev();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  });

  const goPrev = () => {
    setErrors({});
    setShowBanner(false);
    updateDraft({ currentStep: Math.max(0, stepIndex - 1) });
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const confirmExit = () => {
    Alert.alert(
      'Leave application?',
      'Your progress is saved as a draft and you can resume any time.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Save & exit', style: 'default', onPress: () => navigation.goBack() },
      ],
    );
  };

  const saveAsDraftAndExit = () => {
    updateDraft({ savedAt: new Date().toISOString() });
    navigation.goBack();
  };

  const handleSubmit = async () => {
    if (!draft) return;
    setSubmitting(true);
    try {
      const app = await submitApplication(draft);
      navigation.replace('SubmissionSuccess', { applicationId: app.id });
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (!draft) return;
    const errs = STEP_MODULES[stepIndex].validate(draft);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setShowBanner(true);
      return;
    }
    setShowBanner(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (stepIndex === STEPS.length - 1) {
      void handleSubmit();
    } else {
      updateDraft({ currentStep: stepIndex + 1 });
    }
  };

  if (!draft) {
    return <View style={styles.root} />;
  }

  const Current = STEP_MODULES[stepIndex].Component;
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <View style={styles.root}>
      <LinearGradient style={[styles.headerWrap, { paddingTop: insets.top + spacing.xs }]} colors={gradients.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.8 }}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => (stepIndex > 0 ? goPrev() : confirmExit())}
            hitSlop={10}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Degree Attestation</Text>
            <Text style={styles.headerSub}>
              Step {stepIndex + 1} of {STEPS.length} · {STEPS[stepIndex]}
            </Text>
          </View>
          <Pressable onPress={confirmExit} hitSlop={10} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.stepBody}>
          <Current form={draft} update={updateDraft} errors={errors} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {showBanner ? (
          <View style={styles.banner}>
            <Ionicons name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.bannerText}>Please complete the highlighted fields.</Text>
          </View>
        ) : null}
        <Button
          label="Save as draft & exit"
          variant="ghost"
          icon="bookmark-outline"
          small
          onPress={saveAsDraftAndExit}
          style={styles.saveDraftBtn}
        />
        <View style={styles.footerRow}>
          {stepIndex > 0 ? (
            <Button label="Back" variant="secondary" icon="arrow-back" onPress={goPrev} style={styles.backFooterBtn} />
          ) : null}
          <Button
            label={isLast ? 'Submit application' : 'Continue'}
            icon={isLast ? 'checkmark-done' : 'arrow-forward'}
            loading={submitting}
            onPress={goNext}
            style={styles.nextBtn}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: colors.lime,
    transformOrigin: 'left center',
  },
  stepBody: {
    padding: spacing.lg,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  bannerText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.error,
  },
  saveDraftBtn: {
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  backFooterBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});
