import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '../theme';

interface Props extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, required, secure, containerStyle, ...inputProps },
  ref,
) {
  const [reveal, setReveal] = useState(false);
  const isPassword = !!secure;
  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      <View
        style={[
          styles.inputRow,
          error ? styles.inputError : null,
          inputProps.editable === false && styles.inputDisabled,
        ]}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !reveal}
          style={styles.input}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable onPress={() => setReveal((r) => !r)} hitSlop={8}>
            <Ionicons name={reveal ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  req: {
    color: colors.error,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  error: {
    marginTop: 5,
    fontSize: 12,
    color: colors.error,
  },
  hint: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textMuted,
  },
});
