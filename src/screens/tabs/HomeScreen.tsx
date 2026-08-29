import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import StatusBadge from '../../components/StatusBadge';
import HECLogo from '../../components/HECLogo';
import LoadingBar from '../../components/LoadingBar';
import { Breathe, CardIn, TapCard } from '../../components/Motion';
import { useApp } from '../../context/AppContext';
import { useSidebar } from '../../context/SidebarContext';
import { ANNOUNCEMENTS } from '../../data/mockData';
import { colors, gradients, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList, ServiceId, TabParamList } from '../../types/navigation';
import { formatDate, timeAgo } from '../../utils/formatters';

type Nav = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>['navigation'];

/** Number that counts up from 0 to its target on mount. */
function CountUp({ value, delay = 250, style }: { value: number; delay?: number; style?: StyleProp<TextStyle> }) {
  const [display, setDisplay] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(value, { duration: 850, easing: Easing.out(Easing.cubic) }));
  }, [value, delay, progress]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (current, previous) => {
      if (current !== previous) runOnJS(setDisplay)(current);
    },
  );

  return <Text style={style}>{display}</Text>;
}

const QUICK_LINKS: {
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  cardBg: string;
  tint: string;
  go: 'ApplicationsTab' | 'Notifications' | 'HelpTab' | 'ProfileTab';
}[] = [
  { label: 'My Applications', sub: 'Track every case', icon: 'document-text-outline', bg: '#EAEFFA', cardBg: '#F3F5FC', tint: colors.navy, go: 'ApplicationsTab' },
  { label: 'Notifications', sub: 'Latest updates', icon: 'notifications-outline', bg: colors.errorBg, cardBg: '#FFF4F6', tint: colors.error, go: 'Notifications' },
  { label: 'FAQs & Help', sub: 'Guides and answers', icon: 'help-circle-outline', bg: colors.mantisSoft, cardBg: '#F0FBF6', tint: colors.greenDark, go: 'HelpTab' },
  { label: 'My Profile', sub: 'Account settings', icon: 'person-outline', bg: colors.limeSoft, cardBg: '#FFFBEF', tint: colors.warning, go: 'ProfileTab' },
];

const SERVICE_CARDS: {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
  iconColor: string;
  action: 'auth' | 'renew' | 'track' | 'proof';
}[] = [
  {
    title: 'Degree Attestation',
    body: 'Apply online, upload documents and pay securely.',
    icon: 'document-lock-outline',
    colors: [...gradients.gold],
    iconColor: colors.navy,
    action: 'auth',
  },
  {
    title: 'Attestation Renewal',
    body: 'Renew an existing attestation with a guided application.',
    icon: 'refresh-circle-outline',
    colors: ['#EAF7F1', '#CDEDDD'],
    iconColor: colors.greenDark,
    action: 'renew',
  },
  {
    title: 'Track Progress',
    body: 'Check your application status and verification timeline.',
    icon: 'pulse-outline',
    colors: ['#EAF0FB', '#D5E0F7'],
    iconColor: colors.navy,
    action: 'track',
  },
  {
    title: 'Share Attestation Proof',
    body: 'Open your digital certificate and share its proof.',
    icon: 'share-social-outline',
    colors: ['#FFF5D8', '#F8E6A8'],
    iconColor: colors.warning,
    action: 'proof',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { session, applications, unreadCount, draft, discardDraft } = useApp();
  const { openSidebar } = useSidebar();
  const [refreshing, setRefreshing] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [loadingService, setLoadingService] = useState(false);

  /* Exact 2-column grid math so Android and iOS render identical cells. */
  const contentW = screenW - spacing.lg * 2;
  const colW = Math.floor((contentW - spacing.sm) / 2);

  const scrollY = useSharedValue(0);
  const headerH = useSharedValue(0);
  const headerTranslate = useAnimatedStyle(() => ({
    transform: [{ translateY: -Math.min(Math.max(scrollY.value, 0), headerH.value) }],
  }));
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const total = applications.length;
  const completed = applications.filter((a) => a.status === 'Completed').length;
  const active = total - completed;
  const latest = applications[0];
  const announcement = ANNOUNCEMENTS[0];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  const openService = (serviceId: ServiceId) => navigation.navigate('ServiceInfo', { serviceId });

  const openServiceCard = (action: (typeof SERVICE_CARDS)[number]['action']) => {
    setLoadingService(true);
    setTimeout(() => {
      setLoadingService(false);
      if (action === 'auth') navigation.navigate('AttestationAuthGate');
      if (action === 'renew') navigation.navigate('AttestationIntro');
      if (action === 'track') navigation.navigate('ApplicationsTab');
      if (action === 'proof') navigation.navigate('AttestationProof');
    }, 280);
  };

  return (
    <View style={styles.root}>
      <LoadingBar visible={loadingService} height={3} />
      <Animated.View
        style={[styles.headerWrap, headerTranslate]}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          headerH.value = h;
          setHeaderHeight(h);
        }}
      >
        <LinearGradient
          style={[styles.header, { paddingTop: insets.top + spacing.xs }]}
          colors={gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Pressable style={styles.menuBtn} onPress={openSidebar} hitSlop={8}>
            <Ionicons name="menu" size={24} color={colors.surface} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.brandChip}>
              <HECLogo size={26} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.appTitle}>HEC eServices</Text>
              <Text style={styles.appSub}>Higher Education Commission · Pakistan</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.bellBtn, pressed && { backgroundColor: 'rgba(255,255,255,0.32)' }]}
            onPress={() => navigation.navigate('Notifications')}
            hitSlop={8}
          >
            <Ionicons name="notifications" size={20} color="#FFFFFF" />
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.body, headerHeight > 0 && { paddingTop: headerHeight + spacing.xs }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
      >
        {/* Stats */}
        <CardIn delay={60} style={[shadow.card, { marginTop: spacing.md }]}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#EAF7F1' }]}>
              <View style={[styles.statIconChip, { backgroundColor: colors.green }]}>
                <Ionicons name="documents" size={19} color="#FFFFFF" />
              </View>
              <CountUp value={total} style={[styles.statValue, { color: colors.greenDark }]} />
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.warningBg }]}>
              <View style={[styles.statIconChip, { backgroundColor: colors.warning }]}>
                <Ionicons name="hourglass" size={19} color="#FFFFFF" />
              </View>
              <CountUp value={active} delay={380} style={[styles.statValue, { color: colors.warning }]} />
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.greenSoft }]}>
              <View style={[styles.statIconChip, { backgroundColor: colors.greenDark }]}>
                <Ionicons name="checkmark-done" size={19} color="#FFFFFF" />
              </View>
              <CountUp value={completed} delay={520} style={[styles.statValue, { color: colors.greenDark }]} />
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </CardIn>

        {/* Primary HEC services */}
        <SectionHeading title="Start a Service" caption="Choose what you need today" delay={100} />
        <View style={styles.serviceGrid}>
          {SERVICE_CARDS.map((card, i) => (
            <TapCard
              key={card.title}
              onPress={() => openServiceCard(card.action)}
              style={[styles.serviceCardTap, { width: colW }, shadow.card]}
            >
              <LinearGradient colors={card.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.serviceCard}>
                <View style={[styles.serviceCardIcon, { backgroundColor: 'rgba(255,255,255,0.72)' }]}>
                  <Ionicons name={card.icon} size={23} color={card.iconColor} />
                </View>
                <View style={styles.flexSpacer} />
                <Text style={[styles.serviceCardTitle, { color: card.iconColor }]}>{card.title}</Text>
                <Text style={styles.serviceCardBody}>{card.body}</Text>
                <View style={styles.serviceCardArrow}>
                  <Text style={[styles.serviceCardAction, { color: card.iconColor }]}>Open</Text>
                  <Ionicons name="arrow-forward" size={15} color={card.iconColor} />
                </View>
              </LinearGradient>
            </TapCard>
          ))}
        </View>

        {draft ? (
          <CardIn delay={60} style={[styles.resumeBanner, { marginTop: spacing.md }]}>
            <View style={styles.resumeIconChip}>
              <Ionicons name="create-outline" size={17} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeTitle}>Unfinished application</Text>
              <Text style={styles.resumeBody}>
                Saved {draft.savedAt ? timeAgo(draft.savedAt) : 'recently'} · step {draft.currentStep + 1}
              </Text>
            </View>
            <Pressable onPress={() => navigation.navigate('AttestationFlow')} hitSlop={6}>
              <Text style={styles.resumeLink}>View / Edit</Text>
            </Pressable>
            <Pressable onPress={() => void discardDraft()} hitSlop={10} style={{ marginLeft: spacing.sm }}>
              <Ionicons name="trash-outline" size={17} color={colors.error} />
            </Pressable>
          </CardIn>
        ) : null}

        {latest ? (
          <CardIn delay={90} style={{ marginTop: spacing.md }}>
            <View style={[styles.latestCard, shadow.card]}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardHeading}>Latest application</Text>
                <StatusBadge status={latest.status} />
              </View>
              <Text style={styles.latestRef}>{latest.referenceId}</Text>
              <Text style={styles.latestMeta}>
                {latest.serviceName} · {formatDate(latest.submittedAt)}
              </Text>
              <Pressable onPress={() => navigation.navigate('ApplicationStatusDetail', { applicationId: latest.id })}>
                <Text style={styles.viewLink}>View status & timeline →</Text>
              </Pressable>
            </View>
          </CardIn>
        ) : null}

        {/* Quick access grid */}
        <SectionHeading title="Quick Access" caption="Everything one tap away" delay={140} />
        <View style={styles.gridWrap}>
          {QUICK_LINKS.map((q, i) => (
            <TapCard
              key={q.go}
              onPress={() => navigation.navigate(q.go)}
              style={[styles.gridCell, { width: colW }, shadow.card]}
            >
              <CardIn delay={160 + i * 55} style={[styles.gridCellInner, { backgroundColor: q.cardBg }]}>
                <View style={[styles.quickIconChip, { backgroundColor: q.bg }]}>
                  <Ionicons name={q.icon} size={21} color={q.tint} />
                  {q.go === 'Notifications' && unreadCount > 0 ? (
                    <View style={styles.dot} />
                  ) : null}
                </View>
                <View style={styles.flexSpacer} />
                <Text style={styles.quickTitle}>{q.label}</Text>
                <Text style={styles.quickSub}>{q.sub}</Text>
              </CardIn>
            </TapCard>
          ))}
        </View>

        {/* eServices — highlighted section */}
        <CardIn delay={220}>
          <View style={styles.eservicesHead}>
            <LinearGradient
              style={styles.eservicesBanner}
              colors={['#05382A', '#0A7A50']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Breathe duration={2600} style={styles.eservicesSpark}>
                <Ionicons name="sparkles" size={15} color={colors.lime} />
              </Breathe>
              <View style={{ flex: 1 }}>
                <Text style={styles.eservicesTitle}>eServices</Text>
                <Text style={styles.eservicesSub}>Official HEC services · choose & apply</Text>
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>3</Text>
              </View>
            </LinearGradient>
          </View>
        </CardIn>

        <View style={[styles.gridWrap, { marginTop: spacing.sm }]}>
          {/* Equivalence — navy accent */}
          <TapCard onPress={() => openService('equivalence')} style={[styles.gridCell, { width: colW }, shadow.card]}>
            <CardIn delay={280} style={[styles.serviceCell, { backgroundColor: '#EEF2FB', borderColor: '#D7E0F5' }]}>
              <LinearGradient style={styles.serviceIconLg} colors={['#1A3572', '#44598F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="git-compare-outline" size={22} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.serviceTitle}>Equivalence Certificate</Text>
              <Text style={styles.serviceBody} numberOfLines={2}>
                Foreign qualifications compared with Pakistani equivalents.
              </Text>
              <View style={styles.flexSpacer} />
              <View style={[styles.exploreRow, { borderTopColor: '#D7E0F5' }]}>
                <Text style={[styles.exploreText, { color: colors.navy }]}>Explore</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.navy} />
              </View>
            </CardIn>
          </TapCard>

          {/* Scholarships — gold accent */}
          <TapCard onPress={() => openService('scholarships')} style={[styles.gridCell, { width: colW }, shadow.card]}>
            <CardIn delay={340} style={[styles.serviceCell, { backgroundColor: colors.limeSoft, borderColor: '#F2E3AC' }]}>
              <LinearGradient style={styles.serviceIconLg} colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="ribbon-outline" size={22} color={colors.navy} />
              </LinearGradient>
              <Text style={styles.serviceTitle}>Scholarships</Text>
              <Text style={styles.serviceBody} numberOfLines={2}>
                Open HEC scholarship programmes and deadlines.
              </Text>
              <View style={styles.flexSpacer} />
              <View style={[styles.exploreRow, { borderTopColor: '#F2E3AC' }]}>
                <Text style={[styles.exploreText, { color: colors.warning }]}>Explore</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.warning} />
              </View>
            </CardIn>
          </TapCard>
        </View>

        {/* Other Services — full-width green banner */}
        <TapCard onPress={() => openService('other-services')} style={[styles.tapWrap, shadow.raised, { marginTop: spacing.sm }]}>
          <CardIn delay={400}>
            <LinearGradient style={styles.otherServices} colors={gradients.green} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.osIconChip}>
                <Ionicons name="grid-outline" size={22} color={colors.greenDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.osTitle}>Other Services</Text>
                <Text style={styles.osBody}>NOCs, verification letters and more.</Text>
              </View>
              <Ionicons name="chevron-forward-circle" size={28} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          </CardIn>
        </TapCard>

        {/* Announcements */}
        <SectionHeading title="Announcements" caption="Latest updates from HEC" delay={440} />
        <CardIn delay={480}>
          <View style={[styles.announcement, shadow.card]}>
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>{announcement.tag}</Text>
            </View>
            <Text style={styles.annTitle}>{announcement.title}</Text>
            <Text style={styles.annSnippet}>{announcement.snippet}</Text>
            <View style={styles.annFooter}>
              <Ionicons name="calendar-clear-outline" size={12} color={colors.textMuted} />
              <Text style={styles.annDate}>{formatDate(announcement.date)}</Text>
            </View>
          </View>
        </CardIn>
        <Text style={styles.moreInHelp}>More announcements and FAQs under the Help tab.</Text>

        <View style={{ height: spacing.xxl }} />
      </Animated.ScrollView>
    </View>
  );
}

function SectionHeading({ title, caption, delay = 0 }: { title: string; caption?: string; delay?: number }) {
  return (
    <CardIn delay={delay}>
      <View style={styles.sectionHeadRow}>
        <View style={styles.sectionBar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
        </View>
      </View>
    </CardIn>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm - 2,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  menuBtn: {
    position: 'absolute',
    left: spacing.lg,
    bottom: spacing.sm + 2,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandChip: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#032015',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 17.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    transform: [{ translateY: -4 }],
  },
  headerCopy: {
    alignItems: 'flex-start',
  },
  appSub: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  bellBtn: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.sm + 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -3,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.greenDeep,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  body: {
    padding: spacing.lg,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minHeight: 118,
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  statIconChip: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  /* Hero attestation */
  tapWrap: {
    borderRadius: radius.md,
  },
  attestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  attestIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE9A0',
  },
  attestFlagRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  flagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(10,30,82,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  flagPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.navy,
    letterSpacing: 0.8,
  },
  attestTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: colors.navy,
  },
  attestBody: {
    fontSize: 12,
    color: '#33475F',
    marginTop: 2,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  serviceCardTap: {
    borderRadius: radius.lg,
  },
  serviceCard: {
    height: 186,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  serviceCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  serviceCardBody: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSecondary,
    marginTop: 3,
  },
  serviceCardArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(10,30,82,0.14)',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  serviceCardAction: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Draft resume banner */
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: '#EBD9AE',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  resumeIconChip: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6E3B8',
  },
  resumeTitle: {
    fontWeight: '800',
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  resumeBody: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  resumeLink: {
    color: colors.warning,
    fontWeight: '900',
    fontSize: 13,
  },

  /* Latest application */
  latestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  latestRef: {
    marginTop: spacing.sm,
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: 0.4,
  },
  latestMeta: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewLink: {
    marginTop: spacing.sm,
    color: colors.green,
    fontSize: 13,
    fontWeight: '800',
  },

  /* Section headings */
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionBar: {
    width: 4,
    height: 30,
    borderRadius: 2,
    backgroundColor: colors.green,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  sectionCaption: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },

  /* Grids */
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridCell: {
    borderRadius: radius.md,
  },
  gridCellInner: {
    height: 118,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  flexSpacer: {
    flexGrow: 1,
    minHeight: 2,
  },
  quickIconChip: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  quickSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: -4,
  },

  /* eServices highlight */
  eservicesHead: {
    marginTop: spacing.xl,
  },
  eservicesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  eservicesSpark: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  eservicesTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  eservicesSub: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  countPill: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countPillText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: colors.greenDeep,
  },
  serviceCell: {
    height: 204,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: 8,
  },
  serviceIconLg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A1E52',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  serviceTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 17,
    minHeight: 34,
  },
  serviceBody: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    minHeight: 30,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  exploreText: {
    fontSize: 11.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  /* Other services banner */
  otherServices: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  osIconChip: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  osTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  osBody: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 2,
  },

  /* Announcements */
  announcement: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.greenSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: colors.greenDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  annTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  annSnippet: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 3,
  },
  annFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  annDate: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  moreInHelp: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
