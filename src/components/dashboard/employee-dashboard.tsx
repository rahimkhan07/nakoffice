'use client';

import Link from 'next/link';
import {
  CheckSquare, Calendar, MessageSquare, Users, Megaphone,
  TrendingUp, Clock, ArrowRight, Video, Plus, Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { useAppStore } from '@/store/app-store';
import { formatRelativeTime, formatTime, cn } from '@/lib/utils';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function EmployeeDashboard() {
  const {
    currentUser, users, projects, tasks, meetings, channels,
    announcements, notifications, activityLog,
  } = useAppStore();

  if (!currentUser) return null;

  const myTasks    = tasks.filter(t => t.assigneeId === currentUser.id);
  const pendingTasks = myTasks.filter(t => t.status !== 'done');
  const today = new Date().toDateString();
  const todayMeetings = meetings.filter(m => new Date(m.startTime).toDateString() === today);
  const totalUnread = channels.reduce((s, c) => s + (c.unreadCount ?? 0), 0);
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const myProjects = projects.filter(p => p.memberIds.includes(currentUser.id));
  const onlineUsers = users.filter(u => u.isOnline && u.id !== currentUser.id);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Greeting header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {getGreeting()}, {currentUser.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' · '}
            <span className="text-green-600 font-medium">{onlineUsers.length} colleagues online</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" icon={<Video className="w-4 h-4" />}>
            Start Meeting
          </Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            New Task
          </Button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Tasks"   value={pendingTasks.length}   icon={<CheckSquare className="w-5 h-5" />} color="#3b82f6" change={{ value: -2, label: 'vs yesterday' }} />
        <StatCard title="Today's Meetings" value={todayMeetings.length} icon={<Calendar className="w-5 h-5" />}   color="#8b5cf6" />
        <StatCard title="Unread Messages" value={totalUnread}           icon={<MessageSquare className="w-5 h-5" />} color="#ec4899" change={{ value: totalUnread, label: 'new messages' }} />
        <StatCard title="Active Projects" value={myProjects.length}     icon={<TrendingUp className="w-5 h-5" />} color="#f59e0b" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Tasks */}
          <Card padding="none">
            <div className="px-5 pt-5 pb-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-[var(--text-primary)]">My Tasks</h3>
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
                  <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-secondary)] transition-colors">
                    <div className={cn(
                      'w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center',
                      task.status === 'done'
                        ? 'bg-green-500 border-green-500'
                        : 'border-[var(--border)]'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</p>
                      {project && <p className="text-xs text-[var(--text-muted)] truncate">{project.name}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && (
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {pendingTasks.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                  ✅ All tasks complete — great work!
                </div>
              )}
            </div>
          </Card>

          {/* Active Projects */}
          <Card padding="none">
            <div className="px-5 pt-5 pb-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-[var(--text-primary)]">Active Projects</h3>
              </div>
              <Link href="/projects" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myProjects.slice(0, 4).map(project => {
                const members = users.filter(u => project.memberIds.includes(u.id));
                return (
                  <div key={project.id}
                    className="p-4 rounded-xl border border-[var(--border)] hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
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
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right col */}
        <div className="space-y-6">
          {/* Today's meetings */}
          <Card padding="none">
            <div className="px-5 pt-5 pb-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-[var(--text-primary)]">Today&apos;s Meetings</h3>
              </div>
              <Link href="/calendar" className="text-xs text-blue-600 hover:text-blue-700">
                Calendar
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {todayMeetings.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">No meetings today 🎉</p>
              ) : (
                todayMeetings.map(meeting => {
                  const host = users.find(u => u.id === meeting.hostId);
                  return (
                    <div key={meeting.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{meeting.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatTime(meeting.startTime)} · {meeting.participantIds.length} participants
                        </p>
                        {host && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">Host: {host.name}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="xs">Join</Button>
                    </div>
                  );
                })
              )}
              <Button variant="secondary" size="sm" fullWidth icon={<Plus className="w-4 h-4" />}>
                Schedule Meeting
              </Button>
            </div>
          </Card>

          {/* Team online */}
          <Card padding="none">
            <div className="px-5 pt-5 pb-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-[var(--text-primary)]">Team Online</h3>
                <span className="text-xs text-green-600 font-medium">{onlineUsers.length} active</span>
              </div>
              <Link href="/people" className="text-xs text-blue-600 hover:text-blue-700">Directory</Link>
            </div>
            <div className="p-4 space-y-2">
              {onlineUsers.slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
                  <Avatar name={user.name} src={user.avatar} status={user.status} size="sm" showStatus />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.designation}</p>
                  </div>
                  <StatusBadge status={user.status} />
                </div>
              ))}
            </div>
          </Card>

          {/* Announcements */}
          <Card padding="none">
            <div className="px-5 pt-5 pb-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-600" />
                <h3 className="font-semibold text-[var(--text-primary)]">Announcements</h3>
              </div>
              <Link href="/announcements" className="text-xs text-blue-600 hover:text-blue-700">All</Link>
            </div>
            <div className="p-4 space-y-3">
              {announcements.slice(0, 2).map(a => (
                <div key={a.id} className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">{a.priority === 'urgent' ? '🚨' : a.priority === 'high' ? '📢' : '📌'}</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">{a.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{a.content}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{formatRelativeTime(a.publishDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

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
                    <span className="font-medium text-[var(--text-primary)]">{log.entityName}</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{formatRelativeTime(log.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
