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

import Button from '../../components/Button';
import LoadingBar from '../../components/LoadingBar';
import ScreenHeader from '../../components/ScreenHeader';
import TextField from '../../components/TextField';
import { colors, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';
import { formatCNIC, formatPhone, maskPhone } from '../../utils/formatters';
import { loadAccounts, saveAccounts, savePendingAccount } from '../../services/storage';
import { uid } from '../../utils/id';
import type { User } from '../../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  cnic: string;
  password: string;
  confirm: string;
}

export default function SignupScreen({ navigation }: Props) {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'form', string>>>({});
  const [busy, setBusy] = useState(false);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = async (): Promise<boolean> => {
    const next: typeof errors = {};
    if (form.fullName.trim().length < 3) next.fullName = 'Enter your full name as it appears on your CNIC.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.phone.replace(/\D/g, '').length !== 11 || !form.phone.startsWith('03'))
      next.phone = 'Enter a valid mobile number e.g. 0300-1234567.';
    if (form.cnic.replace(/\D/g, '').length !== 13) next.cnic = 'Enter a valid 13-digit CNIC number.';
    if (form.password.length < 4) next.password = 'Use at least 4 characters.';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.';

    const accounts = await loadAccounts();
    if (accounts.some((a) => a.cnic === form.cnic)) {
      next.cnic = 'An account already exists for this CNIC. Try signing in.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setBusy(true);
    try {
      if (!(await validate())) return;
      const user: User = {
        id: uid(),
        fullName: form.fullName.trim(),
        cnic: form.cnic,
        email: form.email.trim(),
        phone: form.phone,
      };
      const accounts = await loadAccounts();
      accounts.push({ ...user, password: form.password });
      await saveAccounts(accounts);
      await savePendingAccount(user);
      navigation.navigate('Otp', { target: maskPhone(user.phone), mode: 'signup' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Create account" subtitle="Register for HEC eServices" navigation={navigation} />
      <LoadingBar visible={busy} height={3} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, shadow.card]}>
            <TextField label="Full Name" required placeholder="Muhammad Ali" value={form.fullName} onChangeText={set('fullName')} error={errors.fullName} autoCapitalize="words" />
            <TextField label="Email Address" required placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set('email')} error={errors.email} />
            <TextField label="Mobile Number" required placeholder="0300-1234567" keyboardType="number-pad" value={form.phone} onChangeText={(t) => set('phone')(formatPhone(t))} error={errors.phone} hint="An OTP will be sent to verify this number." />
            <TextField label="CNIC Number" required placeholder="35202-1234567-1" keyboardType="number-pad" value={form.cnic} onChangeText={(t) => set('cnic')(formatCNIC(t))} error={errors.cnic} />
            <TextField label="Password" required secure placeholder="Choose a password" value={form.password} onChangeText={set('password')} error={errors.password} />
            <TextField label="Confirm Password" required secure placeholder="Repeat password" value={form.confirm} onChangeText={set('confirm')} error={errors.confirm} />

            <Button label="Continue to verification" onPress={handleSubmit} loading={busy} icon="shield-checkmark-outline" />
          </View>

          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.backToLogin}>Already registered? Sign in</Text>
          </Pressable>
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
  body: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  backToLogin: {
    textAlign: 'center',
    color: colors.green,
    fontWeight: '800',
    fontSize: 14,
    paddingVertical: spacing.lg,
  },
});
