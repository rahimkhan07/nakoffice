'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckSquare, Calendar, MessageSquare, Users, Megaphone,
  TrendingUp, Clock, ArrowRight, Video, Plus, X, Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Modal } from '@/components/ui/modal';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import { formatRelativeTime, formatTime, formatDate, generateId, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Task } from '@/types';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ─── New Task Modal ─────────────────────────────────────────── */
function NewTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTask, currentUser, projects, users } = useAppStore();
  const [form, setForm] = useState({
    title: '', description: '', projectId: projects[0]?.id ?? '',
    priority: 'medium' as Task['priority'], dueDate: '', assigneeId: currentUser?.id ?? '',
  });

  const handleCreate = () => {
    if (!form.title.trim()) { toast.error('Please enter a task title'); return; }
    addTask({
      id: generateId(),
      companyId: 'company-1',
      projectId: form.projectId,
      title: form.title.trim(),
      description: form.description,
      assigneeId: form.assigneeId || undefined,
      reporterId: currentUser?.id ?? 'user-1',
      status: 'todo',
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: Date.now(),
    });
    toast.success('Task created!');
    onClose();
    setForm({ title: '', description: '', projectId: projects[0]?.id ?? '', priority: 'medium', dueDate: '', assigneeId: currentUser?.id ?? '' });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Task"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate}>Create Task</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Task title *"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="What needs to be done?"
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Add more context…"
          rows={3}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Priority"
            value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}
            options={[
              { value: 'low',    label: 'Low'    },
              { value: 'medium', label: 'Medium' },
              { value: 'high',   label: 'High'   },
              { value: 'urgent', label: 'Urgent' },
            ]}
          />
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Project"
            value={form.projectId}
            onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
            options={projects.map(p => ({ value: p.id, label: p.name }))}
          />
          <Select
            label="Assignee"
            value={form.assigneeId}
            onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}
            options={[{ value: '', label: 'Unassigned' }, ...users.map(u => ({ value: u.id, label: u.name }))]}
          />
        </div>
      </div>
    </Modal>
  );
}

/* ─── Schedule Meeting Modal ─────────────────────────────────── */
function ScheduleMeetingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addMeeting, addCalendarEvent, currentUser, users } = useAppStore();
  const [form, setForm] = useState({
    title: '', description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00', endTime: '11:00',
  });

  const handleSchedule = () => {
    if (!form.title.trim()) { toast.error('Please enter a meeting title'); return; }
    const start = new Date(`${form.date}T${form.startTime}:00`).toISOString();
    const end   = new Date(`${form.date}T${form.endTime}:00`).toISOString();
    const id    = generateId();

    addMeeting({
      id, companyId: 'company-1',
      title: form.title, description: form.description,
      hostId: currentUser?.id ?? 'user-1',
      participantIds: [currentUser?.id ?? 'user-1'],
      startTime: start, endTime: end,
      status: 'scheduled',
      roomUrl: `/meeting/office/${id}`,
      createdAt: new Date().toISOString(),
    });
    addCalendarEvent({
      id: generateId(), companyId: 'company-1',
      title: form.title, startDate: start, endDate: end,
      type: 'meeting', color: '#3b82f6',
      creatorId: currentUser?.id ?? 'user-1',
    });
    toast.success('Meeting scheduled!');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule Meeting"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button icon={<Video className="w-4 h-4" />} onClick={handleSchedule}>Schedule</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Meeting title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Weekly Standup" />
        <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Meeting agenda…" />
        <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start time" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
          <Input label="End time"   type="time" value={form.endTime}   onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────── */
export function EmployeeDashboard() {
  const router = useRouter();
  const {
    currentUser, users, projects, tasks, meetings,
    channels, announcements, notifications, activityLog,
    setActiveChannel,
  } = useAppStore();

  const [newTaskOpen,     setNewTaskOpen]     = useState(false);
  const [scheduleMtgOpen, setScheduleMtgOpen] = useState(false);

  if (!currentUser) return null;

  const myTasks      = tasks.filter(t => t.assigneeId === currentUser.id);
  const pendingTasks = myTasks.filter(t => t.status !== 'done');
  const today        = new Date().toDateString();
  const todayMtgs    = meetings.filter(m => new Date(m.startTime).toDateString() === today);
  const msgUnread    = channels.reduce((s, c) => s + (c.unreadCount ?? 0), 0);
  const myProjects   = projects.filter(p => p.memberIds.includes(currentUser.id));
  const onlineUsers  = users.filter(u => u.isOnline && u.id !== currentUser.id);

  const joinMeeting = (meetingId: string) => {
    const mtg = meetings.find(m => m.id === meetingId);
    if (mtg?.roomUrl) router.push(mtg.roomUrl);
    else toast('Meeting room link unavailable');
  };

  const msgUser = (userId: string) => {
    const dmChannel = channels.find(c =>
      c.type === 'direct' &&
      c.memberIds.includes(userId) &&
      c.memberIds.includes(currentUser.id)
    );
    if (dmChannel) {
      setActiveChannel(dmChannel.id);
      router.push('/messages');
    } else {
      router.push('/messages');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {getGreeting()}, {currentUser.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' · '}
            <span className="text-green-600 font-medium">{onlineUsers.length} colleagues online</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Video className="w-4 h-4" />}
            onClick={() => setScheduleMtgOpen(true)}
          >
            Schedule Meeting
          </Button>
          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setNewTaskOpen(true)}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* ── Stat row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Tasks"    value={pendingTasks.length}  icon={<CheckSquare className="w-5 h-5" />} color="#3b82f6" />
        <StatCard title="Today's Meetings" value={todayMtgs.length}     icon={<Calendar    className="w-5 h-5" />} color="#8b5cf6" />
        <StatCard title="Unread Messages"  value={msgUnread}            icon={<MessageSquare className="w-5 h-5" />} color="#ec4899" />
        <StatCard title="Active Projects"  value={myProjects.length}    icon={<TrendingUp  className="w-5 h-5" />} color="#f59e0b" />
      </div>

      {/* ── Main grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">

          {/* My Tasks */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">My Tasks</h3>
                {pendingTasks.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingTasks.length}
                  </span>
                )}
              </div>
              <Link href="/tasks" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {pendingTasks.slice(0, 5).map(task => {
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <div className={cn(
                      'w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center cursor-pointer',
                      task.status === 'done'
                        ? 'bg-green-500 border-green-500'
                        : 'border-[var(--border)] hover:border-blue-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</p>
                      {project && (
                        <p className="text-xs text-[var(--text-muted)] truncate">{project.name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && (
                        <span className={cn(
                          'text-xs hidden sm:block',
                          new Date(task.dueDate) < new Date() ? 'text-red-500 font-medium' : 'text-[var(--text-muted)]'
                        )}>
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {pendingTasks.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-[var(--text-primary)]">All caught up!</p>
                  <p className="text-xs text-[var(--text-muted)]">No pending tasks</p>
                </div>
              )}
              <div className="px-5 py-3">
                <button
                  onClick={() => setNewTaskOpen(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add task
                </button>
              </div>
            </div>
          </Card>

          {/* Active Projects */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Active Projects</h3>
              </div>
              <Link href="/projects" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myProjects.slice(0, 4).map(project => {
                const members = users.filter(u => project.memberIds.includes(u.id));
                return (
                  <Link
                    key={project.id}
                    href="/projects"
                    className="block p-4 rounded-xl border border-[var(--border)] hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{project.name}</p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    <Progress value={project.progress} size="xs" className="mb-2" />
                    <div className="flex items-center justify-between">
                      <AvatarGroup users={members.map(m => ({ name: m.name, src: m.avatar }))} max={3} size="xs" />
                      <span className="text-xs text-[var(--text-muted)]">{project.progress}%</span>
                    </div>
                  </Link>
                );
              })}
              {myProjects.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] py-4 col-span-2 text-center">
                  No active projects assigned
                </p>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <Link href="/admin" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Full log <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <div className="space-y-3">
              {activityLog.slice(0, 5).map(log => {
                const user = users.find(u => u.id === log.userId);
                return (
                  <div key={log.id} className="flex items-start gap-3">
                    {user && <Avatar name={user.name} src={user.avatar} size="xs" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-secondary)]">
                        <span className="font-medium text-[var(--text-primary)]">{user?.name ?? 'Unknown'}</span>
                        {' '}{log.action}{' '}
                        <span className="font-medium text-[var(--text-primary)]">{log.entityName ?? ''}</span>
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{formatRelativeTime(log.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right col */}
        <div className="space-y-5">

          {/* Today's meetings */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Today&apos;s Meetings</h3>
              </div>
              <Link href="/calendar" className="text-xs text-blue-600 hover:text-blue-700">Calendar</Link>
            </div>
            <div className="p-4 space-y-2">
              {todayMtgs.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-[var(--text-muted)]">No meetings today 🎉</p>
                </div>
              ) : (
                todayMtgs.map(meeting => {
                  const host = users.find(u => u.id === meeting.hostId);
                  return (
                    <div
                      key={meeting.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{meeting.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatTime(meeting.startTime)} · {meeting.participantIds.length} participants
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => joinMeeting(meeting.id)}
                      >
                        Join
                      </Button>
                    </div>
                  );
                })
              )}
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setScheduleMtgOpen(true)}
              >
                Schedule Meeting
              </Button>
            </div>
          </Card>

          {/* Team Online */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Team Online</h3>
                <span className="text-xs text-green-600 font-medium">{onlineUsers.length} active</span>
              </div>
              <Link href="/people" className="text-xs text-blue-600 hover:text-blue-700">Directory</Link>
            </div>
            <div className="p-3 space-y-1">
              {onlineUsers.slice(0, 5).map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <Avatar name={user.name} src={user.avatar} status={user.status} size="sm" showStatus />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.designation}</p>
                  </div>
                  <button
                    onClick={() => msgUser(user.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-blue-600 transition-colors"
                    title={`Message ${user.name}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Announcements */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Announcements</h3>
              </div>
              <Link href="/announcements" className="text-xs text-blue-600 hover:text-blue-700">All</Link>
            </div>
            <div className="p-4 space-y-3">
              {announcements.slice(0, 2).map(a => (
                <Link
                  key={a.id}
                  href="/announcements"
                  className="block p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">
                      {a.priority === 'urgent' ? '🚨' : a.priority === 'high' ? '📢' : '📌'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">{a.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{a.content}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{formatRelativeTime(a.publishDate)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <NewTaskModal         open={newTaskOpen}      onClose={() => setNewTaskOpen(false)} />
      <ScheduleMeetingModal open={scheduleMtgOpen}  onClose={() => setScheduleMtgOpen(false)} />
    </div>
  );
}
