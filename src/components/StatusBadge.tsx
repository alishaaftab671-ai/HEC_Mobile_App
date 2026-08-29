import { StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '../theme';
import type { AppStatus } from '../types/models';

const STYLES: Record<AppStatus, { bg: string; fg: string }> = {
  Submitted: { bg: colors.greenSoft, fg: colors.greenDark },
  Verification: { bg: colors.mantisSoft, fg: '#1F8A5D' },
  'Under Review': { bg: colors.warningBg, fg: colors.warning },
  Processing: { bg: colors.limeSoft, fg: '#A06D08' },
  Completed: { bg: '#DEEBFF', fg: '#2456B8' },
};

export default function StatusBadge({ status }: { status: AppStatus }) {
  const s = STYLES[status] ?? STYLES.Submitted;
  return <Text style={[styles.badge, { backgroundColor: s.bg, color: s.fg }]}>{status}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
