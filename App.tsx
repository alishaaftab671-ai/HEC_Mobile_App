import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { AppProvider, useApp } from './src/context/AppContext';
import MainTabs from './src/navigation/MainTabs';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import OtpScreen from './src/screens/auth/OtpScreen';
import AttestationIntroScreen from './src/screens/attestation/AttestationIntroScreen';
import AttestationAuthGateScreen from './src/screens/attestation/AttestationAuthGateScreen';
import AttestationProofScreen from './src/screens/attestation/AttestationProofScreen';
import AttestationFlowScreen from './src/screens/attestation/AttestationFlowScreen';
import SubmissionSuccessScreen from './src/screens/attestation/SubmissionSuccessScreen';
import ApplicationStatusDetailScreen from './src/screens/applications/ApplicationStatusDetailScreen';
import NotificationsScreen from './src/screens/notifications/NotificationsScreen';
import ServiceInfoScreen from './src/screens/services/ServiceInfoScreen';
import HECLogo from './src/components/HECLogo';
import LoadingBar from './src/components/LoadingBar';
import { colors, gradients } from './src/theme';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AUTH_SCREENS = (
  <>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="Otp" component={OtpScreen} />
  </>
);

const APP_SCREENS = (
  <>
    <Stack.Screen name="Main" component={MainTabs} />
    <Stack.Screen
      name="AttestationIntro"
      component={AttestationIntroScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen name="AttestationAuthGate" component={AttestationAuthGateScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="AttestationProof" component={AttestationProofScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen
      name="AttestationFlow"
      component={AttestationFlowScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="SubmissionSuccess"
      component={SubmissionSuccessScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen name="ApplicationStatusDetail" component={ApplicationStatusDetailScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="ServiceInfo" component={ServiceInfoScreen} />
    <Stack.Screen name="Otp" component={OtpScreen} />
  </>
);

function RootNavigator() {
  const { session } = useApp();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? APP_SCREENS : AUTH_SCREENS}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function Gate() {
  const { ready } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!ready) return;

    const timeout = setTimeout(() => setShowSplash(false), 900);
    return () => clearTimeout(timeout);
  }, [ready]);

  if (showSplash) {
    return (
      <LinearGradient colors={gradients.header} style={styles.splash}>
        <StatusBar style="light" />
        <View style={styles.logoBadge}>
          <HECLogo size={94} />
        </View>
        <Text style={styles.appTitle}>HEC eServices</Text>
        <Text style={styles.tagline}>Higher Education Commission · Pakistan</Text>
        <View style={styles.loaderArea}>
          <LoadingBar height={4} color1={colors.lime} color2={colors.mantis} />
          <Text style={styles.loadingText}>Loading your secure workspace...</Text>
        </View>
      </LinearGradient>
    );
  }
  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Gate />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoBadge: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 42,
    backgroundColor: colors.surface,
    shadowColor: '#001B12',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  appTitle: {
    marginTop: 28,
    color: colors.surface,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  tagline: {
    marginTop: 7,
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  loaderArea: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 54,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
  },
});
