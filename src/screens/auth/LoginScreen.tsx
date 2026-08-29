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
import TextField from '../../components/TextField';
import HECLogo from '../../components/HECLogo';
import { CardIn } from '../../components/Motion';
import { useApp } from '../../context/AppContext';
import { DEMO_USER } from '../../data/demoUser';
import { loadAccounts } from '../../services/storage';
import { colors, gradients, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';
import { formatCNIC } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useApp();
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ cnic?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    const next: typeof errors = {};
    if (cnic.replace(/\D/g, '').length !== 13) next.cnic = 'Enter a valid 13-digit CNIC number.';
    if (password.length < 4) next.password = 'Password must be at least 4 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const accounts = await loadAccounts();
      const account = accounts.find((a) => a.cnic === cnic);
      if (!account) {
        setErrors({ form: 'No account exists for this CNIC. Create one below, or try the demo account.' });
        return;
      }
      if (account.password !== password) {
        setErrors({ form: 'Incorrect password. Please try again.' });
        return;
      }
      const { password: _pw, ...user } = account;
      void _pw;
      await login(user);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } finally {
      setBusy(false);
    }
  };

  const loginDemo = async () => {
    setBusy(true);
    try {
      await login(DEMO_USER);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <LoadingBar visible={busy} height={3} />
      <LinearGradient style={styles.hero} colors={gradients.header} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 1 }}>
        <View style={[styles.badge, shadow.raised]}>
          <HECLogo size={40} />
        </View>
        <Text style={styles.appTitle}>HEC eServices</Text>
        <Text style={styles.tagline}>Higher Education Commission · Pakistan</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <CardIn style={[styles.card, shadow.raised]}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to manage your applications</Text>

            {errors.form ? (
              <View style={styles.formError}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.formErrorText}>{errors.form}</Text>
              </View>
            ) : null}

            <TextField
              label="CNIC Number"
              required
              placeholder="35202-1234567-1"
              keyboardType="number-pad"
              value={cnic}
              onChangeText={(t) => setCnic(formatCNIC(t))}
              error={errors.cnic}
              autoComplete="off"
            />
            <TextField
              label="Password"
              required
              secure
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <Button label="Sign In" onPress={handleLogin} loading={busy} />

            <Pressable onPress={() => navigation.navigate('Otp', { target: '0300-•••4567', mode: 'signup' })}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerLabel}>OR</Text>
              <View style={styles.divider} />
            </View>

            <Button label="Use demo account" variant="secondary" icon="sparkles-outline" onPress={loginDemo} disabled={busy} />
          </CardIn>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>New to eServices? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')} hitSlop={8}>
              <Text style={styles.signupLink}>Create an account</Text>
            </Pressable>
          </View>
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
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xxl + 34,
    paddingBottom: spacing.xl + 26,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: spacing.md,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  tagline: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 12.5,
    marginTop: 4,
  },
  body: {
    padding: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: 13.5,
    color: colors.textSecondary,
    marginTop: 3,
    marginBottom: spacing.md,
  },
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  formErrorText: {
    flex: 1,
    color: colors.error,
    fontSize: 12.5,
    fontWeight: '600',
  },
  forgot: {
    textAlign: 'center',
    color: colors.navyMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
  dividerLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  signupText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: colors.green,
    fontSize: 14,
    fontWeight: '800',
  },
});
