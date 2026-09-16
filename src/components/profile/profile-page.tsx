'use client';

import { useState } from 'react';
import {
  Camera, Edit3, MapPin, Clock, Mail, Phone,
  Briefcase, Tag, Save, X, Check,
} from 'lucide-react';
import { cn, getAvatarColor, getInitials, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/app-store';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'available', label: '🟢 Available' },
  { value: 'away',      label: '🟡 Away'      },
  { value: 'busy',      label: '🔴 Busy'      },
  { value: 'offline',   label: '⚫ Offline'    },
];

export function ProfilePage() {
  const { currentUser, users, projects, tasks, departments, updateUserStatus } = useAppStore();
  const [editing, setEditing]   = useState(false);
  const [form,    setForm]      = useState({
    name:        currentUser?.name        ?? '',
    designation: currentUser?.designation ?? '',
    bio:         currentUser?.bio         ?? '',
    phone:       currentUser?.phone       ?? '',
    location:    currentUser?.location    ?? '',
    timezone:    currentUser?.timezone    ?? '',
    skills:      currentUser?.skills?.join(', ') ?? '',
    status:      currentUser?.status      ?? 'available',
  });

  if (!currentUser) return null;

  const color      = getAvatarColor(currentUser.name);
  const dept       = departments.find(d => d.id === currentUser.departmentId);
  const myTasks    = tasks.filter(t => t.assigneeId === currentUser.id);
  const doneTasks  = myTasks.filter(t => t.status === 'done').length;
  const myProjects = projects.filter(p => p.memberIds.includes(currentUser.id));

  const handleSave = () => {
    updateUserStatus(currentUser.id, form.status as typeof currentUser.status);
    toast.success('Profile updated!');
    setEditing(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Cover + Avatar */}
      <div className="relative mb-16">
        <div className="h-40 rounded-2xl relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color}40 0%, ${color}15 100%)` }}>
          <div className="absolute inset-0 office-grid opacity-20" />
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-12 left-6 flex items-end gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl border-4 border-[var(--bg-primary)] flex items-center justify-center text-3xl font-bold text-white shadow-lg"
              style={{ backgroundColor: color }}>
              {getInitials(currentUser.name)}
            </div>
            <button className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-sm">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Edit button */}
        <div className="absolute -bottom-12 right-0">
          {editing ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)} icon={<X className="w-4 h-4" />}>Cancel</Button>
              <Button size="sm" onClick={handleSave} icon={<Save className="w-4 h-4" />}>Save Changes</Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)} icon={<Edit3 className="w-4 h-4" />}>Edit Profile</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: profile info */}
        <div className="lg:col-span-1 space-y-5">
          {/* Identity card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            {editing ? (
              <div className="space-y-3">
                <Input label="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <Input label="Designation" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
                <Textarea label="Bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} />
                <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof currentUser.status }))} options={STATUS_OPTIONS} />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{currentUser.name}</h2>
                <p className="text-[var(--text-muted)] text-sm mb-3">{currentUser.designation}</p>
                <StatusBadge status={currentUser.status} />
                {currentUser.bio && (
                  <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">{currentUser.bio}</p>
                )}
              </>
            )}
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Contact & Info</h3>
            {editing ? (
              <div className="space-y-3">
                <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} leftIcon={<Phone className="w-4 h-4" />} />
                <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} leftIcon={<MapPin className="w-4 h-4" />} />
                <Input label="Timezone" value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} leftIcon={<Clock className="w-4 h-4" />} />
              </div>
            ) : (
              <div className="space-y-2.5">
                {[
                  { icon: Mail,     value: currentUser.email    },
                  { icon: Phone,    value: currentUser.phone    },
                  { icon: MapPin,   value: currentUser.location },
                  { icon: Clock,    value: currentUser.timezone },
                  { icon: Briefcase, value: dept?.name ? `${dept.icon} ${dept.name}` : undefined },
                ].filter(i => i.value).map(({ icon: Icon, value }) => (
                  <div key={value} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Icon className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    <span className="truncate">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Skills</h3>
            {editing ? (
              <Input label="" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                placeholder="React, TypeScript, Node.js…" hint="Comma separated" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {(currentUser.skills ?? []).map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-800">
                    {s}
                  </span>
                ))}
                {(!currentUser.skills || currentUser.skills.length === 0) && (
                  <p className="text-xs text-[var(--text-muted)]">No skills added yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: activity */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Tasks Done',    value: doneTasks,       color: '#22c55e' },
              { label: 'Active Tasks',  value: myTasks.filter(t => t.status !== 'done').length, color: '#3b82f6' },
              { label: 'Projects',      value: myProjects.length, color: '#8b5cf6' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-center">
                <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Active Projects */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Active Projects</h3>
            {myProjects.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Not assigned to any projects yet.</p>
            ) : (
              <div className="space-y-3">
                {myProjects.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                        <span className="text-xs text-[var(--text-muted)] ml-2">{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} size="xs" color={p.color} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Tasks */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Recent Tasks</h3>
            <div className="space-y-2">
              {myTasks.slice(0, 6).map(t => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                    t.status === 'done' ? 'bg-green-500 border-green-500' : 'border-[var(--border)]'
                  )}>
                    {t.status === 'done' && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <p className={cn('text-sm flex-1 truncate',
                    t.status === 'done' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]')}>
                    {t.title}
                  </p>
                  <Badge variant={t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'default'}>
                    {t.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
