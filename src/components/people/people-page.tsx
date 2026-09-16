'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MessageSquare, Video, LayoutGrid, List, UserPlus } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import type { User } from '@/types';
import toast from 'react-hot-toast';

/* ─── Employee card (grid view) ──────────────────────── */
function EmployeeCard({ user }: { user: User }) {
  const { departments, projects, setActiveChannel, channels, currentUser } = useAppStore();
  const router  = useRouter();
  const dept    = departments.find(d => d.id === user.departmentId);
  const project = projects.find(p => p.id === user.currentProjectId);
  const color   = getAvatarColor(user.name);

  const handleMessage = () => {
    const dm = channels.find(c =>
      c.type === 'direct' &&
      c.memberIds.includes(user.id) &&
      c.memberIds.includes(currentUser?.id ?? '')
    );
    if (dm) setActiveChannel(dm.id);
    router.push('/messages');
  };

  const handleCall = () => {
    toast.success(`Starting video call with ${user.name}…`);
  };

  return (
    <div className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200">
      {/* Colour cover */}
      <div className="h-16 relative" style={{ background: `linear-gradient(135deg,${color}35,${color}15)` }}>
        {/* status badge top-right */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={user.status} />
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Avatar overlapping cover */}
        <div className="-mt-5 mb-3">
          <Avatar name={user.name} src={user.avatar} status={user.status} size="lg" showStatus />
        </div>

        <p className="font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
        <p className="text-xs text-[var(--text-muted)] truncate mb-2">{user.designation}</p>

        {dept && (
          <div className="mb-2">
            <Badge variant="info">{dept.icon} {dept.name}</Badge>
          </div>
        )}

        {user.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {user.skills.slice(0, 3).map(skill => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[11px] text-[var(--text-muted)] border border-[var(--border)]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {project && (
          <p className="text-xs text-[var(--text-muted)] mb-3 truncate">
            📁 {project.name}
          </p>
        )}

        {user.location && (
          <p className="text-xs text-[var(--text-muted)] mb-3 truncate">📍 {user.location}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          <Button
            size="xs"
            variant="secondary"
            fullWidth
            icon={<MessageSquare className="w-3 h-3" />}
            onClick={handleMessage}
          >
            Message
          </Button>
          <Button
            size="xs"
            variant="ghost"
            icon={<Video className="w-3.5 h-3.5" />}
            onClick={handleCall}
            title="Start video call"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Employee row (list view) ───────────────────────── */
function EmployeeRow({ user }: { user: User }) {
  const { departments, projects, setActiveChannel, channels, currentUser } = useAppStore();
  const router  = useRouter();
  const dept    = departments.find(d => d.id === user.departmentId);
  const project = projects.find(p => p.id === user.currentProjectId);

  const handleMessage = () => {
    const dm = channels.find(c =>
      c.type === 'direct' &&
      c.memberIds.includes(user.id) &&
      c.memberIds.includes(currentUser?.id ?? '')
    );
    if (dm) setActiveChannel(dm.id);
    router.push('/messages');
  };

  const handleCall = () => toast.success(`Starting video call with ${user.name}…`);

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--bg-secondary)] border-b border-[var(--border)] last:border-0 transition-colors">
      <Avatar name={user.name} src={user.avatar} status={user.status} size="sm" showStatus />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
        <p className="text-xs text-[var(--text-muted)] truncate">{user.designation}</p>
      </div>
      {dept && <Badge variant="info" size="sm">{dept.name}</Badge>}
      <StatusBadge status={user.status} />
      {project && (
        <span className="text-xs text-[var(--text-muted)] hidden xl:block truncate max-w-[120px]">
          {project.name}
        </span>
      )}
      <span className="text-xs text-[var(--text-muted)] hidden lg:block w-28 truncate">
        {user.location}
      </span>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={handleMessage}
          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-[var(--text-muted)] hover:text-blue-600 transition-colors"
          title="Message"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCall}
          className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 text-[var(--text-muted)] hover:text-purple-600 transition-colors"
          title="Video call"
        >
          <Video className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── People page ────────────────────────────────────── */
export function PeoplePage() {
  const { users, departments } = useAppStore();
  const [search,  setSearch]   = useState('');
  const [deptF,   setDeptF]    = useState('');
  const [statusF, setStatusF]  = useState('');
  const [view,    setView]     = useState<'grid' | 'list'>('grid');

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.designation?.toLowerCase().includes(search.toLowerCase());
    const matchDept   = !deptF   || u.departmentId === deptF;
    const matchStatus = !statusF || u.status === statusF;
    return matchSearch && matchDept && matchStatus;
  });

  const onlineCount = users.filter(u => u.isOnline).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">People</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {users.length} employees · {onlineCount} online
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-[var(--bg-secondary)] p-0.5 rounded-lg border border-[var(--border)]">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                view === 'grid'
                  ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                view === 'list'
                  ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input
          placeholder="Search people…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          inputSize="sm"
          className="w-56"
        />
        <select
          value={deptF}
          onChange={e => setDeptF(e.target.value)}
          className="h-8 px-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select
          value={statusF}
          onChange={e => setStatusF(e.target.value)}
          className="h-8 px-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          {['available', 'away', 'busy', 'offline'].map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        {(search || deptF || statusF) && (
          <button
            onClick={() => { setSearch(''); setDeptF(''); setStatusF(''); }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        )}
        <span className="text-sm text-[var(--text-muted)] ml-auto">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Department sections (when no dept filter) */}
      {deptF === '' ? (
        departments.map(dept => {
          const deptUsers = filtered.filter(u => u.departmentId === dept.id);
          if (!deptUsers.length) return null;
          return (
            <div key={dept.id} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{dept.icon}</span>
                <h3 className="font-semibold text-[var(--text-primary)] text-sm">{dept.name}</h3>
                <span className="text-xs text-[var(--text-muted)]">({deptUsers.length})</span>
                <div className="flex-1 h-px bg-[var(--border)] ml-2" />
              </div>
              {view === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {deptUsers.map(u => <EmployeeCard key={u.id} user={u} />)}
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
                  {deptUsers.map(u => <EmployeeRow key={u.id} user={u} />)}
                </div>
              )}
            </div>
          );
        })
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(u => <EmployeeCard key={u.id} user={u} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
          {filtered.map(u => <EmployeeRow key={u.id} user={u} />)}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--text-primary)] font-medium">No people found</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
