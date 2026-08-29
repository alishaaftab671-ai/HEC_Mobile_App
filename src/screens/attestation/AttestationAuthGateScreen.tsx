import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Button from '../../components/Button';
import LoadingBar from '../../components/LoadingBar';
import ScreenHeader from '../../components/ScreenHeader';
import TextField from '../../components/TextField';
import HECLogo from '../../components/HECLogo';
import { CardIn } from '../../components/Motion';
import { useApp } from '../../context/AppContext';
import { DEMO_USER } from '../../data/demoUser';
import { loadAccounts, saveAccounts, savePendingAccount } from '../../services/storage';
import { colors, gradients, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';
import { formatCNIC, formatPhone, maskPhone } from '../../utils/formatters';
import { uid } from '../../utils/id';
import type { User } from '../../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'AttestationAuthGate'>;

export default function AttestationAuthGateScreen({ navigation }: Props) {
  const { session, login } = useApp();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  // Sign in form state
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or CNIC
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});

  // Sign up form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCnic, setSignupCnic] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  const handleSignIn = async () => {
    const errs: typeof loginErrors = {};
    if (!loginIdentifier.trim()) {
      errs.identifier = 'Enter your Email or 13-digit CNIC.';
    }
    if (loginPassword.length < 4) {
      errs.password = 'Password must be at least 4 characters.';
    }
    setLoginErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      // Simulate network transition loading bar
      await new Promise((res) => setTimeout(res, 600));

      const accounts = await loadAccounts();
      const rawId = loginIdentifier.replace(/\D/g, '');
      const isCnic = rawId.length === 13;

      let account = accounts.find((a) =>
        isCnic ? a.cnic.replace(/\D/g, '') === rawId : a.email.toLowerCase() === loginIdentifier.trim().toLowerCase()
      );

      // Fallback to DEMO_USER if credentials match demo or no local accounts match yet
      if (!account && (loginIdentifier === DEMO_USER.email || loginIdentifier === DEMO_USER.cnic || loginIdentifier.includes('demo'))) {
        account = { ...DEMO_USER, password: 'password' };
      }

      if (!account) {
        // If demo user tried with anything, allow demo login or show error
        setLoginErrors({ form: 'Account not found. Please check your credentials or create a new account.' });
        setLoading(false);
        return;
      }

      const { password: _pw, ...user } = account;
      void _pw;
      await login(user);

      // Navigate to OTP verification for Degree Attestation access
      navigation.navigate('Otp', {
        target: maskPhone(user.phone),
        mode: 'attestation',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const errs: Record<string, string> = {};
    if (fullName.trim().length < 3) errs.fullName = 'Enter your full name as per CNIC.';
    if (!/^\S+@\S+\.\S+$/.test(signupEmail.trim())) errs.email = 'Enter a valid email address.';
    if (signupPhone.replace(/\D/g, '').length !== 11 || !signupPhone.startsWith('03')) {
      errs.phone = 'Enter valid mobile number (e.g., 0300-1234567).';
    }
    if (signupCnic.replace(/\D/g, '').length !== 13) errs.cnic = 'Enter a valid 13-digit CNIC.';
    if (signupPassword.length < 4) errs.password = 'Use at least 4 characters.';
    if (confirmPassword !== signupPassword) errs.confirm = 'Passwords do not match.';

    setSignupErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 600));

      const user: User = {
        id: uid(),
        fullName: fullName.trim(),
        cnic: signupCnic,
        email: signupEmail.trim(),
        phone: signupPhone,
      };

      const accounts = await loadAccounts();
      accounts.push({ ...user, password: signupPassword });
      await saveAccounts(accounts);
      await savePendingAccount(user);

      navigation.navigate('Otp', {
        target: maskPhone(user.phone),
        mode: 'signup',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = async () => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      await login(DEMO_USER);
      navigation.navigate('Otp', {
        target: maskPhone(DEMO_USER.phone),
        mode: 'attestation',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectProceed = async () => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      navigation.navigate('Otp', {
        target: maskPhone(session?.user.phone || '0300-1234567'),
        mode: 'attestation',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient style={styles.header} colors={gradients.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Degree Attestation</Text>
            <Text style={styles.headerSub}>Authentication & Verification</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Modern Top Loading Bar */}
      <LoadingBar visible={loading} height={4} color1={colors.lime} color2={colors.green} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {/* Question Prompt Banner */}
          <CardIn style={[styles.questionCard, shadow.raised]}>
            <View style={styles.questionHeader}>
              <View style={styles.logoBadge}>
                <HECLogo size={32} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.questionTitle}>Have you already signed in?</Text>
                <Text style={styles.questionSub}>
                  Sign in or create an account with Email / CNIC & Password to begin your attestation application.
                </Text>
              </View>
            </View>

            {session ? (
              <View style={styles.existingSessionBox}>
                <Ionicons name="person-circle" size={32} color={colors.green} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionName}>{session.user.fullName}</Text>
                  <Text style={styles.sessionCnic}>CNIC: {session.user.cnic}</Text>
                </View>
                <Button
                  label="Proceed →"
                  small
                  onPress={handleDirectProceed}
                  loading={loading}
                  style={{ minWidth: 100 }}
                />
              </View>
            ) : null}
          </CardIn>

          {/* Toggle Tabs: Sign In / Create Account */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tabBtn, activeTab === 'signin' && styles.tabBtnActive]}
              onPress={() => setActiveTab('signin')}
            >
              <Ionicons
                name="log-in-outline"
                size={18}
                color={activeTab === 'signin' ? colors.greenDark : colors.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'signin' && styles.tabTextActive]}>
                Sign In
              </Text>
            </Pressable>

            <Pressable
              style={[styles.tabBtn, activeTab === 'signup' && styles.tabBtnActive]}
              onPress={() => setActiveTab('signup')}
            >
              <Ionicons
                name="person-add-outline"
                size={18}
                color={activeTab === 'signup' ? colors.greenDark : colors.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                Create Account
              </Text>
            </Pressable>
          </View>

          {/* Tab Content 1: Sign In */}
          {activeTab === 'signin' ? (
            <CardIn style={[styles.formCard, shadow.card]}>
              <Text style={styles.formTitle}>Sign in to your HEC Account</Text>

              {loginErrors.form ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorBoxText}>{loginErrors.form}</Text>
                </View>
              ) : null}

              <TextField
                label="Email Address or CNIC"
                required
                placeholder="you@example.com or 35202-1234567-1"
                value={loginIdentifier}
                onChangeText={(t) => {
                  setLoginIdentifier(t);
                  if (loginErrors.identifier) setLoginErrors((prev) => ({ ...prev, identifier: undefined }));
                }}
                error={loginErrors.identifier}
                autoCapitalize="none"
              />

              <TextField
                label="Password"
                required
                secure
                placeholder="Enter password"
                value={loginPassword}
                onChangeText={(t) => {
                  setLoginPassword(t);
                  if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={loginErrors.password}
              />

              <Button
                label="Sign In & Continue"
                icon="shield-checkmark"
                onPress={handleSignIn}
                loading={loading}
                style={{ marginTop: spacing.sm }}
              />

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <Button
                label="Quick Demo Account"
                variant="secondary"
                icon="sparkles-outline"
                onPress={handleUseDemo}
                disabled={loading}
              />
            </CardIn>
          ) : (
            /* Tab Content 2: Sign Up */
            <CardIn style={[styles.formCard, shadow.card]}>
              <Text style={styles.formTitle}>Create new HEC eServices Account</Text>

              <TextField
                label="Full Name (as on CNIC)"
                required
                placeholder="Muhammad Ali"
                value={fullName}
                onChangeText={setFullName}
                error={signupErrors.fullName}
                autoCapitalize="words"
              />

              <TextField
                label="Email Address"
                required
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={signupEmail}
                onChangeText={setSignupEmail}
                error={signupErrors.email}
              />

              <TextField
                label="Mobile Number"
                required
                placeholder="0300-1234567"
                keyboardType="number-pad"
                value={signupPhone}
                onChangeText={(t) => setSignupPhone(formatPhone(t))}
                error={signupErrors.phone}
                hint="OTP code will be sent to this mobile number."
              />

              <TextField
                label="CNIC Number"
                required
                placeholder="35202-1234567-1"
                keyboardType="number-pad"
                value={signupCnic}
                onChangeText={(t) => setSignupCnic(formatCNIC(t))}
                error={signupErrors.cnic}
              />

              <TextField
                label="Password"
                required
                secure
                placeholder="Choose password"
                value={signupPassword}
                onChangeText={setSignupPassword}
                error={signupErrors.password}
              />

              <TextField
                label="Confirm Password"
                required
                secure
                placeholder="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={signupErrors.confirm}
              />

              <Button
                label="Create Account & Verify OTP"
                icon="arrow-forward"
                onPress={handleSignUp}
                loading={loading}
                style={{ marginTop: spacing.md }}
              />
            </CardIn>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
  },
  body: {
    padding: spacing.lg,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.mantisSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  questionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  existingSessionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.greenSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  sessionName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sessionCnic: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E6ECF5',
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.greenDark,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorBoxText: {
    flex: 1,
    fontSize: 12.5,
    color: colors.error,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
  dividerText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.textMuted,
  },
});
