'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, CheckSquare, FolderOpen,
  Calendar, Users, FileText, Bot, Settings,
  ChevronLeft, ChevronRight, Megaphone, LogOut,
  HelpCircle, Building2, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { useAppStore } from '@/store/app-store';
import { logout as fbLogout } from '@/lib/firebase-auth';

const navItems = [
  { href: '/office',        icon: Building2,       label: 'Virtual Office',  key: 'office'        },
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',       key: 'dashboard'     },
  { href: '/messages',      icon: MessageSquare,   label: 'Messages',        key: 'messages'      },
  { href: '/tasks',         icon: CheckSquare,     label: 'My Tasks',        key: 'tasks'         },
  { href: '/projects',      icon: FolderOpen,      label: 'Projects',        key: 'projects'      },
  { href: '/calendar',      icon: Calendar,        label: 'Calendar',        key: 'calendar'      },
  { href: '/people',        icon: Users,           label: 'People',          key: 'people'        },
  { href: '/departments',   icon: Layers,          label: 'Departments',     key: 'departments'   },
  { href: '/files',         icon: FileText,        label: 'Files',           key: 'files'         },
  { href: '/announcements', icon: Megaphone,       label: 'Announcements',   key: 'announcements' },
  { href: '/ai',            icon: Bot,             label: 'NAK AI',          key: 'ai', highlight: true },
];

const bottomItems = [
  { href: '/admin',    icon: Settings,    label: 'Admin'   },
  { href: '/settings', icon: Settings,    label: 'Settings'},
  { href: '/help',     icon: HelpCircle,  label: 'Help'    },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    currentUser, company,
    sidebarOpen, toggleSidebar,
    channels, notifications, logout,
  } = useAppStore();

  const handleLogout = async () => {
    await fbLogout();
    logout();
  };

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
        'relative flex flex-col h-screen shrink-0 nak-sidebar-gradient',
        'border-r transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-[60px]'
      )}
      style={{ borderColor: 'rgba(212,160,23,0.15)' }}
    >
      {/* ── NAK Digital Logo ─────────────────────── */}
      <div className={cn(
        'flex items-center border-b py-4',
        sidebarOpen ? 'gap-3 px-4' : 'justify-center px-0',
      )}
        style={{ borderColor: 'rgba(212,160,23,0.20)' }}>

        {/* Logo mark */}
        <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0a2540, #142840)', border: '1.5px solid rgba(212,160,23,0.4)' }}>
          <span className="text-sm font-black tracking-tighter leading-none select-none"
            style={{ color: '#d4a017' }}>
            NAK
          </span>
        </div>

        {sidebarOpen && (
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate text-white">
              NAK Digital
            </p>
            <p className="text-xs truncate font-medium"
              style={{ color: '#d4a017' }}>
              Virtual Office
            </p>
          </div>
        )}
      </div>

      {/* ── Gold thin divider ─────────────────────── */}
      <div className="nak-gold-bar opacity-40" />

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
              )}
              style={
                active
                  ? { background: 'linear-gradient(135deg, #1a73e8, #1557c0)', color: '#fff' }
                  : item.highlight
                    ? { color: '#d4a017' }
                    : { color: 'rgba(143,168,200,0.85)' }
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />

              {sidebarOpen && (
                <span className="text-sm font-medium truncate flex-1">{item.label}</span>
              )}

              {/* Badge */}
              {badge > 0 && (
                <span
                  className={cn(
                    'flex items-center justify-center text-[10px] font-bold rounded-full text-white',
                    sidebarOpen ? 'ml-auto w-5 h-5 shrink-0' : 'absolute top-1 right-1 w-4 h-4'
                  )}
                  style={{ backgroundColor: '#d4a017' }}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}

              {/* Hover bg when not active */}
              {!active && (
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: 'rgba(26,115,232,0.10)' }} />
              )}

              {/* Collapsed tooltip */}
              {!sidebarOpen && (
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg text-white"
                  style={{ background: '#0a2540', border: '1px solid rgba(212,160,23,0.3)' }}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Divider ───────────────────────────────── */}
      <div className="nak-gold-bar opacity-30 mx-2" />

      {/* ── Bottom ───────────────────────────────── */}
      <div className="px-2 pb-3 pt-3 space-y-0.5">
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
              )}
              style={{ color: active ? '#d4a017' : 'rgba(143,168,200,0.7)' }}
            >
              <Icon className="w-[17px] h-[17px] shrink-0" />
              {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
              {!active && (
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: 'rgba(212,160,23,0.08)' }} />
              )}
              {!sidebarOpen && (
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 text-white shadow-lg"
                  style={{ background: '#0a2540', border: '1px solid rgba(212,160,23,0.3)' }}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* User profile */}
        <div className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2 mt-2 cursor-pointer group',
          !sidebarOpen && 'justify-center px-0'
        )}
          style={{ background: 'rgba(10,37,64,0.5)', border: '1px solid rgba(212,160,23,0.12)' }}>
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
                <p className="text-white text-sm font-semibold truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-xs truncate" style={{ color: 'rgba(212,160,23,0.7)' }}>
                  {currentUser.designation ?? currentUser.role.replace(/_/g, ' ')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'rgba(143,168,200,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(143,168,200,0.5)')}
                title="Sign out"
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
        className="absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
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
