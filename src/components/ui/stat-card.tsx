import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: { value: number; label?: string };
  color?: string;
  className?: string;
}

export function StatCard({ title, value, icon, change, color = '#3b82f6', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-[var(--bg-elevated)] border-[var(--border)] p-5 flex flex-col gap-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)] font-medium">{title}</p>
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}1a` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
      {change && (
        <p className={cn('text-xs font-medium', change.value >= 0 ? 'text-green-600' : 'text-red-500')}>
          {change.value >= 0 ? '↑' : '↓'} {Math.abs(change.value)}%{' '}
          <span className="text-[var(--text-muted)] font-normal">{change.label ?? 'vs last month'}</span>
        </p>
      )}
    </div>
  );
}
