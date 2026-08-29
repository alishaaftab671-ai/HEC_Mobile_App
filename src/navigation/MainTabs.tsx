import { useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { SidebarContext } from '../context/SidebarContext';
import { useApp } from '../context/AppContext';
import { colors, radius, shadow, spacing } from '../theme';
import type { RootStackParamList, TabParamList } from '../types/navigation';
import HomeScreen from '../screens/tabs/HomeScreen';
import ApplicationsScreen from '../screens/tabs/ApplicationsScreen';
import HelpScreen from '../screens/tabs/HelpScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  HomeTab: ['home', 'home-outline'],
  ApplicationsTab: ['document-text', 'document-text-outline'],
  HelpTab: ['help-circle', 'help-circle-outline'],
  ProfileTab: ['person', 'person-outline'],
};

export default function MainTabs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session, unreadCount } = useApp();
  const user = session?.user;

  const closeSidebar = () => setSidebarOpen(false);
  const openTab = (screen: keyof TabParamList) => {
    closeSidebar();
    navigation.navigate('Main', { screen });
  };

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <View style={styles.root}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.green,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              height: 62,
              paddingBottom: 7,
              paddingTop: 5,
            },
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={size - 1} color={color} />
            ),
          })}
        >
          <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
          <Tab.Screen name="ApplicationsTab" component={ApplicationsScreen} options={{ title: 'My Applications' }} />
          <Tab.Screen name="HelpTab" component={HelpScreen} options={{ title: 'Help' }} />
          <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>

        <Modal visible={sidebarOpen} transparent animationType="fade" onRequestClose={closeSidebar}>
          <View style={styles.modalRoot}>
            <View style={[styles.sidebar, darkMode && styles.sidebarDark]}>
              <View style={styles.sidebarHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user?.fullName?.slice(0, 1).toUpperCase() ?? 'H'}</Text>
                </View>
                <View style={styles.userCopy}>
                  <Text style={styles.userName}>{user?.fullName ?? 'HEC User'}</Text>
                  <Text style={styles.userSub}>HEC eServices</Text>
                </View>
                <Pressable onPress={closeSidebar} hitSlop={10}>
                  <Ionicons name="close" size={24} color={colors.surface} />
                </Pressable>
              </View>

              <Text style={[styles.sectionLabel, darkMode && styles.lightText]}>Account</Text>
              <MenuItem icon="person-outline" label="My Profile" onPress={() => openTab('ProfileTab')} darkMode={darkMode} />
              <MenuItem
                icon="notifications-outline"
                label="Notifications"
                badge={unreadCount}
                onPress={() => {
                  closeSidebar();
                  navigation.navigate('Notifications');
                }}
                darkMode={darkMode}
              />

              <Text style={[styles.sectionLabel, darkMode && styles.lightText]}>Preferences</Text>
              <MenuItem
                icon={darkMode ? 'sunny-outline' : 'moon-outline'}
                label={darkMode ? 'Light theme' : 'Dark theme'}
                trailing={<View style={[styles.switch, darkMode && styles.switchOn]}><View style={[styles.switchKnob, darkMode && styles.switchKnobOn]} /></View>}
                onPress={() => setDarkMode((value) => !value)}
                darkMode={darkMode}
              />
              <MenuItem
                icon="map-outline"
                label="HEC offices map"
                onPress={() => {
                  closeSidebar();
                  Alert.alert('HEC offices map', 'The HEC offices map will be available in a future update.');
                }}
                darkMode={darkMode}
              />
              <MenuItem icon="help-circle-outline" label="Help & FAQs" onPress={() => openTab('HelpTab')} darkMode={darkMode} />
            </View>
            <Pressable style={styles.backdrop} onPress={closeSidebar} />
          </View>
        </Modal>
      </View>
    </SidebarContext.Provider>
  );
}

function MenuItem({
  icon,
  label,
  badge,
  trailing,
  onPress,
  darkMode,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: number;
  trailing?: ReactNode;
  onPress: () => void;
  darkMode: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && (darkMode ? styles.menuPressedDark : styles.menuPressed)]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={21} color={darkMode ? colors.mantis : colors.green} />
      <Text style={[styles.menuLabel, darkMode && styles.lightText]}>{label}</Text>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      {trailing ?? <Ionicons name="chevron-forward" size={17} color={darkMode ? colors.mantis : colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  modalRoot: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sidebar: {
    width: '82%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    paddingTop: 52,
    paddingHorizontal: spacing.lg,
    ...shadow.raised,
  },
  sidebarDark: { backgroundColor: '#172337' },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lime,
  },
  avatarText: { color: colors.navy, fontSize: 20, fontWeight: '800' },
  userCopy: { flex: 1, marginLeft: spacing.md },
  userName: { color: colors.surface, fontSize: 16, fontWeight: '800' },
  userSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 3 },
  sectionLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginTop: spacing.xl, marginBottom: spacing.sm },
  lightText: { color: colors.surface },
  menuItem: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.md },
  menuPressed: { backgroundColor: colors.greenSoft },
  menuPressedDark: { backgroundColor: '#263750' },
  menuLabel: { flex: 1, marginLeft: spacing.md, color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  badge: { minWidth: 22, paddingHorizontal: 6, paddingVertical: 2, marginRight: spacing.sm, textAlign: 'center', borderRadius: 10, backgroundColor: colors.error, color: colors.surface, fontSize: 11, fontWeight: '800' },
  switch: { width: 42, height: 24, padding: 3, justifyContent: 'center', borderRadius: 15, backgroundColor: colors.borderStrong },
  switchOn: { backgroundColor: colors.mantis },
  switchKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.surface },
  switchKnobOn: { alignSelf: 'flex-end' },
});
