import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';

import { colors, radius, shadow, spacing } from '../theme';

interface Props {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function SectionCard({ title, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
