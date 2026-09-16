'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2, LayoutDashboard, MessageSquare, CheckSquare, FolderOpen,
  Calendar, Users, File, Bell, Bot, Settings, ChevronLeft, ChevronRight,
  Megaphone, LogOut, HelpCircle, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';

const navItems = [
  { href: '/office',        icon: Building2,       label: 'Virtual Office',   key: 'office' },
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',        key: 'dashboard' },
  { href: '/messages',      icon: MessageSquare,   label: 'Messages',         key: 'messages' },
  { href: '/tasks',         icon: CheckSquare,     label: 'Tasks',            key: 'tasks' },
  { href: '/projects',      icon: FolderOpen,      label: 'Projects',         key: 'projects' },
  { href: '/calendar',      icon: Calendar,        label: 'Calendar',         key: 'calendar' },
  { href: '/people',        icon: Users,           label: 'People',           key: 'people' },
  { href: '/files',         icon: File,            label: 'Files',            key: 'files' },
  { href: '/announcements', icon: Megaphone,       label: 'Announcements',    key: 'announcements' },
  { href: '/departments',   icon: Building2,       label: 'Departments',      key: 'departments' },
  { href: '/ai',            icon: Bot,             label: 'Office AI',        key: 'ai', highlight: true },
];

const bottomItems = [
  { href: '/settings',      icon: Settings,        label: 'Settings' },
  { href: '/help',          icon: HelpCircle,      label: 'Help' },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    currentUser, company, sidebarOpen, toggleSidebar,
    channels, notifications, logout,
  } = useAppStore();

  const totalUnread = channels.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  if (!currentUser) return null;

  return (
    <aside
      className={cn(
        'flex flex-col h-screen border-r border-[var(--border)] bg-[var(--sidebar-bg)]',
        'transition-all duration-300 shrink-0',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-white/10',
        !sidebarOpen && 'justify-center px-0'
      )}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight truncate">{company.name}</p>
            <p className="text-blue-300 text-xs truncate">Virtual Office</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            const badge = item.key === 'messages' ? totalUnread
                        : item.key === 'announcements' ? 0
                        : 0;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl transition-all duration-150',
                    'group relative',
                    sidebarOpen ? 'px-3 py-2.5' : 'justify-center py-2.5',
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/10',
                    item.highlight && !active && 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/20',
                  )}
                >
                  <Icon className={cn('w-4.5 h-4.5 shrink-0', !sidebarOpen && 'w-5 h-5')} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium truncate flex-1">{item.label}</span>
                  )}
                  {sidebarOpen && badge > 0 && (
                    <span className="ml-auto bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                  {/* Tooltip when collapsed */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-3 border-t border-white/10 pt-3 space-y-0.5">
        {bottomItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl transition-all duration-150 group relative',
                'text-slate-400 hover:text-white hover:bg-white/10',
                sidebarOpen ? 'px-3 py-2' : 'justify-center py-2',
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* User profile */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2 mt-2 group cursor-pointer',
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
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-slate-400 text-xs truncate">{currentUser.designation}</p>
              </div>
              <button
                onClick={logout}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] shadow-sm transition-colors z-10"
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </aside>
  );
}
