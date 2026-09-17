'use client';

import { useEffect, useRef } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster }       from 'react-hot-toast';
import { onAuthChange }  from '@/lib/firebase-auth';
import { getUserById }   from '@/lib/firestore';
import {
  listenCompany, listenUsers, listenDepartments,
  listenProjects, listenTasks, listenMeetings,
  listenChannels, listenFiles, listenAnnouncements,
  listenNotifications, listenCalendarEvents,
  listenVirtualRooms, listenActivityLog,
} from '@/lib/firestore';
import { useAppStore } from '@/store/app-store';
import type { Unsubscribe } from 'firebase/firestore';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? 'company-1';

// ─────────────────────────────────────────────────────────────
// FirebaseProvider — sets up auth state + Firestore listeners
// ─────────────────────────────────────────────────────────────
function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const {
    setCurrentUser, setCompany,
    setUsers, setDepartments, setProjects, setTasks,
    setMeetings, setChannels, setFiles,
    setAnnouncements, setNotifications, setCalendarEvents,
    setVirtualRooms, setActivityLog, setMessages,
    setLoading, setInitialized,
  } = useAppStore();

  const unsubs = useRef<Unsubscribe[]>([]);

  // ── Clear ALL old store keys from previous versions ──────────
  useEffect(() => {
    const OLD_KEYS = ['virtoffice-store', 'nakoffice-store', 'nakoffice-store-v1', 'nakoffice-store-v2'];
    OLD_KEYS.forEach(key => {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    });
  }, []);

  useEffect(() => {
    // ── 1. Firebase Auth state ─────────────────
    const unsubAuth = onAuthChange(async (fbUser) => {
      if (!fbUser) {
        // Signed out — clear everything
        setCurrentUser(null);
        setLoading(false);
        setInitialized(true);
        unsubs.current.forEach(fn => fn());
        unsubs.current = [];
        return;
      }

      // ── 2. Fetch the app user document ────────
      try {
        const appUser = await getUserById(fbUser.uid);
        if (appUser) {
          setCurrentUser(appUser);
        } else {
          // Firebase Auth user exists but no Firestore doc.
          // This can happen when the user was created via Firebase Console
          // or the Firestore rules blocked the write during signup.
          // Create a minimal doc so the app can work.
          const { setUser } = await import('@/lib/firestore');
          const fallbackName = fbUser.displayName || (fbUser.email ?? '').split('@')[0].replace(/[._]/g, ' ');
          const newUser = {
            id:           fbUser.uid,
            email:        fbUser.email ?? '',
            name:         fallbackName,
            designation:  'Team Member',
            status:       'available' as const,
            role:         'employee' as const,
            companyId:    COMPANY_ID,
            joinedAt:     new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            isOnline:     true,
            position:     { x: 320, y: 180 },
          };
          await setUser(newUser);
          setCurrentUser(newUser);
        }

        // ── 3. Start all real-time listeners ──────
        unsubs.current.forEach(fn => fn());
        unsubs.current = [];

        unsubs.current.push(
          listenCompany(COMPANY_ID, (c) => setCompany(c)),
          listenUsers(COMPANY_ID, (u) => setUsers(u)),
          listenDepartments(COMPANY_ID, (d) => setDepartments(d)),
          listenProjects(COMPANY_ID, (p) => setProjects(p)),
          listenTasks(COMPANY_ID, (t) => setTasks(t)),
          listenMeetings(COMPANY_ID, (m) => setMeetings(m)),
          listenChannels(COMPANY_ID, (c) => setChannels(c)),
          listenFiles(COMPANY_ID, (f) => setFiles(f)),
          listenAnnouncements(COMPANY_ID, (a) => setAnnouncements(a)),
          listenCalendarEvents(COMPANY_ID, (e) => setCalendarEvents(e)),
          listenVirtualRooms(COMPANY_ID, (r) => setVirtualRooms(r)),
          listenActivityLog(COMPANY_ID, (l) => setActivityLog(l)),
        );

        // Notifications are per-user
        if (fbUser.uid) {
          unsubs.current.push(
            listenNotifications(fbUser.uid, (n) => setNotifications(n))
          );
        }

        setLoading(false);
        setInitialized(true);
      } catch (err) {
        console.error('Firebase init error:', err);
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      unsubAuth();
      unsubs.current.forEach(fn => fn());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}

// ─────────────────────────────────────────────────────────────
// Root Providers
// ─────────────────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <FirebaseProvider>
        {children}
      </FirebaseProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontSize: '14px' },
        }}
      />
    </ThemeProvider>
  );
}
