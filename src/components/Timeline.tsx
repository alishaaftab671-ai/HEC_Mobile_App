import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';
import type { TimelineEvent } from '../types/models';
import { formatDateTime } from '../utils/formatters';

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <View>
      {events.map((e, i) => {
        const isLast = i === events.length - 1;
        const dotColor =
          e.state === 'done' ? colors.green : e.state === 'current' ? colors.lime : colors.borderStrong;
        return (
          <View key={e.label} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: dotColor }, e.state === 'current' && styles.dotCurrent]} />
              {!isLast ? <View style={[styles.line, e.state === 'done' && styles.lineDone]} /> : null}
            </View>
            <View style={styles.content}>
              <Text
                style={[
                  styles.label,
                  e.state === 'upcoming' && styles.labelUpcoming,
                  e.state !== 'upcoming' && e.state !== 'done' && styles.labelCurrent,
                ]}
              >
                {e.label}
                {e.state === 'current' ? '  •' : ''}
              </Text>
              <Text style={styles.date}>{e.date ? formatDateTime(e.date) : 'Pending'}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  rail: {
    width: 22,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  dotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#E8BE3C',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  lineDone: {
    backgroundColor: colors.green,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  label: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  labelCurrent: {
    color: colors.greenDark,
  },
  labelUpcoming: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
