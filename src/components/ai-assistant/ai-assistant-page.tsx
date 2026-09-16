'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, RotateCcw, Zap } from 'lucide-react';
import { cn, formatTime, generateId } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import type { AIMessage } from '@/types';

const SUGGESTIONS = [
  'What meetings do I have today?',
  'What are my pending tasks?',
  'Show active projects',
  'Who is online right now?',
  'Latest announcements',
  'Summarize my week',
  'Which tasks are overdue?',
  'Who is working on the Dubai project?',
];

function generateResponse(query: string, store: ReturnType<typeof useAppStore.getState>): string {
  const q = query.toLowerCase();
  const { meetings, tasks, projects, users, announcements, currentUser } = store;
  const now = new Date();

  if (q.includes('meeting') || q.includes('schedule')) {
    const today = meetings.filter(m => new Date(m.startTime).toDateString() === now.toDateString());
    if (!today.length) return "You have no meetings today. Enjoy the focused work time! 🎉";
    return `You have **${today.length}** meeting${today.length>1?'s':''} today:\n\n${today.map(m=>`• **${m.title}** at ${formatTime(m.startTime)} (${m.participantIds.length} participants)`).join('\n')}`;
  }
  if (q.includes('task') || q.includes('pending') || q.includes('todo') || q.includes('overdue')) {
    const mine = tasks.filter(t => t.assigneeId === currentUser?.id && t.status !== 'done');
    const overdue = mine.filter(t => t.dueDate && new Date(t.dueDate) < now);
    if (!mine.length) return "You have no pending tasks. All caught up! ✅";
    let resp = `You have **${mine.length}** pending tasks:\n\n`;
    if (overdue.length) resp += `🔴 **Overdue (${overdue.length}):** ${overdue.map(t=>t.title).join(', ')}\n\n`;
    const urgent = mine.filter(t=>t.priority==='urgent'&&!overdue.includes(t));
    if (urgent.length) resp += `⚠️ **Urgent:** ${urgent.map(t=>t.title).join(', ')}\n\n`;
    const rest = mine.filter(t=>!overdue.includes(t)&&t.priority!=='urgent');
    if (rest.length) resp += `📋 **Others:** ${rest.map(t=>t.title).join(', ')}`;
    return resp;
  }
  if (q.includes('project')) {
    const active = projects.filter(p=>p.status==='in_progress');
    return `**${active.length}** active projects:\n\n${active.map(p=>`• **${p.name}** — ${p.progress}% complete`).join('\n')}`;
  }
  if (q.includes('online') || q.includes('available') || q.includes('who')) {
    const online = users.filter(u=>u.isOnline);
    return `**${online.length}** team members online:\n\n${online.map(u=>`• ${u.name} — ${u.designation} (${u.status})`).join('\n')}`;
  }
  if (q.includes('announcement')) {
    return `Latest announcements:\n\n${announcements.slice(0,3).map(a=>`📢 **${a.title}**\n${a.content.slice(0,100)}…`).join('\n\n')}`;
  }
  if (q.includes('week') || q.includes('summary') || q.includes('summarize')) {
    const mine = tasks.filter(t=>t.assigneeId===currentUser?.id);
    const done = mine.filter(t=>t.status==='done').length;
    const active = projects.filter(p=>p.memberIds.includes(currentUser?.id??'')).length;
    return `**Your week at a glance:**\n\n✅ ${done} tasks completed\n📋 ${mine.filter(t=>t.status!=='done').length} tasks remaining\n📁 ${active} active projects\n📅 ${meetings.length} upcoming meetings\n\nKeep up the great work! 💪`;
  }
  if (q.includes('dubai') || q.includes('expo')) {
    const proj = projects.find(p=>p.name.toLowerCase().includes('dubai'));
    if (proj) {
      const members = users.filter(u=>proj.memberIds.includes(u.id));
      return `**Dubai Expo Campaign** (${proj.progress}% complete)\n\nTeam: ${members.map(m=>m.name).join(', ')}\nStatus: ${proj.status.replace(/_/g,' ')}\nPriority: ${proj.priority}`;
    }
    return "I couldn't find a Dubai Expo project. It may have been completed or archived.";
  }
  if (q.includes('hello')||q.includes('hi')||q.includes('hey')) {
    const h = now.getHours();
    const g = h<12?'Good morning':h<17?'Good afternoon':'Good evening';
    return `${g}, ${currentUser?.name?.split(' ')[0]}! 👋\n\nI'm your AI Office Assistant. I can help you with:\n\n• 📅 Today's meetings & schedule\n• ✅ Tasks & priorities\n• 📁 Project status & progress\n• 👥 Team availability\n• 📢 Announcements & updates\n\nWhat would you like to know?`;
  }
  return `I understand you're asking about **"${query}"**.\n\nAs your AI Office Assistant, I have access to your meetings, tasks, projects, and team information. Try asking:\n\n• "What meetings do I have today?"\n• "Show my pending tasks"\n• "Who is online?"\n• "Active project status"`;
}

export function AIAssistantPage() {
  const store = useAppStore();
  const { currentUser } = store;
  const [messages, setMessages] = useState<AIMessage[]>([{
    id: 'welcome', role:'assistant',
    content: `Hi ${currentUser?.name?.split(' ')[0] ?? 'there'}! 👋 I'm your AI Office Assistant. I can answer questions about your meetings, tasks, projects, team and more. What would you like to know?`,
    timestamp: new Date().toISOString(),
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages.length]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setMessages(m => [...m, { id:generateId(), role:'user', content, timestamp:new Date().toISOString() }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500 + Math.random()*400));
    const resp = generateResponse(content, useAppStore.getState());
    setMessages(m => [...m, { id:generateId(), role:'assistant', content:resp, timestamp:new Date().toISOString() }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-[var(--text-primary)]">Office AI</h2>
          <p className="text-xs text-[var(--text-muted)]">Powered by company context · Always up to date</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
          </span>
          <button onClick={() => setMessages(m => [m[0]])}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex gap-3', msg.role==='user' ? 'flex-row-reverse' : 'flex-row')}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={cn('max-w-[75%] rounded-2xl px-4 py-3 text-sm',
              msg.role==='user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-sm border border-[var(--border)]')}>
              <div className="whitespace-pre-line leading-relaxed"
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>') }} />
              <p className={cn('text-xs mt-2 opacity-70', msg.role==='user'?'text-right':'')}>{formatTime(msg.timestamp)}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"
                    style={{ animationDelay:`${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-2">
          <p className="text-xs text-[var(--text-muted)] mb-2">Quick questions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:border-blue-400 hover:text-blue-600 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-3 shrink-0">
        <div className="flex items-center gap-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] px-4 py-3">
          <Sparkles className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder="Ask AI anything about your work…"
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none" />
          <button onClick={() => send()} disabled={!input.trim()||loading}
            className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-700 transition-colors shrink-0">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-center text-xs text-[var(--text-muted)] mt-2">
          AI responses are based on your company data and respect your access permissions.
        </p>
      </div>
    </div>
  );
}
