'use client';

import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Video, Calendar,
  Clock, Users, Flag, Coffee,
} from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input, Select } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import type { CalendarEvent } from '@/types';
import { generateId } from '@/lib/utils';

type ViewMode = 'month' | 'week' | 'day';

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const typeConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  meeting:  { color: '#3b82f6', icon: Video,    label: 'Meeting'  },
  deadline: { color: '#ef4444', icon: Flag,     label: 'Deadline' },
  event:    { color: '#8b5cf6', icon: Calendar, label: 'Event'    },
  holiday:  { color: '#10b981', icon: Coffee,   label: 'Holiday'  },
};

function EventPill({ event }: { event: CalendarEvent }) {
  const cfg = typeConfig[event.type] ?? typeConfig.event;
  return (
    <div
      className="text-xs px-1.5 py-0.5 rounded-md truncate text-white font-medium cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundColor: event.color ?? cfg.color }}
      title={event.title}
    >
      {event.allDay ? '' : formatTime(event.startDate) + ' '}
      {event.title}
    </div>
  );
}

export function CalendarPage() {
  const { calendarEvents, addCalendarEvent, meetings, currentUser } = useAppStore();
  const [view,      setView]      = useState<ViewMode>('month');
  const [current,   setCurrent]   = useState(new Date());
  const [modal,     setModal]     = useState(false);
  const [newEvent,  setNewEvent]  = useState({ title: '', type: 'event', date: '', time: '', endDate: '', endTime: '', description: '' });

  const year  = current.getFullYear();
  const month = current.getMonth();

  const prevMonth = () => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday   = () => setCurrent(new Date());

  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build calendar grid (6 rows × 7 cols)
  const grid: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (grid.length % 7 !== 0) grid.push(null);

  const eventsOnDay = (day: number) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return calendarEvents.filter(e => e.startDate.startsWith(dateStr));
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    addCalendarEvent({
      id: generateId(),
      companyId: 'company-1',
      title: newEvent.title,
      description: newEvent.description,
      startDate: newEvent.date + (newEvent.time ? `T${newEvent.time}:00Z` : 'T00:00:00Z'),
      endDate:   newEvent.endDate ? newEvent.endDate + (newEvent.endTime ? `T${newEvent.endTime}:00Z` : 'T00:00:00Z') : newEvent.date + 'T01:00:00Z',
      allDay: !newEvent.time,
      type: newEvent.type as CalendarEvent['type'],
      color: typeConfig[newEvent.type]?.color,
      creatorId: currentUser?.id ?? 'user-1',
    });
    setModal(false);
    setNewEvent({ title:'', type:'event', date:'', time:'', endDate:'', endTime:'', description:'' });
  };

  // Upcoming events (next 7 days)
  const upcomingEvents = calendarEvents
    .filter(e => new Date(e.startDate) >= today)
    .sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col p-4 shrink-0 overflow-y-auto">
        <Button onClick={() => setModal(true)} fullWidth icon={<Plus className="w-4 h-4" />} className="mb-4">
          New Event
        </Button>

        {/* Mini month picker — reuse same logic */}
        <div className="text-xs font-semibold text-[var(--text-muted)] mb-3 uppercase tracking-wide">Upcoming Events</div>
        <div className="space-y-2">
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">No upcoming events</p>
          ) : (
            upcomingEvents.map(ev => {
              const cfg = typeConfig[ev.type] ?? typeConfig.event;
              const Icon = cfg.icon;
              return (
                <div key={ev.id} className="flex items-start gap-2 p-2 rounded-xl hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${ev.color ?? cfg.color}20` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: ev.color ?? cfg.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{ev.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(ev.startDate).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                      {!ev.allDay && ' · ' + formatTime(ev.startDate)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Legend</p>
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-xs text-[var(--text-secondary)]">{cfg.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main calendar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <h2 className="font-semibold text-[var(--text-primary)]">{MONTHS[month]} {year}</h2>
          <Button variant="secondary" size="xs" onClick={goToday}>Today</Button>
          <div className="ml-auto flex items-center gap-1 bg-[var(--bg-secondary)] p-0.5 rounded-lg border border-[var(--border)]">
            {(['month','week','day'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors',
                  view === v ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Month grid */}
        {view === 'month' && (
          <div className="flex-1 overflow-auto p-0">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[var(--border)]">
              {DAYS.map(d => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            <div className="grid grid-cols-7 flex-1">
              {grid.map((day, idx) => {
                const events = day ? eventsOnDay(day) : [];
                return (
                  <div key={idx}
                    className={cn(
                      'min-h-28 border-b border-r border-[var(--border)] p-1.5',
                      !day && 'bg-[var(--bg-secondary)] opacity-50',
                      day && 'hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors'
                    )}>
                    {day && (
                      <>
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1',
                          isToday(day) ? 'bg-blue-600 text-white' : 'text-[var(--text-secondary)]'
                        )}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {events.slice(0, 3).map(ev => (
                            <EventPill key={ev.id} event={ev} />
                          ))}
                          {events.length > 3 && (
                            <p className="text-xs text-[var(--text-muted)] pl-1">+{events.length-3} more</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week/Day views — simplified list */}
        {(view === 'week' || view === 'day') && (
          <div className="flex-1 overflow-auto p-5">
            <div className="space-y-3">
              {calendarEvents
                .sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map(ev => {
                  const cfg = typeConfig[ev.type] ?? typeConfig.event;
                  const Icon = cfg.icon;
                  return (
                    <div key={ev.id} className="flex items-start gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${ev.color ?? cfg.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: ev.color ?? cfg.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--text-primary)]">{ev.title}</p>
                        {ev.description && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{ev.description}</p>}
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {new Date(ev.startDate).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
                          {!ev.allDay && ' · ' + formatTime(ev.startDate)}
                        </p>
                      </div>
                      <Badge variant={ev.type === 'deadline' ? 'danger' : ev.type === 'meeting' ? 'info' : 'purple'}>
                        {cfg.label}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* New Event Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Event" size="md"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleAddEvent}>Create Event</Button></>}>
        <div className="space-y-4">
          <Input label="Event title" value={newEvent.title} onChange={e => setNewEvent(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Team standup" />
          <Select label="Type" value={newEvent.type} onChange={e => setNewEvent(f => ({ ...f, type: e.target.value }))}
            options={Object.entries(typeConfig).map(([k,v]) => ({ value:k, label:v.label }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={newEvent.date} onChange={e => setNewEvent(f => ({ ...f, date: e.target.value }))} />
            <Input label="Time (optional)" type="time" value={newEvent.time} onChange={e => setNewEvent(f => ({ ...f, time: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="End date" type="date" value={newEvent.endDate} onChange={e => setNewEvent(f => ({ ...f, endDate: e.target.value }))} />
            <Input label="End time" type="time" value={newEvent.endTime} onChange={e => setNewEvent(f => ({ ...f, endTime: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
