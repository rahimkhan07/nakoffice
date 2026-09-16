'use client';

import { useState } from 'react';
import { Search, Filter, MessageSquare, Video, LayoutGrid, List } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import type { User } from '@/types';

function EmployeeCard({ user }: { user: User }) {
  const { departments, projects } = useAppStore();
  const dept    = departments.find(d => d.id === user.departmentId);
  const project = projects.find(p => p.id === user.currentProjectId);
  const color   = getAvatarColor(user.name);

  return (
    <Card hover className="overflow-hidden p-0">
      {/* Cover */}
      <div className="h-14 relative" style={{ background: `linear-gradient(135deg, ${color}30, ${color}15)` }}>
        <StatusBadge status={user.status} />
      </div>

      <div className="px-4 pb-4">
        {/* Avatar overlapping cover */}
        <div className="-mt-5 mb-3">
          <Avatar name={user.name} src={user.avatar} status={user.status} size="lg" showStatus />
        </div>

        <p className="font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
        <p className="text-xs text-[var(--text-muted)] truncate mb-2">{user.designation}</p>

        {dept && (
          <Badge variant="info" className="mb-2">{dept.icon} {dept.name}</Badge>
        )}

        {user.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {user.skills.slice(0, 3).map(skill => (
              <span key={skill} className="px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)] text-xs text-[var(--text-muted)]">{skill}</span>
            ))}
          </div>
        )}

        {project && (
          <p className="text-xs text-[var(--text-muted)] mb-3 truncate">
            📁 {project.name}
          </p>
        )}

        <div className="flex gap-2 mt-auto">
          <Button size="xs" variant="secondary" fullWidth icon={<MessageSquare className="w-3 h-3" />}>Message</Button>
          <Button size="xs" variant="ghost" icon={<Video className="w-3.5 h-3.5" />} />
        </div>
      </div>
    </Card>
  );
}

function EmployeeRow({ user }: { user: User }) {
  const { departments, projects } = useAppStore();
  const dept    = departments.find(d => d.id === user.departmentId);
  const project = projects.find(p => p.id === user.currentProjectId);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] border-b border-[var(--border)] last:border-0 transition-colors">
      <Avatar name={user.name} src={user.avatar} status={user.status} size="sm" showStatus />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{user.name}</p>
        <p className="text-xs text-[var(--text-muted)]">{user.designation}</p>
      </div>
      {dept && <Badge variant="info" size="sm">{dept.name}</Badge>}
      <StatusBadge status={user.status} />
      {project && <span className="text-xs text-[var(--text-muted)] hidden lg:block truncate max-w-32">{project.name}</span>}
      <span className="text-xs text-[var(--text-muted)] hidden md:block">{user.location}</span>
      <div className="flex gap-1">
        <Button size="xs" variant="ghost" icon={<MessageSquare className="w-3.5 h-3.5" />} />
        <Button size="xs" variant="ghost" icon={<Video className="w-3.5 h-3.5" />} />
      </div>
    </div>
  );
}

export function PeoplePage() {
  const { users, departments } = useAppStore();
  const [search, setSearch]   = useState('');
  const [deptF, setDeptF]     = useState('');
  const [statusF, setStatusF] = useState('');
  const [view, setView]       = useState<'grid'|'list'>('grid');

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.designation?.toLowerCase().includes(search.toLowerCase())) return false;
    if (deptF && u.departmentId !== deptF) return false;
    if (statusF && u.status !== statusF) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">People</h2>
          <p className="text-sm text-[var(--text-muted)]">{users.length} employees · {users.filter(u => u.isOnline).length} online</p>
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-0.5 rounded-lg border border-[var(--border)]">
          <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-md transition-colors', view==='grid' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={cn('p-1.5 rounded-md transition-colors', view==='list' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input placeholder="Search people…" value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />} inputSize="sm" className="w-56" />
        <select value={deptF} onChange={e => setDeptF(e.target.value)}
          className="h-8 px-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] focus:outline-none">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={statusF} onChange={e => setStatusF(e.target.value)}
          className="h-8 px-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] focus:outline-none">
          <option value="">All Status</option>
          {['available','away','busy','offline'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Department sections */}
      {deptF === '' ? (
        departments.map(dept => {
          const deptUsers = filtered.filter(u => u.departmentId === dept.id);
          if (deptUsers.length === 0) return null;
          return (
            <div key={dept.id} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{dept.icon}</span>
                <h3 className="font-semibold text-[var(--text-primary)]">{dept.name}</h3>
                <span className="text-sm text-[var(--text-muted)]">({deptUsers.length})</span>
              </div>
              {view === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
      ) : (
        view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(u => <EmployeeCard key={u.id} user={u} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
            {filtered.map(u => <EmployeeRow key={u.id} user={u} />)}
          </div>
        )
      )}
    </div>
  );
}
