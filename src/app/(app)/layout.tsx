'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar }             from '@/components/layout/sidebar';
import { TopBar }              from '@/components/layout/topbar';
import { NotificationPanel }   from '@/components/notifications/notification-panel';
import { GlobalSearch }        from '@/components/search/global-search';
import { AIAssistant }         from '@/components/ai-assistant/ai-assistant';
import { LoadingScreen }       from '@/components/ui/loading-screen';
import { useAppStore }         from '@/store/app-store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, initialized } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, initialized, router]);

  if (!initialized || loading) {
    return <LoadingScreen message="Connecting to your office…" />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen message="Redirecting to sign in…" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <NotificationPanel />
      <GlobalSearch />
      <AIAssistant />
    </div>
  );
}
