import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import EmptyState from '../../components/EmptyState';
import { CardIn } from '../../components/Motion';
import { useApp } from '../../context/AppContext';
import { colors, radius, spacing } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';
import type { AppNotification as AppNotificationModel } from '../../types/models';
import { timeAgo } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

type IconName = ComponentProps<typeof Ionicons>['name'];

const CATEGORY_META: Record<AppNotificationModel['category'], { icon: IconName; bg: string; fg: string }> = {
  application: { icon: 'document-text', bg: colors.greenSoft, fg: colors.greenDark },
  action: { icon: 'checkmark-done', bg: colors.mantisSoft, fg: '#4E8F3D' },
  announcement: { icon: 'megaphone-outline', bg: colors.limeSoft, fg: '#7A8413' },
};

export default function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSub}>
            {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'You are all caught up'}
          </Text>
        </View>
        {unreadCount > 0 ? (
          <Pressable onPress={markAllNotificationsRead} hitSlop={8} style={({ pressed }) => [styles.markAllBtn, pressed && { opacity: 0.7 }]}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={[styles.list, notifications.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications"
            body="Status updates about your applications and HEC announcements will appear here."
            actionLabel="Go to home"
            onAction={() => navigation.goBack()}
          />
        }
        renderItem={({ index }) => (
          <CardIn delay={Math.min(index, 6) * 60} style={{ marginBottom: spacing.sm }}>
            <NotificationRow notification={notifications[index]} onPress={() => markNotificationRead(notifications[index].id)} />
          </CardIn>
        )}
        ItemSeparatorComponent={null}
      />
    </View>
  );
}

function NotificationRow({ notification, onPress }: { notification: AppNotificationModel; onPress: () => void }) {
  const meta = CATEGORY_META[notification.category];
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.background }]} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={17} color={meta.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !notification.read && styles.titleUnread]} numberOfLines={2}>
            {notification.title}
          </Text>
          {!notification.read ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.bodyText} numberOfLines={2}>{notification.body}</Text>
        <Text style={styles.time}>{timeAgo(notification.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.greenDeep,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginRight: spacing.md,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 2,
  },
  markAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  markAllText: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: '800',
  },
  list: {
    padding: spacing.lg,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  titleUnread: {
    fontWeight: '800',
    color: colors.textPrimary,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.error,
  },
  bodyText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 3,
  },
  time: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: spacing.xs + 2,
  },
});
