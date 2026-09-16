'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2, LayoutDashboard, MessageSquare, CheckSquare, FolderOpen,
  Calendar, Users, FileText, Bell, Bot, Settings, ChevronLeft,
  ChevronRight, Megaphone, LogOut, HelpCircle, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { useAppStore } from '@/store/app-store';

const navItems = [
  { href: '/office',        icon: Building2,       label: 'Virtual Office',  key: 'office'        },
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',       key: 'dashboard'     },
  { href: '/messages',      icon: MessageSquare,   label: 'Messages',        key: 'messages'      },
  { href: '/tasks',         icon: CheckSquare,     label: 'Tasks',           key: 'tasks'         },
  { href: '/projects',      icon: FolderOpen,      label: 'Projects',        key: 'projects'      },
  { href: '/calendar',      icon: Calendar,        label: 'Calendar',        key: 'calendar'      },
  { href: '/people',        icon: Users,           label: 'People',          key: 'people'        },
  { href: '/files',         icon: FileText,        label: 'Files',           key: 'files'         },
  { href: '/announcements', icon: Megaphone,       label: 'Announcements',   key: 'announcements' },
  { href: '/departments',   icon: Building2,       label: 'Departments',     key: 'departments'   },
  { href: '/ai',            icon: Bot,             label: 'Office AI',       key: 'ai', highlight: true },
];

const bottomItems = [
  { href: '/settings', icon: Settings,   label: 'Settings' },
  { href: '/help',     icon: HelpCircle, label: 'Help'     },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    currentUser, company,
    sidebarOpen, toggleSidebar,
    channels, notifications, logout,
  } = useAppStore();

  const msgUnread   = channels.reduce((s, c) => s + (c.unreadCount ?? 0), 0);
  const notifUnread = notifications.filter(n => !n.read).length;

  const getBadge = (key: string) => {
    if (key === 'messages')      return msgUnread;
    if (key === 'announcements') return notifUnread;
    return 0;
  };

  if (!currentUser) return null;

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen shrink-0',
        'border-r border-white/10 bg-[var(--sidebar-bg)]',
        'transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* ── Logo ─────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-white/10',
          !sidebarOpen && 'justify-center px-0'
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">{company.name}</p>
            <p className="text-blue-300 text-xs truncate">Virtual Office</p>
          </div>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" aria-label="Main navigation">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href);
          const Icon   = item.icon;
          const badge  = getBadge(item.key);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-xl transition-all duration-150 group',
                sidebarOpen ? 'px-3 py-2.5' : 'justify-center py-2.5',
                active
                  ? 'bg-blue-600 text-white'
                  : item.highlight
                    ? 'text-purple-400 hover:text-purple-200 hover:bg-purple-900/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />

              {sidebarOpen && (
                <span className="text-sm font-medium truncate flex-1">{item.label}</span>
              )}

              {/* Badge */}
              {badge > 0 && (
                <span
                  className={cn(
                    'flex items-center justify-center text-[10px] font-bold rounded-full bg-blue-500 text-white',
                    sidebarOpen ? 'ml-auto w-5 h-5 shrink-0' : 'absolute top-1 right-1 w-4 h-4'
                  )}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}

              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom ───────────────────────────────── */}
      <div className="px-2 pb-3 border-t border-white/10 pt-3 space-y-0.5">
        {bottomItems.map(item => {
          const active = pathname.startsWith(item.href);
          const Icon   = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-xl transition-all duration-150 group',
                sidebarOpen ? 'px-3 py-2' : 'justify-center py-2',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
              {!sidebarOpen && (
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* User profile row */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2 mt-2 cursor-pointer',
            'hover:bg-white/10 transition-colors',
            !sidebarOpen && 'justify-center px-0'
          )}
        >
          <Avatar
            name={currentUser.name}
            src={currentUser.avatar}
            status={currentUser.status}
            size="sm"
            showStatus
          />
          {sidebarOpen && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-slate-400 text-xs truncate">{currentUser.designation}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Collapse toggle ───────────────────────── */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-[72px] z-10',
          'w-6 h-6 rounded-full flex items-center justify-center',
          'bg-[var(--bg-elevated)] border border-[var(--border)]',
          'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
          'shadow-sm transition-colors'
        )}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen
          ? <ChevronLeft  className="w-3 h-3" />
          : <ChevronRight className="w-3 h-3" />
        }
      </button>
    </aside>
  );
}
