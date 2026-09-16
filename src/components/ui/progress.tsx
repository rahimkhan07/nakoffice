import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  color?: string;
  label?: boolean;
  className?: string;
}

export function Progress({ value, max = 100, size = 'sm', color, label, className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const getColor = () => {
    if (color) return color;
    if (pct >= 80) return '#22c55e';
    if (pct >= 50) return '#3b82f6';
    if (pct >= 20) return '#f59e0b';
    return '#ef4444';
  };

  const heightMap = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5' };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full bg-[var(--bg-tertiary)] overflow-hidden', heightMap[size])}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: getColor() }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {label && (
        <span className="text-xs text-[var(--text-muted)] mt-1">{Math.round(pct)}%</span>
      )}
    </div>
  );
}
