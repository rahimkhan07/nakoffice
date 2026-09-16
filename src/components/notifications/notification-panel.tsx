'use client';

import { useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, MessageSquare, CheckSquare, Calendar, File, Megaphone, FolderOpen } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import type { Notification } from '@/types';

const typeIcons = {
  message:      MessageSquare,
  task:         CheckSquare,
  meeting:      Calendar,
  mention:      MessageSquare,
  file:         File,
  announcement: Megaphone,
  project:      FolderOpen,
};

function NotifItem({ notif, actor }: { notif: Notification; actor?: { name: string; avatar?: string } }) {
  const { markNotificationRead } = useAppStore();
  const Icon = typeIcons[notif.type] ?? Bell;

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer',
        !notif.read && 'bg-blue-50/50 dark:bg-blue-950/20'
      )}
      onClick={() => markNotificationRead(notif.id)}
    >
      <div className="relative shrink-0 mt-0.5">
        {actor ? (
          <Avatar name={actor.name} src={actor.avatar} size="sm" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
        )}
        {!notif.read && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', notif.read ? 'text-[var(--text-secondary)]' : 'font-medium text-[var(--text-primary)]')}>
          {notif.title}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{notif.body}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">{formatRelativeTime(notif.createdAt)}</p>
      </div>
    </div>
  );
}

export function NotificationPanel() {
  const { notifPanelOpen, setNotifPanelOpen, notifications, users, markAllNotificationsRead } = useAppStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifPanelOpen(false);
      }
    };
    if (notifPanelOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifPanelOpen, setNotifPanelOpen]);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
      {notifPanelOpen && (
        <div
          ref={panelRef}
          className={cn(
            'fixed top-14 right-0 w-96 h-[calc(100vh-3.5rem)] z-40',
            'bg-[var(--bg-elevated)] border-l border-[var(--border)]',
            'flex flex-col shadow-xl'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--text-primary)]" />
              <h2 className="font-semibold text-[var(--text-primary)]">Notifications</h2>
              {unread > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setNotifPanelOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="w-10 h-10 text-[var(--text-muted)] mb-3" />
                <p className="text-sm font-medium text-[var(--text-primary)]">All caught up!</p>
                <p className="text-xs text-[var(--text-muted)]">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const actor = notif.actorId ? users.find(u => u.id === notif.actorId) : undefined;
                return (
                  <NotifItem
                    key={notif.id}
                    notif={notif}
                    actor={actor ? { name: actor.name, avatar: actor.avatar } : undefined}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}
