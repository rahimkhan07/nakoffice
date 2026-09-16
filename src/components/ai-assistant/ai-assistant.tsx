'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ChevronDown } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import type { AIMessage } from '@/types';
import { generateId } from '@/lib/utils';

const QUICK_PROMPTS = [
  "What meetings do I have today?",
  "What are my pending tasks?",
  "Show active projects",
  "Who is online now?",
  "Latest announcements",
];

function generateAIResponse(query: string, store: ReturnType<typeof useAppStore.getState>): string {
  const q = query.toLowerCase();
  const { meetings, tasks, projects, users, announcements, currentUser } = store;
  const now = new Date();
  const today = now.toDateString();

  if (q.includes('meeting') || q.includes('schedule')) {
    const todayMeetings = meetings.filter(m => new Date(m.startTime).toDateString() === today);
    if (todayMeetings.length === 0) return "You have no meetings scheduled for today. Enjoy the focused work time! 🎉";
    return `You have **${todayMeetings.length}** meeting${todayMeetings.length > 1 ? 's' : ''} today:\n\n${todayMeetings.map(m => `• **${m.title}** at ${formatTime(m.startTime)}`).join('\n')}\n\nWould you like to join any of these meetings?`;
  }

  if (q.includes('task') || q.includes('pending') || q.includes('todo')) {
    const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id && t.status !== 'done');
    if (myTasks.length === 0) return "All tasks done! You have nothing pending. Great work! ✅";
    const byStatus = {
      urgent:   myTasks.filter(t => t.priority === 'urgent'),
      in_prog:  myTasks.filter(t => t.status === 'in_progress'),
      todo:     myTasks.filter(t => t.status === 'todo'),
    };
    return `You have **${myTasks.length}** pending tasks:\n\n${byStatus.urgent.length > 0 ? `🔴 **Urgent (${byStatus.urgent.length}):** ${byStatus.urgent.map(t => t.title).join(', ')}\n` : ''}${byStatus.in_prog.length > 0 ? `🔵 **In Progress (${byStatus.in_prog.length}):** ${byStatus.in_prog.map(t => t.title).join(', ')}\n` : ''}${byStatus.todo.length > 0 ? `⚪ **To Do (${byStatus.todo.length}):** ${byStatus.todo.map(t => t.title).join(', ')}` : ''}`;
  }

  if (q.includes('project')) {
    const active = projects.filter(p => p.status === 'in_progress');
    return `You have **${active.length}** active projects:\n\n${active.map(p => `• **${p.name}** — ${p.progress}% complete (${p.status.replace(/_/g, ' ')})`).join('\n')}`;
  }

  if (q.includes('online') || q.includes('available') || q.includes('who is')) {
    const online = users.filter(u => u.isOnline);
    return `**${online.length}** team members are online right now:\n\n${online.map(u => `• ${u.name} — ${u.designation} (${u.status})`).join('\n')}`;
  }

  if (q.includes('announcement')) {
    const recent = announcements.slice(0, 2);
    return `Latest announcements:\n\n${recent.map(a => `📢 **${a.title}**\n${a.content.slice(0, 120)}…`).join('\n\n')}`;
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${currentUser?.name?.split(' ')[0]}! 👋 I'm your AI Office Assistant. I can help you with:\n\n• 📅 Meetings & schedules\n• ✅ Tasks & priorities\n• 📁 Projects & progress\n• 👥 Team availability\n• 📢 Announcements\n\nWhat would you like to know?`;
  }

  return `I understand you're asking about **"${query}"**. As your AI Office Assistant, I have access to your meetings, tasks, projects, and team information.\n\nTry asking me:\n• "What meetings do I have today?"\n• "Show my pending tasks"\n• "Which team members are online?"\n• "What's the status of active projects?"`;
}

export function AIAssistant() {
  const { aiOpen, setAiOpen, currentUser } = useAppStore();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${currentUser?.name?.split(' ')[0] ?? 'there'}! 👋 I'm your AI Office Assistant. Ask me about meetings, tasks, projects, or your team.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const store = useAppStore.getState();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;

    const userMsg: AIMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI response delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    const response = generateAIResponse(content, store);
    const aiMsg: AIMessage = {
      id: generateId(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      {!aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          className={cn(
            'fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl',
            'bg-gradient-to-br from-blue-600 to-purple-600 text-white',
            'shadow-lg hover:shadow-xl flex items-center justify-center',
            'transition-all duration-200 hover:scale-110 active:scale-95',
            'animate-pulse-ring'
          )}
          aria-label="Open AI Assistant"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {aiOpen && (
        <div className={cn(
          'fixed bottom-6 right-6 z-40 w-96 h-[520px] rounded-2xl',
          'bg-[var(--bg-elevated)] border border-[var(--border)] shadow-2xl',
          'flex flex-col overflow-hidden'
        )}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Office AI</p>
              <p className="text-blue-100 text-xs">Always ready to help</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <button
                onClick={() => setAiOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors ml-1"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-sm'
                  )}
                >
                  <div
                    className="whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                  <p className={cn('text-xs mt-1', msg.role === 'user' ? 'text-blue-200' : 'text-[var(--text-muted)]')}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-secondary)] rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-colors border border-[var(--border)]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] px-3 py-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                placeholder="Ask AI anything…"
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-700 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
