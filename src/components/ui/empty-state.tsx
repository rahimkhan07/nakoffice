import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
