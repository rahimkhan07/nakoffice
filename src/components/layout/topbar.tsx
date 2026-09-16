'use client';

import { Search, Bell, Moon, Sun, ChevronDown, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { usePathname } from 'next/navigation';
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
};

export function TopBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const {
    currentUser, company, setSearchOpen, notifications, setNotifPanelOpen, notifPanelOpen,
  } = useAppStore();

  const unread = notifications.filter(n => !n.read).length;

  const title = Object.entries(routeTitles).find(([k]) => pathname.startsWith(k))?.[1] ?? 'VirtOffice';

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center px-4 gap-4 shrink-0">
      {/* Page title */}
      <h1 className="text-base font-semibold text-[var(--text-primary)] mr-auto">{title}</h1>

      {/* Search trigger */}
      <button
        onClick={() => setSearchOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 h-9 rounded-lg text-sm',
          'bg-[var(--bg-secondary)] border border-[var(--border)]',
          'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
          'transition-colors w-48 lg:w-64'
        )}
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Search anything…</span>
        <kbd className="text-[10px] font-mono bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded border border-[var(--border)] hidden lg:inline">⌘K</kbd>
      </button>

      {/* Notifications */}
      <button
        onClick={() => setNotifPanelOpen(!notifPanelOpen)}
        className="relative p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label={`${unread} unread notifications`}
      >
        <Bell className="w-4.5 h-4.5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
          ? <Sun className="w-4 h-4" />
          : <Moon className="w-4 h-4" />
        }
      </button>

      {/* Company switcher */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-[var(--text-primary)] hidden md:block">{company.name}</span>
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)] hidden md:block" />
      </button>

      {/* User avatar */}
      {currentUser && (
        <Link href="/profile" className="shrink-0">
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
