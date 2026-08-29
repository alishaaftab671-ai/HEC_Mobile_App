import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { seedApplications, seedNotifications } from '../data/defaults';
import type {
  AppNotification,
  Application,
  AttestationForm,
  Session,
  TimelineEvent,
  User,
} from '../types/models';
import { uid, generateReferenceId } from '../utils/id';
import * as storage from '../services/storage';

interface AppContextValue {
  ready: boolean;
  session: Session | null;
  applications: Application[];
  notifications: AppNotification[];
  unreadCount: number;
  draft: AttestationForm | null;

  login: (user: User) => Promise<void>;
  signup: (user: User) => Promise<void>;
  logout: () => Promise<void>;

  startDraft: () => void;
  updateDraft: (partial: Partial<AttestationForm>) => void;
  discardDraft: () => Promise<void>;

  submitApplication: (form: AttestationForm) => Promise<Application>;
  advanceStatuses: () => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function buildTimeline(submittedAt: string): TimelineEvent[] {
  const stages = ['Submitted', 'Verification', 'Under Review', 'Processing', 'Completed'];
  return stages.map((label, i) => ({
    label,
    date: i === 0 ? submittedAt : null,
    state: i === 0 ? 'current' : 'upcoming',
  }));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [draft, setDraft] = useState<AttestationForm | null>(null);

  useEffect(() => {
    (async () => {
      const [storedSession, storedApps, storedNotifs, storedDraft] = await Promise.all([
        storage.loadSession(),
        storage.loadApplications(),
        storage.loadNotifications(),
        storage.loadDraft(),
      ]);

      if (!storedApps.length) {
        const demoUser: User = {
          id: 'demo',
          fullName: 'Ayesha Khan',
          cnic: '35202-1234567-1',
          email: 'ayesha.khan@example.com',
          phone: '0300-1234567',
        };
        const seeded = seedApplications(demoUser.id, demoUser.fullName, demoUser.cnic);
        await storage.saveApplications(seeded);
        setApplications(seeded);
      } else {
        setApplications(storedApps);
      }

      if (!storedNotifs.length) {
        const seeded = seedNotifications();
        await storage.saveNotifications(seeded);
        setNotifications(seeded);
      } else {
        setNotifications(storedNotifs);
      }

      if (storedDraft) setDraft(storedDraft);
      if (storedSession) setSession(storedSession);

      setReady(true);
    })();
  }, []);

  const persistSession = useCallback(async (s: Session) => {
    setSession(s);
    await storage.saveSession(s);
  }, []);

  const login = useCallback(
    async (user: User) => {
      await persistSession({ user, loggedInAt: new Date().toISOString() });
    },
    [persistSession],
  );

  const signup = useCallback(
    async (user: User) => {
      await persistSession({ user, loggedInAt: new Date().toISOString() });
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    setSession(null);
    setDraft(null);
    await storage.clearSession();
    await storage.clearDraft();
  }, []);

  const startDraft = useCallback(() => {
    setDraft((prev) => {
      if (prev) return prev;
      const user = session?.user;
      return (
        prev ??
        ({
          personal: { fullName: user?.fullName ?? '', fatherName: '', cnic: user?.cnic ?? '', dob: '', gender: '', nationality: 'Pakistani' },
          contact: { email: user?.email ?? '', phone: user?.phone ?? '', altPhone: '', address: '', province: '', city: '' },
          educationRecords: [],
          degree: {
            degreeTitle: '',
            level: "Bachelor's",
            major: '',
            sessionFrom: '',
            sessionTo: '',
            passingYear: '',
            resultType: 'CGPA',
            cgpa: '',
            obtainedMarks: '',
            totalMarks: '',
            grade: '',
          },
          institution: { universityId: '', universityName: '', campus: '', city: '', country: 'Pakistan', rollNo: '' },
          attestation: { purpose: '', destinationCountry: '', docType: '', numberOfSets: 1, serviceType: 'Normal', delivery: '' },
          documents: [],
          declarationAccepted: false,
          payment: null,
          otpVerified: false,
          currentStep: 0,
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          savedAt: null,
        }) satisfies AttestationForm
      );
    });
  }, [session]);

  const updateDraft = useCallback((partial: Partial<AttestationForm>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next: AttestationForm = { ...prev, ...partial, updatedAt: new Date().toISOString(), savedAt: new Date().toISOString() };
      void storage.saveDraft(next);
      return next;
    });
  }, []);

  const discardDraft = useCallback(async () => {
    setDraft(null);
    await storage.clearDraft();
  }, []);

  const pushNotification = useCallback(async (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    let updated: AppNotification[] = [];
    setNotifications((prev) => {
      updated = [{ ...n, id: uid(), createdAt: new Date().toISOString(), read: false }, ...prev];
      return updated;
    });
    // Persist after state settles; list is small so a full save is fine.
    setTimeout(() => void storage.saveNotifications(updated), 0);
  }, []);

  const submitApplication = useCallback(
    async (form: AttestationForm) => {
      const nowIso = new Date().toISOString();
      const app: Application = {
        id: uid(),
        referenceId: generateReferenceId(),
        userId: session?.user.id ?? 'demo',
        applicantName: form.personal.fullName || session?.user.fullName || 'Applicant',
        cnic: form.personal.cnic || session?.user.cnic || '',
        serviceName:
          form.attestation.serviceType === 'Urgent'
            ? 'Degree Attestation — Urgent'
            : 'Degree Attestation — Normal',
        documentCount: form.documents.length,
        feeTotal: form.payment?.amount ?? 0,
        paymentMethod: form.payment?.method ?? 'Card',
        status: 'Submitted',
        submittedAt: nowIso,
        updatedAt: nowIso,
        timeline: buildTimeline(nowIso),
        documents: form.documents,
      };

      let apps: Application[] = [];
      setApplications((prev) => {
        apps = [app, ...prev];
        return apps;
      });
      setTimeout(() => void storage.saveApplications(apps), 0);

      await storage.clearDraft();
      setDraft(null);

      await pushNotification({
        category: 'application',
        title: 'Application submitted successfully',
        body: `Your application ${app.referenceId} has been received. You will be notified as it progresses.`,
      });

      return app;
    },
    [pushNotification, session],
  );

  /** Demo helper: nudges every non-completed application one stage forward. */
  const advanceStatuses = useCallback(() => {
    let apps: Application[] = [];
    setApplications((prev) => {
      const stages = ['Submitted', 'Verification', 'Under Review', 'Processing', 'Completed'];
      apps = prev.map((app) => {
        const idx = stages.indexOf(app.status);
        if (idx < 0 || idx === stages.length - 1) return app;
        const nextStatus = stages[idx + 1] as Application['status'];
        return {
          ...app,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          timeline: app.timeline.map((t) =>
            t.label === app.status
              ? { ...t, state: 'done' as const }
              : t.label === nextStatus
                ? { ...t, state: 'current' as const, date: new Date().toISOString() }
                : t,
          ),
        };
      });
      return apps;
    });
    setTimeout(() => void storage.saveApplications(apps), 0);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    let updated: AppNotification[] = [];
    setNotifications((prev) => {
      updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      return updated;
    });
    setTimeout(() => void storage.saveNotifications(updated), 0);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    let updated: AppNotification[] = [];
    setNotifications((prev) => {
      updated = prev.map((n) => ({ ...n, read: true }));
      return updated;
    });
    setTimeout(() => void storage.saveNotifications(updated), 0);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      session,
      applications,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      draft,
      login,
      signup,
      logout,
      startDraft,
      updateDraft,
      discardDraft,
      submitApplication,
      advanceStatuses,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      ready,
      session,
      applications,
      notifications,
      draft,
      login,
      signup,
      logout,
      startDraft,
      updateDraft,
      discardDraft,
      submitApplication,
      advanceStatuses,
      markNotificationRead,
      markAllNotificationsRead,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
