import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { CardIn, TapCard } from '../../components/Motion';
import { useApp } from '../../context/AppContext';
import { colors, gradients, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList, TabParamList } from '../../types/navigation';
import { formatDateTime, formatPKR, timeAgo } from '../../utils/formatters';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ApplicationsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ApplicationsScreen({ navigation }: Props) {
  const { applications, advanceStatuses } = useApp();

  return (
    <View style={styles.root}>
      <LinearGradient style={styles.header} colors={gradients.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.headerTitle}>My Applications</Text>
        {applications.length > 0 ? (
          <Pressable
            onPress={advanceStatuses}
            hitSlop={8}
            style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="sync" size={14} color={colors.navy} />
            <Text style={styles.refreshLabel}>Simulate progress</Text>
          </Pressable>
        ) : null}
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {applications.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No applications yet"
            body="When you submit a degree attestation request it will appear here with its live status."
            actionLabel="Start an application"
            onAction={() => navigation.navigate('AttestationIntro')}
          />
        ) : (
          applications.map((app, i) => (
            <CardIn key={app.id} delay={Math.min(i, 6) * 70}>
              <TapCard onPress={() => navigation.navigate('ApplicationStatusDetail', { applicationId: app.id })} style={styles.tapWrap}>
                <View style={[styles.card, shadow.card]}>
                  <View style={styles.rowTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ref}>{app.referenceId}</Text>
                      <Text style={styles.service}>{app.serviceName}</Text>
                    </View>
                    <StatusBadge status={app.status} />
                  </View>
                  <View style={[styles.statusStrip, app.status === 'Completed' && styles.statusStripDone]} />
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                      <Text style={styles.metaText}>Submitted {timeAgo(app.submittedAt)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="documents-outline" size={13} color={colors.textMuted} />
                      <Text style={styles.metaText}>{app.documentCount} docs</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="cash-outline" size={13} color={colors.textMuted} />
                      <Text style={styles.metaText}>{formatPKR(app.feeTotal)}</Text>
                    </View>
                  </View>
                  <View style={styles.footerRow}>
                    <Text style={styles.updated}>Updated {formatDateTime(app.updatedAt)}</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>Details</Text>
                      <Ionicons name="chevron-forward" size={15} color={colors.green} />
                    </View>
                  </View>
                </View>
              </TapCard>
            </CardIn>
          ))
        )}
        {applications.length > 0 ? (
          <Button
            label="New degree attestation request"
            variant="secondary"
            icon="add"
            small
            onPress={() => navigation.navigate('AttestationIntro')}
            style={styles.newBtn}
          />
        ) : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.greenDeep,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg + 22,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.lime,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  refreshLabel: {
    color: colors.navy,
    fontSize: 11.5,
    fontWeight: '800',
  },
  tapWrap: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  body: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statusStrip: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.green,
    marginTop: spacing.sm + 2,
  },
  statusStripDone: {
    backgroundColor: '#2456B8',
  },
  ref: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: 0.3,
  },
  service: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
    marginTop: spacing.sm + 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  metaText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: spacing.sm + 2,
    paddingTop: spacing.sm + 2,
  },
  updated: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: colors.green,
    fontSize: 12.5,
    fontWeight: '700',
  },
  newBtn: {
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
});
