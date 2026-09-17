'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, Moon, Sun, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { useAppStore } from '@/store/app-store';
import Link from 'next/link';

const routeTitles: Record<string, string> = {
  '/office':        '🏢 Virtual Office',
  '/dashboard':     '📊 Dashboard',
  '/messages':      '💬 Messages',
  '/tasks':         '✅ My Tasks',
  '/projects':      '📁 Projects',
  '/calendar':      '📅 Calendar',
  '/people':        '👥 People',
  '/files':         '📂 Files',
  '/announcements': '📢 Announcements',
  '/departments':   '🏗️ Departments',
  '/ai':            '🤖 NAK AI',
  '/settings':      '⚙️ Settings',
  '/profile':       '👤 Profile',
  '/admin':         '🔧 Admin Panel',
  '/billing':       '💳 Billing',
  '/help':          '❓ Help & Support',
};

export function TopBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const router   = useRouter();
  const {
    currentUser, company,
    setSearchOpen,
    notifications, notifPanelOpen, setNotifPanelOpen,
  } = useAppStore();

  const unread = notifications.filter(n => !n.read).length;
  const title  = Object.entries(routeTitles)
    .find(([k]) => pathname.startsWith(k))?.[1] ?? 'NAK Digital Office';

  return (
    <header className="h-14 flex items-center px-5 gap-3 shrink-0 z-30"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
      }}>

      {/* Page title */}
      <h1 className="text-sm font-semibold mr-auto truncate" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h1>

      {/* Search trigger */}
      <button
        onClick={() => setSearchOpen(true)}
        className={cn(
          'hidden sm:flex items-center gap-2 px-3 h-8 rounded-lg text-xs',
          'transition-all duration-150 w-44 lg:w-60'
        )}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left">Search in NAK Digital…</span>
        <kbd className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          ⌘K
        </kbd>
      </button>

      {/* Notification bell */}
      <button
        onClick={() => setNotifPanelOpen(!notifPanelOpen)}
        className="relative p-2 rounded-lg transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        aria-label={`${unread} unread notifications`}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
            style={{ backgroundColor: '#ef4444' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-lg transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark'
          ? <Sun  className="w-4 h-4" />
          : <Moon className="w-4 h-4" />
        }
      </button>

      {/* NAK Digital company badge */}
      <button
        onClick={() => router.push('/settings')}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* NAK mark */}
        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
          style={{ background: 'linear-gradient(135deg, #0a2540, #142840)', color: '#d4a017', border: '1px solid rgba(212,160,23,0.35)' }}>
          N
        </div>
        <span className="text-sm font-semibold max-w-[100px] truncate"
          style={{ color: 'var(--text-primary)' }}>
          {company.name || 'NAK Digital'}
        </span>
        <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
      </button>

      {/* User avatar */}
      {currentUser && (
        <Link href="/profile"
          className="shrink-0 rounded-full ring-2 ring-transparent hover:ring-[#d4a017] transition-all"
          style={{ outline: 'none' }}>
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
