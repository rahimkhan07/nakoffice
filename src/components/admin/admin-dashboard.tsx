'use client';

import { useState } from 'react';
import {
  Users, Building2, FolderOpen, CheckSquare, Calendar, HardDrive,
  TrendingUp, Activity, UserPlus, Settings, Bell, Shield,
  MoreHorizontal, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatBytes, formatRelativeTime } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const activityData = [
  { day: 'Mon', active: 6, tasks: 12, messages: 34 },
  { day: 'Tue', active: 7, tasks: 18, messages: 45 },
  { day: 'Wed', active: 8, tasks: 15, messages: 52 },
  { day: 'Thu', active: 5, tasks: 20, messages: 38 },
  { day: 'Fri', active: 8, tasks: 25, messages: 61 },
  { day: 'Sat', active: 3, tasks: 8,  messages: 15 },
  { day: 'Sun', active: 2, tasks: 4,  messages: 9  },
];

const deptData = [
  { name: 'Dev',       value: 3, color: '#3b82f6' },
  { name: 'Design',    value: 2, color: '#8b5cf6' },
  { name: 'Marketing', value: 1, color: '#ec4899' },
  { name: 'Sales',     value: 1, color: '#f59e0b' },
  { name: 'HR',        value: 1, color: '#10b981' },
];

const taskProgressData = [
  { name: 'Done',        value: 3, color: '#22c55e' },
  { name: 'In Progress', value: 2, color: '#3b82f6' },
  { name: 'Review',      value: 1, color: '#8b5cf6' },
  { name: 'To Do',       value: 2, color: '#94a3b8' },
];

export function AdminDashboard() {
  const { users, departments, projects, tasks, meetings, company, activityLog } = useAppStore();
  const [tab, setTab] = useState<'overview'|'employees'|'activity'>('overview');

  const onlineCount   = users.filter(u => u.isOnline).length;
  const activeProjs   = projects.filter(p => p.status === 'in_progress').length;
  const pendingTasks  = tasks.filter(t => t.status !== 'done').length;
  const todayMeetings = meetings.filter(m => new Date(m.startTime).toDateString() === new Date().toDateString()).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Admin Dashboard</h2>
          <p className="text-sm text-[var(--text-muted)]">{company.name} · {company.plan.toUpperCase()} plan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<UserPlus className="w-4 h-4" />}>Invite</Button>
          <Button size="sm" icon={<Settings className="w-4 h-4" />}>Settings</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl w-fit border border-[var(--border)]">
        {(['overview','employees','activity'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Stat row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Employees" value={users.length} icon={<Users className="w-5 h-5" />} color="#3b82f6" change={{ value: 12 }} />
            <StatCard title="Online Now"       value={onlineCount} icon={<Activity className="w-5 h-5" />} color="#22c55e" />
            <StatCard title="Active Projects"  value={activeProjs} icon={<FolderOpen className="w-5 h-5" />} color="#8b5cf6" change={{ value: 8 }} />
            <StatCard title="Pending Tasks"    value={pendingTasks} icon={<CheckSquare className="w-5 h-5" />} color="#f59e0b" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Departments"     value={departments.length} icon={<Building2 className="w-5 h-5" />} color="#06b6d4" />
            <StatCard title="Today's Meetings" value={todayMeetings} icon={<Calendar className="w-5 h-5" />} color="#ec4899" />
            <StatCard title="Storage Used" value={formatBytes(company.storageUsed)} icon={<HardDrive className="w-5 h-5" />} color="#10b981" />
            <StatCard title="Total Projects" value={projects.length} icon={<TrendingUp className="w-5 h-5" />} color="#f97316" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity area chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Team Activity (This Week)</CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12 }} />
                  <Area type="monotone" dataKey="active" stroke="#3b82f6" fill="url(#colorActive)" strokeWidth={2} name="Active Users" />
                  <Area type="monotone" dataKey="tasks"  stroke="#8b5cf6" fill="url(#colorTasks)"  strokeWidth={2} name="Tasks Done" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Dept pie */}
            <Card>
              <CardHeader><CardTitle>Employees by Dept</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {deptData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {deptData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Task progress + project list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Task Breakdown</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={taskProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {taskProgressData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Health</CardTitle>
                <Button variant="ghost" size="xs">View all</Button>
              </CardHeader>
              <div className="space-y-3">
                {projects.map(p => (
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

          {/* Storage */}
          <Card>
            <CardHeader><CardTitle>Storage Usage</CardTitle></CardHeader>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[var(--text-secondary)]">{formatBytes(company.storageUsed)} used of {formatBytes(company.storageLimit)}</span>
                <span className="font-medium text-[var(--text-primary)]">{Math.round((company.storageUsed/company.storageLimit)*100)}%</span>
              </div>
              <Progress value={(company.storageUsed/company.storageLimit)*100} size="md" />
            </div>
          </Card>
        </>
      )}

      {tab === 'employees' && (
        <Card padding="none">
          <div className="px-5 pt-5 pb-4 border-b border-[var(--border)] flex items-center justify-between">
            <CardTitle>All Employees ({users.length})</CardTitle>
            <Button size="sm" icon={<UserPlus className="w-4 h-4" />}>Invite Employee</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                  {['Employee','Role','Department','Status','Last Active','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map(u => {
                  const dept = departments.find(d => d.id === u.departmentId);
                  return (
                    <tr key={u.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} src={u.avatar} size="sm" showStatus status={u.status} />
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{u.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">{u.designation}</td>
                      <td className="px-4 py-3">
                        {dept && <Badge variant="info">{dept.name}</Badge>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatRelativeTime(u.lastActiveAt)}</td>
                      <td className="px-4 py-3">
                        <button className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'activity' && (
        <Card padding="none">
          <div className="px-5 pt-5 pb-4 border-b border-[var(--border)]">
            <CardTitle>Activity Log</CardTitle>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {activityLog.map(log => {
              const user = users.find(u => u.id === log.userId);
              return (
                <div key={log.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-secondary)]">
                  {user && <Avatar name={user.name} size="sm" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)]">{user?.name}</span>
                      {' '}<span className="text-blue-600">{log.action}</span>{' '}
                      <span className="font-medium text-[var(--text-primary)]">{log.entityName}</span>
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{formatRelativeTime(log.createdAt)}</p>
                  </div>
                  <Badge variant="outline">{log.entityType}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
