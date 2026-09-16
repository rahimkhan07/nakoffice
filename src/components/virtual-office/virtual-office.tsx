'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MessageSquare, Video, User as UserIcon, X, Maximize2, Minimize2,
  ZoomIn, ZoomOut, RotateCcw, Info,
} from 'lucide-react';
import { cn, getAvatarColor, getStatusColor, getInitials } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import type { User, VirtualRoom } from '@/types';

const MOVE_SPEED = 3;
const AVATAR_SIZE = 36;
const INTERACTION_RADIUS = 80;

interface EmployeeProfile {
  user: User;
  room?: VirtualRoom;
}

// ── Room component ────────────────────────────────────────────────────────────
function RoomBox({ room, occupants, onClick }: {
  room: VirtualRoom;
  occupants: User[];
  onClick: () => void;
}) {
  return (
    <div
      className="absolute rounded-2xl border-2 flex flex-col cursor-pointer transition-all hover:border-opacity-80 group"
      style={{
        left: room.position.x,
        top: room.position.y,
        width: room.position.width,
        height: room.position.height,
        borderColor: `${room.color}60`,
        backgroundColor: `${room.color}12`,
      }}
      onClick={onClick}
    >
      {/* Room label */}
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
        <span className="text-lg">{room.icon}</span>
        <span className="text-xs font-semibold truncate" style={{ color: room.color }}>
          {room.name}
        </span>
        {occupants.length > 0 && (
          <span className="ml-auto text-xs" style={{ color: room.color }}>
            {occupants.length}
          </span>
        )}
      </div>
      {/* Capacity bar */}
      {room.capacity && (
        <div className="mx-3 mt-1 h-1 rounded-full bg-black/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (occupants.length / room.capacity) * 100)}%`,
              backgroundColor: room.color,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Avatar player ──────────────────────────────────────────────────────────────
function PlayerAvatar({
  user,
  isCurrentUser,
  onClick,
}: {
  user: User;
  isCurrentUser: boolean;
  onClick: () => void;
}) {
  const pos = user.position ?? { x: 400, y: 300 };
  const color = getAvatarColor(user.name);

  return (
    <div
      className="absolute flex flex-col items-center gap-1 cursor-pointer transition-all duration-150"
      style={{ left: pos.x - AVATAR_SIZE / 2, top: pos.y - AVATAR_SIZE / 2 }}
      onClick={onClick}
    >
      {/* Name tag */}
      <div className={cn(
        'px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm border',
        isCurrentUser
          ? 'bg-blue-600 text-white border-blue-500'
          : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border)]'
      )}>
        {user.name.split(' ')[0]}
      </div>

      {/* Avatar circle */}
      <div className="relative">
        <div
          className={cn(
            'rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md',
            isCurrentUser && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent'
          )}
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            backgroundColor: color,
          }}
        >
          {getInitials(user.name)}
        </div>
        {/* Status dot */}
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)]"
          style={{ backgroundColor: getStatusColor(user.status) }}
        />
        {/* Current user indicator */}
        {isCurrentUser && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
        )}
      </div>
    </div>
  );
}

// ── Profile popup ─────────────────────────────────────────────────────────────
function EmployeeProfilePopup({
  data, onClose, onMessage,
}: {
  data: EmployeeProfile;
  onClose: () => void;
  onMessage: () => void;
}) {
  const { user, room } = data;
  const color = getAvatarColor(user.name);

  return (
    <div className="absolute top-4 right-4 w-72 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl z-30 overflow-hidden">
      {/* Header */}
      <div className="h-16 relative" style={{ background: `linear-gradient(135deg, ${color}40, ${color}20)` }}>
        <button onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-black/10 text-[var(--text-muted)]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Avatar */}
      <div className="px-5 pb-5">
        <div className="flex items-end gap-3 -mt-6 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-[var(--bg-elevated)]"
            style={{ backgroundColor: color }}
          >
            {getInitials(user.name)}
          </div>
          <div className="pb-1">
            <p className="font-bold text-[var(--text-primary)]">{user.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{user.designation}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Status</span>
            <StatusBadge status={user.status} />
          </div>
          {room && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">Location</span>
              <span className="text-[var(--text-primary)] font-medium text-xs">{room.icon} {room.name}</span>
            </div>
          )}
          {user.timezone && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">Timezone</span>
              <span className="text-[var(--text-primary)] text-xs">{user.timezone}</span>
            </div>
          )}
        </div>

        {user.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {user.skills.slice(0, 4).map((skill: string) => (
              <span key={skill} className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)]">
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" fullWidth icon={<MessageSquare className="w-3.5 h-3.5" />} onClick={onMessage}>
            Message
          </Button>
          <Button size="sm" variant="secondary" icon={<Video className="w-3.5 h-3.5" />}>
            Call
          </Button>
          <Button size="sm" variant="ghost" icon={<UserIcon className="w-3.5 h-3.5" />} />
        </div>
      </div>
    </div>
  );
}

// ── Main virtual office ────────────────────────────────────────────────────────
export function VirtualOffice() {
  const { currentUser, users, virtualRooms, updateUserPosition } = useAppStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<EmployeeProfile | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const pressedKeys = useRef<Set<string>>(new Set());
  const animFrameRef = useRef<number>(0);

  // User position
  const myPos = currentUser?.position ?? { x: 320, y: 180 };
  const posRef = useRef(myPos);

  // Determine which room a position is in
  const getRoomForPosition = useCallback((x: number, y: number): VirtualRoom | undefined => {
    return virtualRooms.find(r =>
      x >= r.position.x && x <= r.position.x + r.position.width &&
      y >= r.position.y && y <= r.position.y + r.position.height
    );
  }, [virtualRooms]);

  // Movement loop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      pressedKeys.current.add(e.key.toLowerCase());
      // Prevent page scroll on arrows
      if (['arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => pressedKeys.current.delete(e.key.toLowerCase());

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const container = canvasRef.current;
    const containerW = container?.offsetWidth ?? 1200;
    const containerH = container?.offsetHeight ?? 650;

    const tick = () => {
      const k = pressedKeys.current;
      let { x, y } = posRef.current;
      let moved = false;

      if (k.has('w') || k.has('arrowup'))    { y -= MOVE_SPEED; moved = true; }
      if (k.has('s') || k.has('arrowdown'))  { y += MOVE_SPEED; moved = true; }
      if (k.has('a') || k.has('arrowleft'))  { x -= MOVE_SPEED; moved = true; }
      if (k.has('d') || k.has('arrowright')) { x += MOVE_SPEED; moved = true; }

      // Clamp to canvas
      x = Math.max(20, Math.min(containerW - 20, x));
      y = Math.max(20, Math.min(containerH - 20, y));

      if (moved) {
        posRef.current = { x, y };
        if (currentUser) updateUserPosition(currentUser.id, { x, y });
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentUser, updateUserPosition]);

  const handleUserClick = (user: User) => {
    const room = getRoomForPosition(user.position?.x ?? 0, user.position?.y ?? 0);
    setSelectedUser({ user, room });
  };

  const handleRoomClick = (room: VirtualRoom) => {
    // Move current user to room center
    if (currentUser) {
      const cx = room.position.x + room.position.width / 2;
      const cy = room.position.y + room.position.height / 2 + 20;
      posRef.current = { x: cx, y: cy };
      updateUserPosition(currentUser.id, { x: cx, y: cy });
    }
  };

  // Proximity interactions
  const myCurrentPos = currentUser?.position ?? posRef.current;
  const nearbyUsers = users.filter(u => {
    if (u.id === currentUser?.id || !u.isOnline) return false;
    const uPos = u.position ?? { x: 0, y: 0 };
    const dist = Math.hypot(uPos.x - myCurrentPos.x, uPos.y - myCurrentPos.y);
    return dist < INTERACTION_RADIUS;
  });

  const currentRoom = getRoomForPosition(myCurrentPos.x, myCurrentPos.y);

  return (
    <div className={cn(
      'flex flex-col bg-[var(--bg-primary)]',
      fullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-3.5rem)]'
    )}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏢</span>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">NAK Digital HQ</p>
            <p className="text-xs text-[var(--text-muted)]">
              {currentRoom ? `📍 ${currentRoom.icon} ${currentRoom.name}` : '📍 Common Area'}
              {' · '}{users.filter(u => u.isOnline).length} online
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Zoom */}
          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-0.5">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-[var(--text-secondary)] px-1 min-w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(1)}
              className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]">
            <Info className="w-4 h-4" />
          </button>

          <button onClick={() => setFullscreen(!fullscreen)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Office canvas */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        <div
          ref={canvasRef}
          className="absolute inset-0 office-grid"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.1s' }}
        >
          {/* Rooms */}
          {virtualRooms.map(room => {
            const occupants = users.filter(u =>
              u.isOnline && u.position &&
              u.position.x >= room.position.x && u.position.x <= room.position.x + room.position.width &&
              u.position.y >= room.position.y && u.position.y <= room.position.y + room.position.height
            );
            return (
              <RoomBox key={room.id} room={room} occupants={occupants} onClick={() => handleRoomClick(room)} />
            );
          })}

          {/* User avatars */}
          {users.filter(u => u.isOnline || u.id === currentUser?.id).map(user => (
            <PlayerAvatar
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUser?.id}
              onClick={() => {
                if (user.id !== currentUser?.id) handleUserClick(user);
              }}
            />
          ))}

          {/* Proximity chat bubble */}
          {nearbyUsers.length > 0 && (
            <div
              className="absolute z-20 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-lg px-3 py-2"
              style={{ left: myCurrentPos.x - 60, top: myCurrentPos.y - 70 }}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-[var(--text-primary)]">
                  {nearbyUsers[0].name.split(' ')[0]} is nearby
                </span>
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <button className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-md hover:bg-blue-700">
                  Chat
                </button>
                <button className="text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-md hover:bg-[var(--bg-tertiary)]">
                  Call
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Employee profile popup */}
        {selectedUser && (
          <EmployeeProfilePopup
            data={selectedUser}
            onClose={() => setSelectedUser(null)}
            onMessage={() => setSelectedUser(null)}
          />
        )}

        {/* Help overlay */}
        {showHelp && (
          <div className="absolute bottom-4 left-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-4 shadow-lg max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Controls</p>
              <button onClick={() => setShowHelp(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs font-mono">W A S D</kbd>
                <span>Move around</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs font-mono">↑ ↓ ← →</kbd>
                <span>Arrow keys also work</span>
              </div>
              <p>🖱️ Click on rooms to teleport there</p>
              <p>👆 Click on teammates to view profile</p>
              <p>💬 Move close to start a conversation</p>
            </div>
          </div>
        )}

        {/* Room legend */}
        <div className="absolute top-3 left-3 bg-[var(--bg-elevated)]/90 backdrop-blur-sm border border-[var(--border)] rounded-xl p-3 shadow-sm">
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Rooms</p>
          <div className="space-y-1">
            {virtualRooms.slice(0, 6).map(room => {
              const count = users.filter(u => u.isOnline && u.position &&
                u.position.x >= room.position.x && u.position.x <= room.position.x + room.position.width &&
                u.position.y >= room.position.y && u.position.y <= room.position.y + room.position.height
              ).length;
              return (
                <div key={room.id}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleRoomClick(room)}>
                  <span className="text-xs">{room.icon}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{room.name}</span>
                  {count > 0 && (
                    <span className="ml-auto text-xs font-medium" style={{ color: room.color }}>
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
