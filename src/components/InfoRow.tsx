import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

interface Props {
  label: string;
  value?: string | null;
  last?: boolean;
}

export default function InfoRow({ label, value, last }: Props) {
  return (
    <View style={[styles.row, !last && styles.border]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={2}>
        {value || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 8,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    width: 118,
    paddingTop: 1,
  },
  value: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
});
