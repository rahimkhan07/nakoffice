'use client';

import { cn, getInitials, getAvatarColor, getStatusColor } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  name: string;
  src?: string;
  status?: string;
  size?: AvatarSize;
  className?: string;
  showStatus?: boolean;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; dot: string; dotPos: string }> = {
  xs:  { container: 'w-6 h-6',   text: 'text-[10px]', dot: 'w-2 h-2',   dotPos: '-bottom-0 -right-0' },
  sm:  { container: 'w-8 h-8',   text: 'text-xs',     dot: 'w-2.5 h-2.5', dotPos: '-bottom-0.5 -right-0.5' },
  md:  { container: 'w-10 h-10', text: 'text-sm',     dot: 'w-3 h-3',   dotPos: '-bottom-0.5 -right-0.5' },
  lg:  { container: 'w-12 h-12', text: 'text-base',   dot: 'w-3.5 h-3.5', dotPos: '-bottom-0.5 -right-0.5' },
  xl:  { container: 'w-16 h-16', text: 'text-xl',     dot: 'w-4 h-4',   dotPos: 'bottom-0 right-0' },
  '2xl': { container: 'w-20 h-20', text: 'text-2xl',  dot: 'w-5 h-5',   dotPos: 'bottom-0.5 right-0.5' },
};

export function Avatar({
  name,
  src,
  status,
  size = 'md',
  className,
  showStatus = false,
}: AvatarProps) {
  const s = sizeMap[size];
  const color = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div className={cn('relative shrink-0', s.container, className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className={cn(
            'w-full h-full rounded-full flex items-center justify-center font-semibold text-white select-none',
            s.text
          )}
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
      )}

      {showStatus && status && (
        <span
          className={cn(
            'absolute rounded-full ring-2 ring-[var(--bg-primary)]',
            s.dot,
            s.dotPos
          )}
          style={{ backgroundColor: getStatusColor(status) }}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  users,
  max = 4,
  size = 'sm',
}: {
  users: Array<{ name: string; src?: string }>;
  max?: number;
  size?: AvatarSize;
}) {
  const shown = users.slice(0, max);
  const extra = users.length - max;
  const s = sizeMap[size];

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((u, i) => (
        <div
          key={i}
          className={cn('rounded-full ring-2 ring-[var(--bg-elevated)]', s.container)}
        >
          <Avatar name={u.name} src={u.src} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className={cn(
            'rounded-full ring-2 ring-[var(--bg-elevated)] bg-[var(--bg-tertiary)]',
            'flex items-center justify-center text-[var(--text-secondary)] font-medium',
            s.container,
            s.text
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
