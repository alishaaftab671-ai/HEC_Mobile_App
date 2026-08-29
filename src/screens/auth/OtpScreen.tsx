import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/Button';
import LoadingBar from '../../components/LoadingBar';
import ScreenHeader from '../../components/ScreenHeader';
import { useApp } from '../../context/AppContext';
import { colors, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';
import { takePendingAccount, loadAccounts, saveAccounts } from '../../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const CODE_LENGTH = 5;
const DEMO_CODE = '12345';
const RESEND_SECONDS = 30;

export default function OtpScreen({ route, navigation }: Props) {
  const { target, mode } = route.params;
  const { login, updateDraft } = useApp();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const handleVerify = async () => {
    if (code.length < CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code.`);
      return;
    }
    if (code !== DEMO_CODE) {
      setError('Invalid code. For this demo use 12345.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') {
        const user = await takePendingAccount();
        if (user) {
          const accounts = await loadAccounts();
          // account row was saved at signup; nothing more needed here
          void accounts;
          await login(user);
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
          return;
        }
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        updateDraft({ otpVerified: true });
        navigation.replace('AttestationIntro');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Verification" subtitle={mode === 'signup' ? 'Confirm your identity' : 'Payment verification'} navigation={navigation} />
      <LoadingBar visible={busy} height={3} />
      <View style={styles.body}>
        <View style={[styles.card, shadow.raised]}>
          <View style={styles.iconWrap}>
            <Ionicons name="chatbubble-ellipses" size={26} color={colors.green} />
          </View>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            We sent a 5-digit code via SMS to{' '}
            <Text style={styles.target}>{target}</Text>
          </Text>

          <View style={styles.demoBanner}>
            <Ionicons name="information-circle" size={16} color={colors.navyMuted} />
            <Text style={styles.demoText}>Demo code: {DEMO_CODE}</Text>
          </View>

          <Pressable onPress={() => inputRef.current?.focus()} style={styles.codeBoxes}>
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <View key={i} style={[styles.box, error ? styles.boxError : null, i === code.length && styles.boxActive]}>
                <Text style={styles.boxText}>{code[i] ?? ''}</Text>
              </View>
            ))}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(t) => {
                setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH));
                if (error) setError(null);
              }}
              keyboardType="number-pad"
              autoFocus
              style={styles.hiddenInput}
            />
          </Pressable>

          {error ? (
            <Text style={styles.error}>
              <Ionicons name="alert-circle" size={13} /> {error}
            </Text>
          ) : null}

          <Button label="Verify" onPress={handleVerify} loading={busy} style={{ marginTop: spacing.lg }} />

          <View style={styles.resendRow}>
            {secondsLeft > 0 ? (
              <Text style={styles.resendWaiting}>Resend code in {secondsLeft}s</Text>
            ) : (
              <Pressable hitSlop={8} onPress={() => setSecondsLeft(RESEND_SECONDS)}>
                <Text style={styles.resendLink}>Resend code</Text>
              </Pressable>
            )}
          </View>
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
  body: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
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
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  target: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.limeSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  demoText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#8A6508',
  },
  codeBoxes: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  box: {
    width: 46,
    height: 54,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: colors.green,
    borderWidth: 2,
  },
  boxError: {
    borderColor: colors.error,
  },
  boxText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  error: {
    marginTop: spacing.md,
    color: colors.error,
    fontSize: 12.5,
    fontWeight: '600',
  },
  resendRow: {
    marginTop: spacing.md,
  },
  resendWaiting: {
    color: colors.textMuted,
    fontSize: 13,
  },
  resendLink: {
    color: colors.green,
    fontSize: 13.5,
    fontWeight: '800',
  },
});
