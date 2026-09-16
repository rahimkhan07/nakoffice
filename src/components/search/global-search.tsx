'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, X, User, FolderOpen, CheckSquare, MessageSquare, File, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { useAppStore } from '@/store/app-store';

type ResultType = 'user' | 'project' | 'task' | 'message' | 'file' | 'department';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle?: string;
  href: string;
  avatar?: string;
}

const typeConfig: Record<ResultType, { icon: React.ElementType; color: string; label: string }> = {
  user:       { icon: User,          color: '#3b82f6', label: 'Person' },
  project:    { icon: FolderOpen,    color: '#8b5cf6', label: 'Project' },
  task:       { icon: CheckSquare,   color: '#f59e0b', label: 'Task' },
  message:    { icon: MessageSquare, color: '#06b6d4', label: 'Message' },
  file:       { icon: File,          color: '#ec4899', label: 'File' },
  department: { icon: Users,         color: '#10b981', label: 'Department' },
};

export function GlobalSearch() {
  const { searchOpen, setSearchOpen, users, projects, tasks, messages, files, departments } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Open with Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    users.filter(u => u.name.toLowerCase().includes(q) || u.designation?.toLowerCase().includes(q)).slice(0, 3).forEach(u =>
      found.push({ id: u.id, type: 'user', title: u.name, subtitle: u.designation, href: `/people`, avatar: u.avatar })
    );
    projects.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3).forEach(p =>
      found.push({ id: p.id, type: 'project', title: p.name, subtitle: p.status.replace(/_/g, ' '), href: `/projects` })
    );
    tasks.filter(t => t.title.toLowerCase().includes(q)).slice(0, 3).forEach(t =>
      found.push({ id: t.id, type: 'task', title: t.title, subtitle: t.status.replace(/_/g, ' '), href: `/tasks` })
    );
    files.filter(f => f.name.toLowerCase().includes(q)).slice(0, 2).forEach(f =>
      found.push({ id: f.id, type: 'file', title: f.name, href: `/files` })
    );
    departments.filter(d => d.name.toLowerCase().includes(q)).slice(0, 2).forEach(d =>
      found.push({ id: d.id, type: 'department', title: d.name, href: `/people` })
    );

    setResults(found);
    setSelectedIdx(0);
  }, [query, users, projects, tasks, files, departments]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) {
      router.push(results[selectedIdx].href);
      setSearchOpen(false);
    }
  };

  if (!searchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      onClick={() => setSearchOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-[var(--bg-elevated)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
          <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search employees, projects, tasks, files…"
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-xs bg-[var(--bg-secondary)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-muted)] font-mono">ESC</kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-96 overflow-y-auto py-2">
            {results.map((result, idx) => {
              const config = typeConfig[result.type];
              const Icon = config.icon;
              return (
                <li key={result.id}>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      idx === selectedIdx ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-[var(--bg-secondary)]'
                    )}
                    onClick={() => { router.push(result.href); setSearchOpen(false); }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      {result.type === 'user' && result.title ? (
                        <Avatar name={result.title} size="xs" />
                      ) : (
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-[var(--text-muted)] truncate capitalize">{result.subtitle}</p>
                      )}
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${config.color}20`, color: config.color }}
                    >
                      {config.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {query && results.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-[var(--text-muted)]">No results for &quot;{query}&quot;</p>
          </div>
        )}

        {!query && (
          <div className="px-4 py-4">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Quick access</p>
            <div className="flex flex-wrap gap-2">
              {['Virtual Office', 'My Tasks', 'Projects', 'Messages', 'Files'].map(item => (
                <button
                  key={item}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  onClick={() => setQuery(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
