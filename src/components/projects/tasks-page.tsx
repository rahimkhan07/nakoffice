'use client';

import { useState } from 'react';
import { Plus, Search, Filter, CheckSquare, Calendar, User } from 'lucide-react';
import { cn, formatDate, generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge, PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { useAppStore } from '@/store/app-store';
import type { Task } from '@/types';

function TaskRow({ task }: { task: Task }) {
  const { users, projects, updateTask } = useAppStore();
  const assignee = users.find(u => u.id === task.assigneeId);
  const project  = projects.find(p => p.id === task.projectId);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors group border-b border-[var(--border)] last:border-0">
      <button
        onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
        className={cn(
          'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
          task.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-[var(--border)] hover:border-blue-400'
        )}
      >
        {task.status === 'done' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', task.status === 'done' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]')}>
          {task.title}
        </p>
        {project && <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{project.name}</p>}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        {task.dueDate && (
          <span className={cn('text-xs flex items-center gap-1 hidden sm:flex',
            new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500' : 'text-[var(--text-muted)]')}>
            <Calendar className="w-3 h-3" />{formatDate(task.dueDate)}
          </span>
        )}
        {assignee
          ? <Avatar name={assignee.name} src={assignee.avatar} size="xs" />
          : <div className="w-6 h-6 rounded-full border-2 border-dashed border-[var(--border)]" />
        }
      </div>
    </div>
  );
}

export function TasksPage() {
  const { tasks, projects, users, currentUser, addTask } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [priorityF, setPriorityF] = useState('');
  const [projectF, setProjectF] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium' as Task['priority'], projectId: '', dueDate: '', assigneeId: '' });

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusF && t.status !== statusF) return false;
    if (priorityF && t.priority !== priorityF) return false;
    if (projectF && t.projectId !== projectF) return false;
    return true;
  });

  const grouped = {
    urgent:      filtered.filter(t => t.priority === 'urgent' && t.status !== 'done'),
    in_progress: filtered.filter(t => t.status === 'in_progress' && t.priority !== 'urgent'),
    todo:        filtered.filter(t => t.status === 'todo' && t.priority !== 'urgent'),
    review:      filtered.filter(t => t.status === 'review'),
    done:        filtered.filter(t => t.status === 'done'),
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask({
      id: generateId(), companyId: 'company-1',
      projectId: form.projectId || projects[0]?.id,
      title: form.title, description: '',
      assigneeId: form.assigneeId || undefined,
      reporterId: currentUser?.id ?? 'user-1',
      status: 'todo', priority: form.priority,
      dueDate: form.dueDate || undefined,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), order: Date.now(),
    });
    setModal(false);
    setForm({ title: '', priority: 'medium', projectId: '', dueDate: '', assigneeId: '' });
  };

  const GroupSection = ({ label, items, color }: { label: string; items: Task[]; color: string }) =>
    items.length > 0 ? (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{label}</h3>
          <span className="text-xs text-[var(--text-muted)]">({items.length})</span>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
          {items.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      </div>
    ) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Tasks</h2>
          <p className="text-sm text-[var(--text-muted)]">{filtered.filter(t => t.status !== 'done').length} pending · {filtered.filter(t => t.status === 'done').length} done</p>
        </div>
        <Button onClick={() => setModal(true)} icon={<Plus className="w-4 h-4" />}>New Task</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Input placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />} inputSize="sm" className="w-52" />
        <select value={statusF} onChange={e => setStatusF(e.target.value)}
          className="h-8 px-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          {['todo','in_progress','review','done'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
        <select value={priorityF} onChange={e => setPriorityF(e.target.value)}
          className="h-8 px-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Priority</option>
          {['urgent','high','medium','low'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={projectF} onChange={e => setProjectF(e.target.value)}
          className="h-8 px-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <GroupSection label="Urgent" items={grouped.urgent} color="#ef4444" />
      <GroupSection label="In Progress" items={grouped.in_progress} color="#3b82f6" />
      <GroupSection label="To Do" items={grouped.todo} color="#94a3b8" />
      <GroupSection label="In Review" items={grouped.review} color="#8b5cf6" />
      <GroupSection label="Done" items={grouped.done} color="#22c55e" />
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <CheckSquare className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="font-medium text-[var(--text-primary)]">No tasks found</p>
          <p className="text-sm text-[var(--text-muted)]">Create your first task to get started</p>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Task" size="md"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleAdd}>Create Task</Button></>}>
        <div className="space-y-4">
          <Input label="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What needs to be done?" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}
              options={[{value:'low',label:'Low'},{value:'medium',label:'Medium'},{value:'high',label:'High'},{value:'urgent',label:'Urgent'}]} />
            <Select label="Project" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
              options={[{value:'',label:'Select project'},...projects.map(p => ({value:p.id,label:p.name}))]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Due date" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            <Select label="Assignee" value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}
              options={[{value:'',label:'Unassigned'},...users.map(u => ({value:u.id,label:u.name}))]} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
