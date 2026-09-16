'use client';

import { useState } from 'react';
import { Megaphone, Plus, Bell, Clock, Users, AlertCircle } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea, Select } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import type { Announcement } from '@/types';
import { generateId } from '@/lib/utils';

const priorityConfig = {
  low:    { color: '#64748b', bg: 'bg-slate-100 dark:bg-slate-800',    border: 'border-slate-200 dark:border-slate-700', icon: '📌' },
  normal: { color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950/20',    border: 'border-blue-200 dark:border-blue-800',   icon: '📢' },
  high:   { color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/20',  border: 'border-amber-200 dark:border-amber-800', icon: '🔔' },
  urgent: { color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950/20',      border: 'border-red-200 dark:border-red-800',     icon: '🚨' },
};

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const { users } = useAppStore();
  const author = users.find(u => u.id === announcement.authorId);
  const cfg    = priorityConfig[announcement.priority];
  const readCount = announcement.readBy?.length ?? 0;
  const expired   = announcement.expiryDate && new Date(announcement.expiryDate) < new Date();

  return (
    <div className={cn('rounded-2xl border p-5 transition-all', cfg.bg, cfg.border, expired && 'opacity-60')}>
      <div className="flex items-start gap-4">
        <div className="text-2xl shrink-0">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-[var(--text-primary)] leading-tight">{announcement.title}</h3>
            <div className="flex items-center gap-2 shrink-0">
              {expired && <Badge variant="default">Expired</Badge>}
              <Badge
                variant={announcement.priority === 'urgent' ? 'danger' : announcement.priority === 'high' ? 'warning' : announcement.priority === 'normal' ? 'info' : 'default'}
                className="capitalize"
              >
                {announcement.priority}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{announcement.content}</p>

          <div className="flex items-center gap-4 flex-wrap">
            {author && (
              <div className="flex items-center gap-2">
                <Avatar name={author.name} src={author.avatar} size="xs" />
                <span className="text-xs text-[var(--text-muted)]">{author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(announcement.publishDate)}
            </div>
            {readCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Users className="w-3 h-3" />
                {readCount} read
              </div>
            )}
            {announcement.expiryDate && !expired && (
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <AlertCircle className="w-3 h-3" />
                Expires {new Date(announcement.expiryDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementsPage() {
  const { announcements, currentUser } = useAppStore();
  const [modal,  setModal]  = useState(false);
  const [filter, setFilter] = useState('');
  const [form,   setForm]   = useState({
    title: '', content: '', priority: 'normal' as Announcement['priority'],
    expiryDate: '',
  });

  const filtered = filter
    ? announcements.filter(a => a.priority === filter)
    : announcements;

  const active  = filtered.filter(a => !a.expiryDate || new Date(a.expiryDate) > new Date());
  const expired = filtered.filter(a => a.expiryDate && new Date(a.expiryDate) <= new Date());

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Announcements</h2>
          <p className="text-sm text-[var(--text-muted)]">{active.length} active · {expired.length} expired</p>
        </div>
        <Button onClick={() => setModal(true)} icon={<Plus className="w-4 h-4" />}>
          New Announcement
        </Button>
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-2 mb-6">
        {['', 'urgent', 'high', 'normal', 'low'].map(p => (
          <button key={p} onClick={() => setFilter(p)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border',
              filter === p
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-blue-400 bg-[var(--bg-secondary)]'
            )}>
            {p || 'All'}
          </button>
        ))}
      </div>

      {/* Active announcements */}
      {active.length > 0 && (
        <div className="space-y-4 mb-8">
          {active.map(a => <AnnouncementCard key={a.id} announcement={a} />)}
        </div>
      )}

      {/* Expired */}
      {expired.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Expired</h3>
          <div className="space-y-3">
            {expired.map(a => <AnnouncementCard key={a.id} announcement={a} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="font-medium text-[var(--text-primary)]">No announcements</p>
          <p className="text-sm text-[var(--text-muted)]">Post an announcement to keep your team informed</p>
        </div>
      )}

      {/* New announcement modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Announcement" size="md"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={() => setModal(false)}>Publish</Button></>}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement headline" />
          <Textarea label="Message" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your announcement…" rows={5} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Announcement['priority'] }))}
              options={[{value:'low',label:'Low'},{value:'normal',label:'Normal'},{value:'high',label:'High'},{value:'urgent',label:'Urgent'}]} />
            <Input label="Expiry date (optional)" type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
