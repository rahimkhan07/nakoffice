'use client';

import { useState } from 'react';
import { Plus, Users, FolderOpen, MessageSquare, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';

const DEPT_COLORS = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#06b6d4','#ef4444'];
const DEPT_ICONS  = ['⚙️','🎨','📣','💼','👥','💰','🔬','🚀','📊'];

export function DepartmentsPage() {
  const { departments, users, projects, addDepartment } = useAppStore();
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ name:'', description:'', icon:'⚙️', color:'#3b82f6' });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addDepartment({
      id: `dept-${Date.now()}`, companyId:'company-1',
      name: form.name, description: form.description,
      icon: form.icon, color: form.color,
      memberCount: 0, createdAt: new Date().toISOString(),
    });
    setModal(false);
    setForm({ name:'', description:'', icon:'⚙️', color:'#3b82f6' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Departments</h2>
          <p className="text-sm text-[var(--text-muted)]">{departments.length} departments · {users.length} total employees</p>
        </div>
        <Button onClick={() => setModal(true)} icon={<Plus className="w-4 h-4" />}>New Department</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {departments.map(dept => {
          const members  = users.filter(u => u.departmentId === dept.id);
          const head     = users.find(u => u.id === dept.headId);
          const deptProjs = projects.filter(p => p.departmentId === dept.id);

          return (
            <Card key={dept.id} hover className="overflow-hidden p-0">
              {/* Color header */}
              <div className="h-2" style={{ backgroundColor: dept.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${dept.color}20` }}>
                      {dept.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)]">{dept.name}</h3>
                      {head && <p className="text-xs text-[var(--text-muted)]">Head: {head.name}</p>}
                    </div>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {dept.description && (
                  <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{dept.description}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { icon: Users,       label: 'Members',  value: members.length  },
                    { icon: FolderOpen,  label: 'Projects', value: deptProjs.length },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-secondary)]">
                      <Icon className="w-4 h-4 text-[var(--text-muted)]" />
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{value}</p>
                        <p className="text-xs text-[var(--text-muted)]">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Members */}
                {members.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-4">
                    {members.slice(0, 5).map(m => (
                      <Avatar key={m.id} name={m.name} src={m.avatar} size="xs" showStatus status={m.status} />
                    ))}
                    {members.length > 5 && (
                      <span className="text-xs text-[var(--text-muted)] ml-1">+{members.length-5}</span>
                    )}
                  </div>
                )}

                <Button variant="secondary" size="sm" fullWidth icon={<MessageSquare className="w-3.5 h-3.5" />}>
                  Dept Chat
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New Department" size="md"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleAdd}>Create</Button></>}>
        <div className="space-y-4">
          <Input label="Department name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Engineering" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="What does this department do?" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Icon</p>
            <div className="flex flex-wrap gap-2">
              {DEPT_ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f=>({...f,icon}))}
                  className={cn('w-10 h-10 rounded-xl text-xl transition-all', form.icon===icon ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]')}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Color</p>
            <div className="flex gap-2">
              {DEPT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f=>({...f,color:c}))}
                  className={cn('w-8 h-8 rounded-lg transition-all', form.color===c && 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110')}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
