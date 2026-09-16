'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink' | 'outline';
type BadgeSize    = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger:  'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',
  info:    'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
  purple:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  pink:    'bg-pink-100  text-pink-700  dark:bg-pink-900/30  dark:text-pink-400',
  outline: 'border border-[var(--border)] text-[var(--text-secondary)] bg-transparent',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  purple:  'bg-purple-500',
  pink:    'bg-pink-500',
  outline: 'bg-slate-400',
};

export function Badge({ variant = 'default', size = 'sm', dot, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    available:   { variant: 'success', label: 'Available'   },
    away:        { variant: 'warning', label: 'Away'        },
    busy:        { variant: 'danger',  label: 'Busy'        },
    offline:     { variant: 'default', label: 'Offline'     },
    planning:    { variant: 'info',    label: 'Planning'    },
    in_progress: { variant: 'info',    label: 'In Progress' },
    review:      { variant: 'purple',  label: 'Review'      },
    completed:   { variant: 'success', label: 'Completed'   },
    todo:        { variant: 'default', label: 'To Do'       },
    done:        { variant: 'success', label: 'Done'        },
    scheduled:   { variant: 'info',    label: 'Scheduled'   },
    ongoing:     { variant: 'success', label: 'Ongoing'     },
    ended:       { variant: 'default', label: 'Ended'       },
  };
  const cfg = map[status] ?? { variant: 'default' as BadgeVariant, label: status };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    urgent: { variant: 'danger',  label: 'Urgent' },
    high:   { variant: 'warning', label: 'High'   },
    medium: { variant: 'info',    label: 'Medium' },
    low:    { variant: 'success', label: 'Low'    },
  };
  const cfg = map[priority] ?? { variant: 'default' as BadgeVariant, label: priority };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
