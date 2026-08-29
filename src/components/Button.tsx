import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<Variant, { bg: ViewStyle['backgroundColor']; border: ViewStyle['borderColor']; text: TextStyle['color'] }> = {
  primary: { bg: colors.green, border: colors.green, text: '#FFFFFF' },
  secondary: { bg: 'transparent', border: colors.navyMuted, text: colors.navy },
  danger: { bg: colors.errorBg, border: 'transparent', text: colors.error },
  ghost: { bg: 'transparent', border: 'transparent', text: colors.green },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  small,
  icon,
  style,
}: Props) {
  const v = VARIANTS[variant];
  const isDisabled = !!disabled || !!loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          opacity: isDisabled ? 0.5 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.975 : 1 }],
        },
        variant === 'primary' && !small && styles.primaryShadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 15 : 17} color={v.text} /> : null}
          <Text style={[styles.label, { color: v.text }, small && styles.labelSmall]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  small: {
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  primaryShadow: {
    shadowColor: '#003D25',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: '600',
  },
});
