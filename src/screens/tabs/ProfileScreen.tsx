import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import SectionCard from '../../components/SectionCard';
import { CardIn } from '../../components/Motion';
import { useApp } from '../../context/AppContext';
import { loadProfilePhoto, saveProfilePhoto } from '../../services/storage';
import { colors, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList, TabParamList } from '../../types/navigation';
import { maskCNIC, maskEmail, maskPhone } from '../../utils/formatters';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ProfileTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ProfileScreen({ navigation }: Props) {
  const { session, logout, applications, notifications, unreadCount, draft } = useApp();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const user = session?.user;

  useEffect(() => {
    void loadProfilePhoto().then(setProfilePhoto);
  }, []);

  if (!user) return null;

  const completed = applications.filter((a) => a.status === 'Completed').length;

  const confirmLogout = () => {
    Alert.alert('Sign out', 'You will need to sign in again to access your applications.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const changeProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;

    const uri = result.assets[0].uri;
    setProfilePhoto(uri);
    await saveProfilePhoto(uri);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.avatar} onPress={() => void changeProfilePhoto()} accessibilityLabel="Change profile picture">
          {profilePhoto ? <Image source={{ uri: profilePhoto }} style={styles.avatarImage} contentFit="cover" /> : <Text style={styles.avatarText}>{initials(user.fullName)}</Text>}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={13} color={colors.surface} />
          </View>
        </Pressable>
        <Pressable onPress={() => void changeProfilePhoto()} hitSlop={6}>
          <Text style={styles.changePhoto}>Change profile photo</Text>
        </Pressable>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.sub}>Registered via HEC eServices</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <CardIn style={[styles.statsRow, shadow.card]}>
          <Stat value={String(applications.length)} label="Applications" />
          <Divider />
          <Stat value={String(completed)} label="Completed" />
          <Divider />
          <Stat value={unreadCount > 0 ? `${unreadCount}` : '0'} label="Unread alerts" />
        </CardIn>

        <SectionCard title="Personal details">
          <DetailRow icon="person-outline" label="Full name" value={user.fullName} />
          <DetailRow icon="card-outline" label="CNIC" value={maskCNIC(user.cnic)} />
          <DetailRow icon="call-outline" label="Phone" value={maskPhone(user.phone)} />
          <DetailRow icon="mail-outline" label="Email" value={maskEmail(user.email)} last />
        </SectionCard>

        <SectionCard title="Quick links">
          <LinkRow
            icon="notifications"
            label="Notifications"
            meta={unreadCount > 0 ? `${unreadCount} new` : 'All read'}
            onPress={() => navigation.navigate('Notifications')}
          />
          <LinkRow
            icon="document-text"
            label="My applications"
            meta={`${applications.length}`}
            onPress={() => navigation.navigate('Main', { screen: 'ApplicationsTab' })}
          />
          {draft ? (
            <LinkRow
              icon="create"
              label="View / edit saved application"
              meta={`Step ${draft.currentStep + 1}`}
              onPress={() => navigation.navigate('AttestationFlow')}
              last
            />
          ) : (
            <LinkRow
              icon="help-circle"
              label="Help & FAQs"
              onPress={() => navigation.navigate('Main', { screen: 'HelpTab' })}
              last
            />
          )}
        </SectionCard>

        <SectionCard title="About">
          <Text style={styles.aboutText}>
            HEC eServices Mobile — demo build v1.0.0. Degree attestation requests submitted here are
            processed locally for demonstration purposes and no data leaves this device.
          </Text>
        </SectionCard>

        <Pressable style={[styles.logoutBtn, shadow.card]} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={19} color={colors.error} />
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function DetailRow({
  icon,
  label,
  value,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailBorder]}>
      <Ionicons name={icon} size={17} color={colors.navyMuted} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  meta,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  meta?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.linkRow, !last && styles.detailBorder, pressed && { opacity: 0.6 }]}>
      <Ionicons name={icon} size={17} color={colors.greenDark} />
      <Text style={styles.linkLabel}>{label}</Text>
      {meta ? <Text style={styles.linkMeta}>{meta}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
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
    alignItems: 'center',
    paddingTop: spacing.xl + 30,
    paddingBottom: spacing.xl - 4,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },
  cameraBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.greenDeep,
  },
  changePhoto: {
    marginTop: spacing.sm,
    color: colors.lime,
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  sub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 3,
  },
  body: {
    padding: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: -spacing.xl,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.greenDark,
  },
  statLabel: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 11,
  },
  detailBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 13,
  },
  linkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  linkMeta: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.green,
  },
  aboutText: {
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#EFC9D4',
  },
  logoutText: {
    color: colors.error,
    fontWeight: '800',
    fontSize: 15,
  },
});
