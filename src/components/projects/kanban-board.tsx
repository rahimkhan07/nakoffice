'use client';

import { useState } from 'react';
import { Plus, GripVertical, MoreHorizontal, Calendar, User, ChevronDown } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { PriorityBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea, Select } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import type { Task } from '@/types';
import { generateId } from '@/lib/utils';

const COLUMNS: { id: Task['status']; label: string; color: string }[] = [
  { id: 'todo',        label: 'To Do',       color: '#94a3b8' },
  { id: 'in_progress', label: 'In Progress',  color: '#3b82f6' },
  { id: 'review',      label: 'Review',       color: '#8b5cf6' },
  { id: 'done',        label: 'Done',         color: '#22c55e' },
];

function TaskCard({ task, onDragStart }: { task: Task; onDragStart: (id: string) => void }) {
  const { users, projects } = useAppStore();
  const assignee = users.find(u => u.id === task.assigneeId);
  const project  = projects.find(p => p.id === task.projectId);
  const doneCount = task.checklist?.filter(c => c.completed).length ?? 0;
  const totalCount = task.checklist?.length ?? 0;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-[var(--text-primary)] leading-tight flex-1">{task.title}</p>
        <button className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {project && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
          <span className="text-xs text-[var(--text-muted)] truncate">{project.name}</span>
        </div>
      )}

      {task.description && (
        <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)] text-xs text-[var(--text-muted)]">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Checklist progress */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2 mb-2 text-xs text-[var(--text-muted)]">
          <div className="flex-1 h-1 rounded-full bg-[var(--bg-secondary)]">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
          <span>{doneCount}/{totalCount}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={cn(
              'text-xs flex items-center gap-1',
              new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-[var(--text-muted)]'
            )}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
          {assignee && (
            <Avatar name={assignee.name} src={assignee.avatar} size="xs" />
          )}
        </div>
      </div>
    </div>
  );
}

function AddTaskModal({ open, onClose, status, projectId }: {
  open: boolean; onClose: () => void; status: Task['status']; projectId?: string;
}) {
  const { addTask, currentUser, users, projects } = useAppStore();
  const [form, setForm] = useState({
    title: '', description: '', assigneeId: '', priority: 'medium' as Task['priority'],
    dueDate: '', projectId: projectId ?? '',
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask({
      id: generateId(),
      companyId: 'company-1',
      projectId: form.projectId || projectId || projects[0]?.id,
      title: form.title,
      description: form.description,
      assigneeId: form.assigneeId || undefined,
      reporterId: currentUser?.id ?? 'user-1',
      status,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: Date.now(),
    });
    onClose();
    setForm({ title: '', description: '', assigneeId: '', priority: 'medium', dueDate: '', projectId: projectId ?? '' });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Task" size="md"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleAdd}>Add Task</Button></>}>
      <div className="space-y-4">
        <Input label="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What needs to be done?" required />
        <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Add more details…" rows={3} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Assignee" value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}
            options={[{ value: '', label: 'Unassigned' }, ...users.map(u => ({ value: u.id, label: u.name }))]} />
          <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}
            options={[
              { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' },
            ]} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Due date" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          {!projectId && (
            <Select label="Project" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
              options={projects.map(p => ({ value: p.id, label: p.name }))} />
          )}
        </div>
      </div>
    </Modal>
  );
}

export function KanbanBoard({ projectId }: { projectId?: string }) {
  const { tasks, moveTask } = useAppStore();
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Task['status'] | null>(null);
  const [addModal, setAddModal] = useState<{ status: Task['status'] } | null>(null);

  const filtered = projectId ? tasks.filter(t => t.projectId === projectId) : tasks;

  const handleDrop = (status: Task['status']) => {
    if (dragging) moveTask(dragging, status);
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="h-full flex gap-4 p-5 overflow-x-auto">
      {COLUMNS.map(col => {
        const colTasks = filtered.filter(t => t.status === col.id).sort((a, b) => a.order - b.order);
        return (
          <div
            key={col.id}
            className="flex flex-col min-w-72 w-72 shrink-0"
            onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
            onDrop={() => handleDrop(col.id)}
            onDragLeave={() => setDragOver(null)}
          >
            {/* Column header */}
            <div className={cn(
              'flex items-center justify-between mb-3 p-3 rounded-xl border transition-colors',
              dragOver === col.id
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
                : 'bg-[var(--bg-secondary)] border-[var(--border)]'
            )}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-sm font-semibold text-[var(--text-primary)]">{col.label}</span>
                <span className="bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-xs font-medium px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => setAddModal({ status: col.id })}
                className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Tasks */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pb-2 min-h-24">
              {colTasks.map(task => (
                <TaskCard key={task.id} task={task} onDragStart={setDragging} />
              ))}
              {colTasks.length === 0 && (
                <div className={cn(
                  'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
                  dragOver === col.id
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-[var(--border)]'
                )}>
                  <p className="text-xs text-[var(--text-muted)]">Drop tasks here</p>
                </div>
              )}
            </div>

            {/* Add task button */}
            <button
              onClick={() => setAddModal({ status: col.id })}
              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors w-full"
            >
              <Plus className="w-4 h-4" />
              Add task
            </button>
          </div>
        );
      })}

      {addModal && (
        <AddTaskModal
          open={true}
          onClose={() => setAddModal(null)}
          status={addModal.status}
          projectId={projectId}
        />
      )}
    </div>
  );
}
