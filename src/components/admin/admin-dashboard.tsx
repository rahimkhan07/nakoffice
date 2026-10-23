'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Building2, FolderOpen, CheckSquare, Calendar, HardDrive,
  TrendingUp, Activity, UserPlus, Settings, Shield,
  MoreHorizontal, Eye, Edit3, Trash2, UserX, UserCheck,
  Mail, X, Check, ChevronDown, Send,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { Input, Select } from '@/components/ui/input';
import { formatBytes, formatRelativeTime } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { User } from '@/types';
import toast from 'react-hot-toast';

// ── helpers ────────────────────────────────────────────────────
/** Build last-7-days activity from real activityLog + tasks arrays */
function buildWeeklyActivity(
  activityLog: import('@/types').ActivityLog[],
  tasks:       import('@/types').Task[],
) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const result = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label    = days[d.getDay()];
    const dateStr  = d.toISOString().split('T')[0];
    const active   = new Set(
      activityLog
        .filter(l => l.createdAt.startsWith(dateStr))
        .map(l => l.userId)
    ).size;
    const done     = tasks.filter(
      t => t.status === 'done' && t.updatedAt?.startsWith(dateStr)
    ).length;
    return { day: label, active, tasks: done };
  });
  return result;
}

const STATUS_OPTIONS = [
  { value: 'available', label: '🟢 Available' },
  { value: 'away',      label: '🟡 Away'      },
  { value: 'busy',      label: '🔴 Busy'      },
  { value: 'offline',   label: '⚫ Offline'    },
];

const ROLE_OPTIONS = [
  { value: 'company_owner',   label: 'Company Owner'   },
  { value: 'company_admin',   label: 'Company Admin'   },
  { value: 'department_head', label: 'Department Head' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'employee',        label: 'Employee'        },
];

// ── Row action dropdown ────────────────────────────────────────
function RowActions({
  user,
  onView,
  onEdit,
  onDelete,
}: {
  user:     User;
  onView:   () => void;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const actions = [
    {
      icon: Eye,
      label: 'View Profile',
      desc:  'Open full profile page',
      color: '',
      onClick: () => { onView(); setOpen(false); },
    },
    {
      icon: Edit3,
      label: 'Modify Employee',
      desc:  'Edit name, role, department',
      color: '',
      onClick: () => { onEdit(); setOpen(false); },
    },
    {
      icon: UserCheck,
      label: 'Send Message',
      desc:  'Open direct message',
      color: '',
      onClick: () => { toast(`Opening DM with ${user.name}…`); setOpen(false); },
    },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Trigger — three inline icon buttons + the overflow menu */}
      <div className="flex items-center gap-1">
        {/* Quick Edit */}
        <button
          onClick={() => { onEdit(); }}
          title="Modify employee"
          className="p-1.5 rounded-lg transition-colors text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        {/* Quick Delete */}
        <button
          onClick={() => { onDelete(); }}
          title="Delete employee"
          className="p-1.5 rounded-lg transition-colors text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* More menu */}
        <button
          onClick={() => setOpen(o => !o)}
          className="p-1.5 rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          aria-label="More actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 z-50 mt-1.5 w-52 rounded-2xl shadow-2xl border overflow-hidden py-1"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div className="px-4 pt-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
          </div>

          {/* Actions */}
          <div className="py-1">
            {actions.map(item => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-secondary)]"
              >
                <item.icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--text-muted)]" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="h-px mx-3" style={{ background: 'var(--border)' }} />

          {/* Danger zone */}
          <div className="py-1">
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-red-600">Delete Employee</p>
                <p className="text-xs text-red-400">Permanently remove from system</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Edit / Modify Employee Modal ──────────────────────────────
function EditEmployeeModal({
  user,
  open,
  onClose,
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
}) {
  const { departments, updateUser } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:         '',
    designation:  '',
    role:         'employee' as User['role'],
    departmentId: '',
    status:       'available' as User['status'],
    location:     '',
    phone:        '',
  });

  // Re-populate form whenever target user changes
  useEffect(() => {
    if (user) {
      setForm({
        name:         user.name,
        designation:  user.designation ?? '',
        role:         user.role,
        departmentId: user.departmentId ?? '',
        status:       user.status,
        location:     user.location ?? '',
        phone:        user.phone ?? '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // ✅ updateUser writes to Firestore AND updates the users[] in store
      updateUser(user.id, form);
      toast.success(`${form.name || user.name} updated successfully ✓`);
      onClose();
    } catch {
      toast.error('Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Modify — ${user.name}`}
      description="Update employee profile, role and department"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            loading={saving}
            onClick={handleSave}
            icon={!saving ? <Check className="w-4 h-4" /> : undefined}
          >
            Save Changes
          </Button>
        </>
      }        </>
      }
    >
      <div className="space-y-4">
        {/* Avatar preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
          <Avatar name={user.name} src={user.avatar} size="lg" showStatus status={form.status as User['status']} />
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{user.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Full name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Job title"
            value={form.designation}
            onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
            placeholder="e.g. Senior Developer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Role"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value as User['role'] }))}
            options={ROLE_OPTIONS}
          />
          <Select
            label="Department"
            value={form.departmentId}
            onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
            options={[
              { value: '', label: 'No department' },
              ...departments.map(d => ({ value: d.id, label: `${d.icon} ${d.name}` })),
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as User['status'] }))}
            options={STATUS_OPTIONS}
          />
          <Input
            label="Location"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="e.g. Dubai, UAE"
          />
        </div>

        <Input
          label="Phone"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="+971 50 000 0000"
        />
      </div>
    </Modal>
  );
}

// ── Invite Employee Modal ──────────────────────────────────────
function InviteEmployeeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { departments } = useAppStore();
  const [emails, setEmails] = useState('');
  const [dept,   setDept]   = useState('');
  const [role,   setRole]   = useState('employee');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const list = emails.split(/[\n,;]/).map(e => e.trim()).filter(Boolean);
    if (!list.length) { toast.error('Enter at least one email address'); return; }

    const invalid = list.filter(e => !e.includes('@'));
    if (invalid.length) { toast.error(`Invalid email: ${invalid[0]}`); return; }

    setSending(true);
    // Simulate invite (in production this would call an API endpoint)
    await new Promise(r => setTimeout(r, 900));
    toast.success(`Invitation sent to ${list.length} email${list.length > 1 ? 's' : ''}! 📧`);
    setSending(false);
    setEmails('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite Team Members"
      description="Send email invitations to join NAK Digital Office"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            loading={sending}
            onClick={handleSend}
            icon={<Send className="w-4 h-4" />}
          >
            Send Invitations
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Email input */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Email addresses *
          </label>
          <textarea
            value={emails}
            onChange={e => setEmails(e.target.value)}
            placeholder={'alex@company.com\nsara@company.com\njohn@company.com'}
            rows={4}
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background:   'var(--bg-elevated)',
              borderColor:  'var(--border)',
              color:        'var(--text-primary)',
            }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            One email per line, or comma/semicolon separated
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Department"
            value={dept}
            onChange={e => setDept(e.target.value)}
            options={[
              { value: '', label: 'Select department' },
              ...departments.map(d => ({ value: d.id, label: `${d.icon} ${d.name}` })),
            ]}
          />
          <Select
            label="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
            options={ROLE_OPTIONS}
          />
        </div>

        {/* Preview */}
        {emails.trim() && (
          <div
            className="rounded-xl p-3 text-sm"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
              PREVIEW — {emails.split(/[\n,;]/).map(e => e.trim()).filter(Boolean).length} recipient(s)
            </p>
            {emails.split(/[\n,;]/).map(e => e.trim()).filter(Boolean).slice(0, 5).map(email => (
              <div key={email} className="flex items-center gap-2 py-1">
                <Mail className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{email}</span>
              </div>
            ))}
            {emails.split(/[\n,;]/).map(e => e.trim()).filter(Boolean).length > 5 && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                +{emails.split(/[\n,;]/).map(e => e.trim()).filter(Boolean).length - 5} more…
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Main component ─────────────────────────────────────────────
export function AdminDashboard() {
  const router = useRouter();
  const { users, departments, projects, tasks, meetings, company, activityLog, deleteUser } = useAppStore();

  const [tab,            setTab]            = useState<'overview' | 'employees' | 'activity'>('overview');
  const [inviteOpen,     setInviteOpen]     = useState(false);
  const [editUser,       setEditUser]       = useState<User | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<User | null>(null);
  const [searchQuery,    setSearchQuery]    = useState('');

  const onlineCount   = users.filter(u => u.isOnline).length;
  const activeProjs   = projects.filter(p => p.status === 'in_progress').length;
  const pendingTasks  = tasks.filter(t => t.status !== 'done').length;
  const todayMeetings = meetings.filter(m =>
    new Date(m.startTime).toDateString() === new Date().toDateString()
  ).length;

  // Pie chart data derived from real store data
  const deptCounts = departments.map(d => ({
    name:  d.name.slice(0, 6),
    value: users.filter(u => u.departmentId === d.id).length,
    color: d.color ?? '#3b82f6',
  })).filter(d => d.value > 0);

  const taskBreakdown = [
    { name: 'Done',        value: tasks.filter(t => t.status === 'done').length,        color: '#22c55e' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Review',      value: tasks.filter(t => t.status === 'review').length,      color: '#8b5cf6' },
    { name: 'To Do',       value: tasks.filter(t => t.status === 'todo').length,        color: '#94a3b8' },
  ].filter(t => t.value > 0);

  // ✅ Real activity data computed from Firebase activityLog + tasks
  const activityData = buildWeeklyActivity(activityLog, tasks);

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteEmployee = async () => {
    if (!deleteTarget) return;
    try {
      // ✅ Hard-delete: removes from Firestore users collection + local store
      deleteUser(deleteTarget.id);
      toast.success(`${deleteTarget.name} has been permanently deleted`);
    } catch {
      toast.error('Failed to delete employee');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Admin Dashboard</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {company.name} · {(company.plan ?? 'free').toUpperCase()} plan
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setInviteOpen(true)}
          >
            Invite
          </Button>
          <Button
            size="sm"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => router.push('/settings')}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl w-fit border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        {(['overview', 'employees', 'activity'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
            style={
              tab === t
                ? { background: 'var(--bg-elevated)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: 'var(--text-muted)' }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ──────────────────────────────── */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Employees" value={users.length}     icon={<Users       className="w-5 h-5" />} color="#3b82f6" />
            <StatCard title="Online Now"       value={onlineCount}     icon={<Activity    className="w-5 h-5" />} color="#22c55e" />
            <StatCard title="Active Projects"  value={activeProjs}     icon={<FolderOpen  className="w-5 h-5" />} color="#8b5cf6" />
            <StatCard title="Pending Tasks"    value={pendingTasks}    icon={<CheckSquare className="w-5 h-5" />} color="#f59e0b" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Departments"      value={departments.length} icon={<Building2  className="w-5 h-5" />} color="#06b6d4" />
            <StatCard title="Today Meetings"   value={todayMeetings}   icon={<Calendar    className="w-5 h-5" />} color="#ec4899" />
            <StatCard title="Storage Used"     value={formatBytes(company.storageUsed ?? 0)} icon={<HardDrive className="w-5 h-5" />} color="#10b981" />
            <StatCard title="Total Projects"   value={projects.length} icon={<TrendingUp  className="w-5 h-5" />} color="#f97316" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Team Activity (This Week)</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1a73e8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1a73e8" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#d4a017" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4a017" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12 }} />
                  <Area type="monotone" dataKey="active" stroke="#1a73e8" fill="url(#gA)" strokeWidth={2} name="Active Users" />
                  <Area type="monotone" dataKey="tasks"  stroke="#d4a017" fill="url(#gT)" strokeWidth={2} name="Tasks Done"   />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <CardHeader><CardTitle>By Department</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={deptCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {deptCounts.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {deptCounts.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Task Breakdown</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={taskBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {taskBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Health</CardTitle>
                <Button variant="ghost" size="xs" onClick={() => router.push('/projects')}>View all</Button>
              </CardHeader>
              <div className="space-y-3">
                {projects.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                        <span className="text-xs text-[var(--text-muted)] ml-2">{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} size="xs" color={p.color} />
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Storage Usage</CardTitle></CardHeader>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[var(--text-secondary)]">
                  {formatBytes(company.storageUsed ?? 0)} used of {formatBytes(company.storageLimit ?? 107374182400)}
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {Math.round(((company.storageUsed ?? 0) / (company.storageLimit ?? 107374182400)) * 100)}%
                </span>
              </div>
              <Progress value={((company.storageUsed ?? 0) / (company.storageLimit ?? 107374182400)) * 100} size="md" />
            </div>
          </Card>
        </>
      )}

      {/* ── EMPLOYEES ─────────────────────────────── */}
      {tab === 'employees' && (
        <Card padding="none">
          {/* Table header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b gap-4 flex-wrap" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <CardTitle>All Employees ({filteredUsers.length})</CardTitle>
              {/* Search */}
              <div className="relative hidden sm:block">
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search employees…"
                  className="h-8 pl-8 pr-3 text-xs rounded-lg border w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <svg className="absolute left-2.5 top-2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2" style={{ color: 'var(--text-muted)' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <Button
              size="sm"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => setInviteOpen(true)}
            >
              Invite Employee
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  {['Employee', 'Role', 'Department', 'Status', 'Last Active', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      No employees match your search
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const dept = departments.find(d => d.id === u.departmentId);
                    return (
                      <tr
                        key={u.id}
                        className="transition-colors"
                        style={{ cursor: 'default' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        {/* Employee */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} src={u.avatar} size="sm" showStatus status={u.status} />
                            <div>
                              <p className="font-medium text-[var(--text-primary)]">{u.name}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {u.designation ||
                            ROLE_OPTIONS.find(r => r.value === u.role)?.label ||
                            u.role.replace(/_/g, ' ')}
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3">
                          {dept ? (
                            <Badge variant="info">{dept.icon} {dept.name}</Badge>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={u.status} />
                        </td>

                        {/* Last active */}
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatRelativeTime(u.lastActiveAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <RowActions
                            user={u}
                            onView={()    => router.push('/people')}
                            onEdit={()    => setEditUser(u)}
                            onDelete={()  => setDeleteTarget(u)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <span>{filteredUsers.length} of {users.length} employees</span>
            <span>{users.filter(u => u.isOnline).length} currently online</span>
          </div>
        </Card>
      )}

      {/* ── ACTIVITY ──────────────────────────────── */}
      {tab === 'activity' && (
        <Card padding="none">
          <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <CardTitle>Activity Log</CardTitle>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {activityLog.length === 0 ? (
              <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No activity recorded yet
              </div>
            ) : (
              activityLog.map(log => {
                const user = users.find(u => u.id === log.userId);
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 px-5 py-3 transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    {user
                      ? <Avatar name={user.name} src={user.avatar} size="sm" />
                      : <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)]" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{user?.name ?? 'Unknown'}</span>
                        {' '}
                        <span style={{ color: '#1a73e8' }}>{log.action}</span>
                        {' '}
                        <span className="font-medium text-[var(--text-primary)]">{log.entityName}</span>
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(log.createdAt)}</p>
                    </div>
                    <Badge variant="outline">{log.entityType}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* ── Modals ────────────────────────────────── */}
      <InviteEmployeeModal open={inviteOpen}  onClose={() => setInviteOpen(false)} />
      <EditEmployeeModal   user={editUser}    open={!!editUser} onClose={() => setEditUser(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteEmployee}
        title={`Delete "${deleteTarget?.name ?? 'Employee'}"?`}
        message={`This will permanently delete ${deleteTarget?.name}'s account and remove all their data from NAK Digital Office. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        danger
      />
    </div>
  );
}
