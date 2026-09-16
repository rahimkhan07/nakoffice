import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { NotificationPanel } from '@/components/notifications/notification-panel';
import { GlobalSearch } from '@/components/search/global-search';
import { AIAssistant } from '@/components/ai-assistant/ai-assistant';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      {/* Overlays */}
      <NotificationPanel />
      <GlobalSearch />
      <AIAssistant />
    </div>
  );
}
