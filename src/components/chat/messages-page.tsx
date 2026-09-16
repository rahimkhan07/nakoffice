'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, Hash, Lock, Users, MessageSquare,
  Send, Paperclip, Smile, Reply, MoreHorizontal, Pin,
  Check, CheckCheck, Mic,
} from 'lucide-react';
import { cn, getInitials, getAvatarColor, formatRelativeTime, formatTime, generateId } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import type { Channel, Message } from '@/types';

const REACTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '👀', '✅', '💯'];

const channelTypeIcon = {
  company:    Hash,
  department: Hash,
  group:      Users,
  direct:     MessageSquare,
};

function ChannelList() {
  const { channels, activeChannelId, setActiveChannel, currentUser, users, markChannelRead } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {
    company:    filtered.filter(c => c.type === 'company'),
    department: filtered.filter(c => c.type === 'department'),
    group:      filtered.filter(c => c.type === 'group'),
    direct:     filtered.filter(c => c.type === 'direct'),
  };

  const getChannelDisplayName = (c: Channel) => {
    if (c.type === 'direct') {
      const other = c.memberIds.find(id => id !== currentUser?.id);
      const user = users.find(u => u.id === other);
      return user?.name ?? c.name;
    }
    return c.name;
  };

  const ChannelItem = ({ channel }: { channel: Channel }) => {
    const active = channel.id === activeChannelId;
    const Icon = channelTypeIcon[channel.type];
    const displayName = getChannelDisplayName(channel);
    const dmUser = channel.type === 'direct'
      ? users.find(u => u.id === channel.memberIds.find(id => id !== currentUser?.id))
      : null;

    return (
      <button
        onClick={() => { setActiveChannel(channel.id); markChannelRead(channel.id); }}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all',
          active ? 'bg-blue-600 text-white' : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
        )}
      >
        {dmUser ? (
          <Avatar name={dmUser.name} src={dmUser.avatar} status={dmUser.status} size="xs" showStatus />
        ) : (
          <Icon className="w-4 h-4 shrink-0" />
        )}
        <span className={cn('flex-1 text-sm truncate', (channel.unreadCount ?? 0) > 0 && !active && 'font-semibold text-[var(--text-primary)]')}>
          {displayName}
        </span>
        {(channel.unreadCount ?? 0) > 0 && !active && (
          <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {channel.unreadCount}
          </span>
        )}
      </button>
    );
  };

  const SectionHeader = ({ label }: { label: string }) => (
    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-3 pt-4 pb-1">
      {label}
    </p>
  );

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col shrink-0">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--text-primary)]">Messages</h2>
          <button className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <Input placeholder="Search channels…" inputSize="sm"
          leftIcon={<Search className="w-3.5 h-3.5" />}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {grouped.company.length > 0 && (
          <>
            <SectionHeader label="Company" />
            {grouped.company.map(c => <ChannelItem key={c.id} channel={c} />)}
          </>
        )}
        {grouped.department.length > 0 && (
          <>
            <SectionHeader label="Departments" />
            {grouped.department.map(c => <ChannelItem key={c.id} channel={c} />)}
          </>
        )}
        {grouped.group.length > 0 && (
          <>
            <SectionHeader label="Groups" />
            {grouped.group.map(c => <ChannelItem key={c.id} channel={c} />)}
          </>
        )}
        {grouped.direct.length > 0 && (
          <>
            <SectionHeader label="Direct Messages" />
            {grouped.direct.map(c => <ChannelItem key={c.id} channel={c} />)}
          </>
        )}
      </nav>
    </aside>
  );
}

function MessageBubble({ message, showAvatar }: { message: Message; showAvatar: boolean }) {
  const { users, currentUser, addReaction } = useAppStore();
  const [showReactions, setShowReactions] = useState(false);
  const sender = users.find(u => u.id === message.senderId);
  const isMe = message.senderId === currentUser?.id;

  return (
    <div
      className={cn('flex gap-3 group', isMe ? 'flex-row-reverse' : 'flex-row', showAvatar ? 'mt-3' : 'mt-0.5')}
    >
      {showAvatar && !isMe ? (
        <Avatar name={sender?.name ?? '?'} src={sender?.avatar} size="sm" />
      ) : !isMe ? (
        <div className="w-8 shrink-0" />
      ) : null}

      <div className={cn('max-w-[70%] flex flex-col', isMe ? 'items-end' : 'items-start')}>
        {showAvatar && !isMe && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-semibold text-[var(--text-primary)]">{sender?.name}</span>
            <span className="text-xs text-[var(--text-muted)]">{formatTime(message.createdAt)}</span>
          </div>
        )}

        <div className="relative">
          <div
            className={cn(
              'px-3.5 py-2.5 rounded-2xl text-sm',
              isMe
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-sm border border-[var(--border)]'
            )}
          >
            {message.content}
            {isMe && (
              <span className="ml-2 inline-flex">
                <CheckCheck className="w-3 h-3 text-blue-200" />
              </span>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(message.reactions).map(([emoji, reactors]) => (
                reactors.length > 0 && (
                  <button key={emoji}
                    onClick={() => currentUser && addReaction(message.id, emoji, currentUser.id)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs hover:bg-[var(--bg-tertiary)]">
                    {emoji} {reactors.length}
                  </button>
                )
              ))}
            </div>
          )}

          {/* Action buttons on hover */}
          <div className={cn(
            'absolute top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isMe ? 'right-full mr-2' : 'left-full ml-2'
          )}>
            {REACTIONS.slice(0, 4).map(emoji => (
              <button key={emoji}
                onClick={() => currentUser && addReaction(message.id, emoji, currentUser.id)}
                className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-sm hover:bg-[var(--bg-secondary)] flex items-center justify-center shadow-sm">
                {emoji}
              </button>
            ))}
            <button className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] hover:bg-[var(--bg-secondary)] flex items-center justify-center shadow-sm">
              <Reply className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {showAvatar && isMe && (
          <span className="text-xs text-[var(--text-muted)] mt-0.5">{formatTime(message.createdAt)}</span>
        )}
      </div>
    </div>
  );
}

function ChatArea() {
  const { activeChannelId, channels, messages, sendMessage, currentUser, users } = useAppStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const channel = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleSend = () => {
    if (!input.trim() || !currentUser || !activeChannelId) return;
    sendMessage({
      id: generateId(),
      channelId: activeChannelId,
      senderId: currentUser.id,
      content: input.trim(),
      type: 'text',
      createdAt: new Date().toISOString(),
    });
    setInput('');
  };

  if (!channel) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
        <p className="text-[var(--text-primary)] font-medium">Select a channel</p>
        <p className="text-[var(--text-muted)] text-sm">Choose a conversation to start messaging</p>
      </div>
    </div>
  );

  const dmUser = channel.type === 'direct'
    ? users.find(u => u.id === channel.memberIds.find(id => id !== currentUser?.id))
    : null;
  const displayName = dmUser?.name ?? channel.name;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
        {dmUser ? (
          <Avatar name={dmUser.name} src={dmUser.avatar} status={dmUser.status} size="sm" showStatus />
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${channel.color ?? '#3b82f6'}20` }}>
            {channel.icon ?? '#'}
          </div>
        )}
        <div>
          <p className="font-semibold text-[var(--text-primary)]">{displayName}</p>
          {channel.description && (
            <p className="text-xs text-[var(--text-muted)]">{channel.description}</p>
          )}
          {dmUser && (
            <p className="text-xs text-[var(--text-muted)] capitalize">{dmUser.status}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="xs" icon={<Search className="w-4 h-4" />} />
          <Button variant="ghost" size="xs" icon={<Pin className="w-4 h-4" />} />
          <Button variant="ghost" size="xs" icon={<MoreHorizontal className="w-4 h-4" />} />
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
            <p className="text-sm text-[var(--text-muted)]">Say hello in #{channel.name}!</p>
          </div>
        )}
        {channelMessages.map((msg, i) => {
          const prev = channelMessages[i - 1];
          const showAvatar = !prev || prev.senderId !== msg.senderId ||
            new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() > 300000;
          return <MessageBubble key={msg.id} message={msg} showAvatar={showAvatar} />;
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-3 shrink-0">
        <div className="flex items-end gap-2 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] px-4 py-3">
          <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1">
            <Paperclip className="w-4.5 h-4.5" />
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={`Message ${channel.type === 'direct' ? dmUser?.name?.split(' ')[0] ?? 'DM' : '#' + channel.name}`}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none max-h-32 min-h-[1.5rem]"
            rows={1}
          />
          <div className="flex items-center gap-1">
            <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1">
              <Smile className="w-4.5 h-4.5" />
            </button>
            <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                input.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
              )}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessagesPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <ChannelList />
      <ChatArea />
    </div>
  );
}
