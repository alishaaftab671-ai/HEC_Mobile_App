import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AppNotification,
  Application,
  AttestationForm,
  Session,
  User,
} from '../types/models';

const KEYS = {
  session: 'hec.session',
  applications: 'hec.applications',
  notifications: 'hec.notifications',
  draft: 'hec.attestationDraft',
  accounts: 'hec.accounts',
  pending: 'hec.pendingAccount',
  profilePhoto: 'hec.profilePhoto',
} as const;

export interface Account extends User {
  password: string;
}

export async function loadAccounts(): Promise<Account[]> {
  return (await getJson<Account[]>(KEYS.accounts)) ?? [];
}

export function saveAccounts(accounts: Account[]): Promise<void> {
  return setJson(KEYS.accounts, accounts);
}

export function savePendingAccount(user: User): Promise<void> {
  return setJson(KEYS.pending, user);
}

export async function takePendingAccount(): Promise<User | null> {
  const user = await getJson<User>(KEYS.pending);
  await AsyncStorage.removeItem(KEYS.pending).catch(() => undefined);
  return user;
}

async function getJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function setJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently in demo mode
  }
}

export async function loadSession(): Promise<Session | null> {
  return getJson<Session>(KEYS.session);
}

export function saveSession(session: Session): Promise<void> {
  return setJson(KEYS.session, session);
}

export function clearSession(): Promise<void> {
  return AsyncStorage.removeItem(KEYS.session).catch(() => undefined);
}

export async function loadApplications(): Promise<Application[]> {
  return (await getJson<Application[]>(KEYS.applications)) ?? [];
}

export function saveApplications(apps: Application[]): Promise<void> {
  return setJson(KEYS.applications, apps);
}

export async function loadNotifications(): Promise<AppNotification[]> {
  return (await getJson<AppNotification[]>(KEYS.notifications)) ?? [];
}

export function saveNotifications(items: AppNotification[]): Promise<void> {
  return setJson(KEYS.notifications, items);
}

export async function loadDraft(): Promise<AttestationForm | null> {
  return getJson<AttestationForm>(KEYS.draft);
}

export function saveDraft(form: AttestationForm): Promise<void> {
  return setJson(KEYS.draft, form);
}

export function clearDraft(): Promise<void> {
  return AsyncStorage.removeItem(KEYS.draft).catch(() => undefined);
}

export function loadProfilePhoto(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.profilePhoto).catch(() => null);
}

export function saveProfilePhoto(uri: string): Promise<void> {
  return AsyncStorage.setItem(KEYS.profilePhoto, uri).catch(() => undefined);
}
