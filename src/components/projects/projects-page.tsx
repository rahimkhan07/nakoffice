'use client';

import { useState } from 'react';
import {
  Plus, LayoutGrid, List, Search, Filter, Calendar,
  Users, TrendingUp, MoreHorizontal, ChevronRight, Kanban,
} from 'lucide-react';
import { cn, formatDate, getPriorityColor } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Modal } from '@/components/ui/modal';
import { useAppStore } from '@/store/app-store';
import type { Project } from '@/types';
import { KanbanBoard } from './kanban-board';

type View = 'grid' | 'list' | 'kanban';

function ProjectCard({ project }: { project: Project }) {
  const { users, tasks } = useAppStore();
  const members = users.filter(u => project.memberIds.includes(u.id));
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const doneTasks = projectTasks.filter(t => t.status === 'done');

  return (
    <Card hover className="cursor-pointer group">
      {/* Color bar */}
      <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: project.color ?? '#3b82f6' }} />

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
          {project.client && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{project.client}</p>
          )}
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[var(--bg-secondary)] transition-all">
          <MoreHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {project.description && (
        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center gap-3 mb-4 text-xs text-[var(--text-muted)]">
        <StatusBadge status={project.status} />
        <PriorityBadge priority={project.priority} />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[var(--text-muted)]">Progress</span>
          <span className="text-xs font-semibold text-[var(--text-primary)]">{project.progress}%</span>
        </div>
        <Progress value={project.progress} color={project.color} />
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
        <AvatarGroup users={members.map(m => ({ name: m.name, src: m.avatar }))} max={4} size="xs" />
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span>{doneTasks.length}/{projectTasks.length} tasks</span>
          {project.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(project.deadline)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addProject, currentUser, departments } = useAppStore();
  const [form, setForm] = useState({
    name: '', description: '', client: '',
    departmentId: '', deadline: '', priority: 'medium' as const,
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    addProject({
      id: `proj-${Date.now()}`,
      companyId: 'company-1',
      name: form.name,
      description: form.description,
      client: form.client,
      departmentId: form.departmentId,
      managerId: currentUser?.id ?? 'user-1',
      memberIds: [currentUser?.id ?? 'user-1'],
      startDate: new Date().toISOString(),
      deadline: form.deadline || new Date(Date.now() + 7776000000).toISOString(),
      status: 'planning',
      priority: form.priority,
      progress: 0,
      createdAt: new Date().toISOString(),
      color: ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b'][Math.floor(Math.random() * 5)],
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Project" size="md"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}>Create Project</Button></>}>
      <div className="space-y-4">
        <Input label="Project name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Website Redesign" required />
        <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Client" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} placeholder="Client name" />
          <Input label="Deadline" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
        </div>
      </div>
    </Modal>
  );
}

export function ProjectsPage() {
  const { projects, users, initialized, loading } = useAppStore();
  const [view, setView] = useState<View>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // ── Loading skeleton ──────────────────────────────────────────
  if (!initialized || loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 w-36 rounded-lg bg-[var(--bg-secondary)] animate-pulse mb-2" />
            <div className="h-4 w-48 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 space-y-3">
              <div className="h-1.5 w-full rounded-full bg-[var(--bg-secondary)] animate-pulse" />
              <div className="h-5 w-48 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />
              <div className="h-4 w-32 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />
              <div className="h-3 w-full rounded-full bg-[var(--bg-secondary)] animate-pulse mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedProjectId && selectedProject) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Project header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
          <button onClick={() => setSelectedProjectId(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm flex items-center gap-1">
            Projects
          </button>
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProject.color }} />
            <span className="font-semibold text-[var(--text-primary)]">{selectedProject.name}</span>
          </div>
          <StatusBadge status={selectedProject.status} />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedProjectId(null)}>
              ← Back
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <KanbanBoard projectId={selectedProjectId} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Projects</h2>
          <p className="text-sm text-[var(--text-muted)]">{projects.length} total · {projects.filter(p => p.status === 'in_progress').length} in progress</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Input placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />} inputSize="sm" className="w-64" />
        <div className="flex items-center gap-2">
          {['', 'planning', 'in_progress', 'review', 'completed'].map(s => (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)]'
              )}>
              {s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-0.5 border border-[var(--border)]">
          {([['grid', LayoutGrid], ['list', List], ['kanban', Kanban]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v as View)}
              className={cn('p-1.5 rounded-md transition-colors', view === v ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Projects grid/list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-primary)] font-medium">No projects found</p>
          <p className="text-[var(--text-muted)] text-sm">Create your first project to get started</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(p => (
            <div key={p.id} onClick={() => setSelectedProjectId(p.id)}>
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      ) : view === 'list' ? (
        <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                {['Project', 'Status', 'Priority', 'Progress', 'Team', 'Deadline'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(p => {
                const members = users.filter(u => p.memberIds.includes(u.id));
                return (
                  <tr key={p.id} onClick={() => setSelectedProjectId(p.id)}
                    className="hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="font-medium text-[var(--text-primary)]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={p.priority} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={p.progress} size="xs" className="w-20" />
                        <span className="text-xs text-[var(--text-muted)]">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AvatarGroup users={members.map(m => ({ name: m.name }))} max={3} size="xs" />
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{formatDate(p.deadline)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <KanbanBoard />
      )}

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
