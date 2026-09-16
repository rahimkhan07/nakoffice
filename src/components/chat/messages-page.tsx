'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Plus, Hash, Lock, Users, MessageSquare,
  Send, Paperclip, Smile, Reply, MoreHorizontal, Pin,
  Check, CheckCheck,
} from 'lucide-react';
import { cn, getAvatarColor, formatTime, formatRelativeTime, generateId } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useAppStore } from '@/store/app-store';
import type { Channel, Message } from '@/types';
import toast from 'react-hot-toast';

const QUICK_REACTIONS = ['👍','❤️','😂','🔥','🎉','👀'];

/* ─────────────────────────────────────────────────────────────
   Hoisted ChannelItem — defined at module scope, not inside render
   ─────────────────────────────────────────────────────────────*/
const channelTypeIcon: Record<Channel['type'], React.ElementType> = {
  company:    Hash,
  department: Hash,
  group:      Users,
  direct:     MessageSquare,
};

interface ChannelItemProps {
  channel:       Channel;
  active:        boolean;
  currentUserId: string;
  users:         ReturnType<typeof useAppStore.getState>['users'];
  onSelect:      (id: string) => void;
}

function ChannelItem({ channel, active, currentUserId, users, onSelect }: ChannelItemProps) {
  const Icon = channelTypeIcon[channel.type];
  const displayName = channel.type === 'direct'
    ? (users.find(u => u.id === channel.memberIds.find(id => id !== currentUserId))?.name ?? channel.name)
    : channel.name;

  const dmUser = channel.type === 'direct'
    ? users.find(u => u.id === channel.memberIds.find(id => id !== currentUserId))
    : null;

  return (
    <button
      onClick={() => onSelect(channel.id)}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all',
        active
          ? 'bg-blue-600 text-white'
          : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
      )}
    >
      {dmUser ? (
        <Avatar name={dmUser.name} src={dmUser.avatar} status={dmUser.status} size="xs" showStatus />
      ) : (
        <Icon className="w-4 h-4 shrink-0 opacity-70" />
      )}
      <span className={cn(
        'flex-1 text-sm truncate',
        (channel.unreadCount ?? 0) > 0 && !active && 'font-semibold text-[var(--text-primary)]'
      )}>
        {displayName}
      </span>
      {(channel.unreadCount ?? 0) > 0 && !active && (
        <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shrink-0 min-w-[20px] text-center">
          {channel.unreadCount}
        </span>
      )}
    </button>
  );
}

/* ─── Channel list sidebar ───────────────────────────── */
function ChannelList() {
  const {
    channels, activeChannelId, setActiveChannel, markChannelRead,
    currentUser, users, addChannel,
  } = useAppStore();

  const [search,     setSearch]     = useState('');
  const [newChanOpen, setNewChanOpen] = useState(false);
  const [newChan,     setNewChan]     = useState({ name: '', type: 'group' as Channel['type'] });

  const filtered = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = useCallback((id: string) => {
    setActiveChannel(id);
    markChannelRead(id);
  }, [setActiveChannel, markChannelRead]);

  const handleCreateChannel = () => {
    if (!newChan.name.trim()) { toast.error('Channel name required'); return; }
    addChannel({
      id:        generateId(),
      companyId: 'company-1',
      name:      newChan.name.trim(),
      type:      newChan.type,
      memberIds: [currentUser?.id ?? 'user-1'],
      createdAt: new Date().toISOString(),
      unreadCount: 0,
    });
    toast.success(`Channel #${newChan.name} created`);
    setNewChanOpen(false);
    setNewChan({ name: '', type: 'group' });
  };

  const groups: { label: string; channels: Channel[] }[] = [
    { label: 'Company',         channels: filtered.filter(c => c.type === 'company')    },
    { label: 'Departments',     channels: filtered.filter(c => c.type === 'department') },
    { label: 'Groups',          channels: filtered.filter(c => c.type === 'group')      },
    { label: 'Direct Messages', channels: filtered.filter(c => c.type === 'direct')     },
  ].filter(g => g.channels.length > 0);

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--text-primary)]">Messages</h2>
          <button
            onClick={() => setNewChanOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="New channel"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <Input
          placeholder="Search channels…"
          inputSize="sm"
          leftIcon={<Search className="w-3.5 h-3.5" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Channel groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {groups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-3 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.channels.map(ch => (
                <ChannelItem
                  key={ch.id}
                  channel={ch}
                  active={ch.id === activeChannelId}
                  currentUserId={currentUser?.id ?? ''}
                  users={users}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* New Channel Modal */}
      <Modal
        open={newChanOpen}
        onClose={() => setNewChanOpen(false)}
        title="New Channel"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewChanOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateChannel}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Channel name"
            value={newChan.name}
            onChange={e => setNewChan(n => ({ ...n, name: e.target.value }))}
            placeholder="e.g. project-updates"
          />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Type</p>
            <div className="flex gap-2">
              {(['group', 'company'] as Channel['type'][]).map(t => (
                <button
                  key={t}
                  onClick={() => setNewChan(n => ({ ...n, type: t }))}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition-colors',
                    newChan.type === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-blue-400'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </aside>
  );
}

/* ─── Message bubble ─────────────────────────────────── */
function MessageBubble({
  message,
  showAvatar,
  onReply,
}: {
  message:    Message;
  showAvatar: boolean;
  onReply:    (m: Message) => void;
}) {
  const { users, currentUser, addReaction } = useAppStore();
  const sender = users.find(u => u.id === message.senderId);
  const isMe   = message.senderId === currentUser?.id;
  const [showEmojiBar, setShowEmojiBar] = useState(false);

  return (
    <div
      className={cn(
        'flex gap-3 group',
        isMe ? 'flex-row-reverse' : 'flex-row',
        showAvatar ? 'mt-4' : 'mt-1'
      )}
      onMouseEnter={() => setShowEmojiBar(true)}
      onMouseLeave={() => setShowEmojiBar(false)}
    >
      {/* Avatar spacer */}
      {!isMe && (
        showAvatar
          ? <Avatar name={sender?.name ?? '?'} src={sender?.avatar} size="sm" />
          : <div className="w-8 shrink-0" />
      )}

      <div className={cn('max-w-[70%] flex flex-col', isMe ? 'items-end' : 'items-start')}>
        {/* Sender + time */}
        {showAvatar && !isMe && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-semibold text-[var(--text-primary)]">{sender?.name}</span>
            <span className="text-[11px] text-[var(--text-muted)]">{formatTime(message.createdAt)}</span>
          </div>
        )}

        <div className="relative">
          {/* Bubble */}
          <div className={cn(
            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
            isMe
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-sm border border-[var(--border)]'
          )}>
            {message.content}
            {isMe && (
              <span className="ml-2 inline-flex opacity-75">
                <CheckCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Existing reactions */}
          {message.reactions && Object.values(message.reactions).some(r => r.length > 0) && (
            <div className={cn('flex flex-wrap gap-1 mt-1', isMe ? 'justify-end' : '')}>
              {Object.entries(message.reactions).map(([emoji, reactors]) =>
                reactors.length > 0 ? (
                  <button
                    key={emoji}
                    onClick={() => currentUser && addReaction(message.id, emoji, currentUser.id)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors',
                      reactors.includes(currentUser?.id ?? '')
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    {emoji} <span className="font-medium">{reactors.length}</span>
                  </button>
                ) : null
              )}
            </div>
          )}

          {/* Hover action bar */}
          {showEmojiBar && (
            <div className={cn(
              'absolute -top-8 flex items-center gap-0.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-1 py-1 shadow-lg z-10',
              isMe ? 'right-0' : 'left-0'
            )}>
              {QUICK_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => currentUser && addReaction(message.id, emoji, currentUser.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--bg-secondary)] text-base transition-colors"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
              <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
              <button
                onClick={() => onReply(message)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Reply"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {isMe && (
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {formatTime(message.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Chat area ──────────────────────────────────────── */
function ChatArea() {
  const {
    activeChannelId, channels, messages,
    sendMessage, currentUser, users,
  } = useAppStore();

  const [input,        setInput]        = useState('');
  const [replyTo,      setReplyTo]      = useState<Message | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);

  const channel         = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleSend = () => {
    if (!input.trim() || !currentUser || !activeChannelId) return;
    sendMessage({
      id:        generateId(),
      channelId: activeChannelId,
      senderId:  currentUser.id,
      content:   input.trim(),
      type:      'text',
      replyTo:   replyTo?.id,
      createdAt: new Date().toISOString(),
    });
    setInput('');
    setReplyTo(null);
  };

  const handleAttach = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !activeChannelId) return;
    sendMessage({
      id:        generateId(),
      channelId: activeChannelId,
      senderId:  currentUser.id,
      content:   `📎 Shared a file: ${file.name}`,
      type:      'file',
      createdAt: new Date().toISOString(),
    });
    toast.success(`${file.name} shared`);
    e.target.value = '';
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="font-semibold text-[var(--text-primary)]">Select a conversation</p>
          <p className="text-sm text-[var(--text-muted)]">Choose a channel to start messaging</p>
        </div>
      </div>
    );
  }

  const dmUser = channel.type === 'direct'
    ? users.find(u => u.id === channel.memberIds.find(id => id !== currentUser?.id))
    : null;
  const displayName = dmUser?.name ?? (channel.type !== 'direct' ? `#${channel.name}` : channel.name);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
        {dmUser ? (
          <Avatar name={dmUser.name} src={dmUser.avatar} status={dmUser.status} size="sm" showStatus />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ backgroundColor: `${channel.color ?? '#3b82f6'}20` }}
          >
            {channel.icon ?? '#'}
          </div>
        )}
        <div>
          <p className="font-semibold text-[var(--text-primary)] text-sm">{displayName}</p>
          {channel.description && (
            <p className="text-xs text-[var(--text-muted)]">{channel.description}</p>
          )}
          {dmUser && (
            <p className="text-xs text-[var(--text-muted)] capitalize">{dmUser.status}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="xs" icon={<Search className="w-3.5 h-3.5" />} />
          <Button variant="ghost" size="xs" icon={<Pin    className="w-3.5 h-3.5" />} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {channelMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-3xl mb-4">
              {channel.icon ?? '#'}
            </div>
            <p className="font-semibold text-[var(--text-primary)] mb-1">Start the conversation</p>
            <p className="text-sm text-[var(--text-muted)]">
              {channel.type === 'direct'
                ? `Send a message to ${dmUser?.name ?? 'them'}`
                : `Say hello in #${channel.name}!`}
            </p>
          </div>
        )}
        {channelMessages.map((msg, i) => {
          const prev       = channelMessages[i - 1];
          const showAvatar = !prev || prev.senderId !== msg.senderId ||
            new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() > 300_000;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              showAvatar={showAvatar}
              onReply={m => setReplyTo(m)}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-3 px-5 py-2 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
          <Reply className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <p className="text-xs text-[var(--text-secondary)] flex-1 truncate">
            Replying to <strong>{users.find(u => u.id === replyTo.senderId)?.name}</strong>:{' '}
            {replyTo.content}
          </p>
          <button onClick={() => setReplyTo(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="px-5 pb-5 pt-3 shrink-0">
        <div className="flex items-end gap-2 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] px-4 py-3 focus-within:border-blue-400 transition-colors">
          <button
            onClick={handleAttach}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={`Message ${channel.type === 'direct' ? dmUser?.name?.split(' ')[0] ?? 'DM' : '#' + channel.name}`}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none max-h-32 min-h-[1.25rem]"
            rows={1}
          />

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => toast('Emoji picker coming soon 😊', { icon: '🎨' })}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all ml-1',
                input.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
              )}
              title="Send (Enter)"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-1.5 px-1">
          Press <kbd className="font-mono text-[10px] bg-[var(--bg-tertiary)] px-1 rounded">Enter</kbd> to send,{' '}
          <kbd className="font-mono text-[10px] bg-[var(--bg-tertiary)] px-1 rounded">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}

/* ─── Page export ────────────────────────────────────── */
export function MessagesPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <ChannelList />
      <ChatArea />
    </div>
  );
}
