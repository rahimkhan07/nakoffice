'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, Moon, Sun, ChevronDown, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { useAppStore } from '@/store/app-store';
import Link from 'next/link';

const routeTitles: Record<string, string> = {
  '/office':        'Virtual Office',
  '/dashboard':     'Dashboard',
  '/messages':      'Messages',
  '/tasks':         'Tasks',
  '/projects':      'Projects',
  '/calendar':      'Calendar',
  '/people':        'People',
  '/files':         'Files',
  '/announcements': 'Announcements',
  '/departments':   'Departments',
  '/ai':            'Office AI',
  '/settings':      'Settings',
  '/profile':       'Profile',
  '/admin':         'Admin Panel',
  '/billing':       'Billing',
  '/help':          'Help & Support',
};

export function TopBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname  = usePathname();
  const router    = useRouter();
  const {
    currentUser, company,
    setSearchOpen,
    notifications, notifPanelOpen, setNotifPanelOpen,
  } = useAppStore();

  const unread = notifications.filter(n => !n.read).length;

  const title = Object.entries(routeTitles)
    .find(([k]) => pathname.startsWith(k))?.[1] ?? 'VirtOffice';

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center px-4 gap-3 shrink-0 z-30">
      {/* Page title */}
      <h1 className="text-sm font-semibold text-[var(--text-primary)] mr-auto truncate">
        {title}
      </h1>

      {/* Search trigger */}
      <button
        onClick={() => setSearchOpen(true)}
        className={cn(
          'hidden sm:flex items-center gap-2 px-3 h-8 rounded-lg text-xs',
          'bg-[var(--bg-secondary)] border border-[var(--border)]',
          'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-blue-300',
          'transition-all duration-150 w-44 lg:w-56'
        )}
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden lg:inline text-[10px] font-mono bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded border border-[var(--border)]">
          ⌘K
        </kbd>
      </button>

      {/* Notification bell */}
      <button
        onClick={() => setNotifPanelOpen(!notifPanelOpen)}
        className="relative p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label={`${unread} unread notifications`}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark'
          ? <Sun  className="w-4 h-4" />
          : <Moon className="w-4 h-4" />
        }
      </button>

      {/* Company switcher */}
      <button
        onClick={() => router.push('/settings')}
        className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
      >
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-[var(--text-primary)] max-w-[100px] truncate">
          {company.name}
        </span>
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
      </button>

      {/* User avatar → profile page */}
      {currentUser && (
        <Link href="/profile" className="shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
          <Avatar
            name={currentUser.name}
            src={currentUser.avatar}
            status={currentUser.status}
            size="sm"
            showStatus
          />
        </Link>
      )}
    </header>
  );
}
