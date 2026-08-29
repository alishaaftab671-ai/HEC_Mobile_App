import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ServiceId } from './models';

export type { ServiceId };

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Otp: { target: string; mode: 'signup' | 'attestation' };
  Main: NavigatorScreenParams<TabParamList>;
  AttestationIntro: undefined;
  AttestationAuthGate: undefined;
  AttestationProof: undefined;
  AttestationFlow: undefined;
  SubmissionSuccess: { applicationId: string };
  ServiceInfo: { serviceId: ServiceId };
  ApplicationStatusDetail: { applicationId: string };
  Notifications: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  ApplicationsTab: undefined;
  HelpTab: undefined;
  ProfileTab: undefined;
};
