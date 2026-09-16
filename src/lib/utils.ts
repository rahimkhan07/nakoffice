import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format bytes to human-readable */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Format date relative to now */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

/** Format time as HH:MM AM/PM */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/** Format date as Month DD, YYYY */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Get initials from a name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Generate a random avatar color based on name */
export function getAvatarColor(name: string): string {
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#ef4444', '#06b6d4', '#84cc16',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/** Get status color */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'available': return '#22c55e';
    case 'away':      return '#f59e0b';
    case 'busy':      return '#ef4444';
    case 'offline':   return '#6b7280';
    default:          return '#6b7280';
  }
}

/** Get status label */
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'available': return 'Available';
    case 'away':      return 'Away';
    case 'busy':      return 'Busy';
    case 'offline':   return 'Offline';
    default:          return status;
  }
}

/** Get priority color */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return '#ef4444';
    case 'high':   return '#f97316';
    case 'medium': return '#f59e0b';
    case 'low':    return '#22c55e';
    default:       return '#94a3b8';
  }
}

/** Truncate string */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/** Generate unique ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/** Deep clone an object */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Check if a color is dark */
export function isColorDark(hex: string): boolean {
  const rgb = parseInt(hex.replace('#', ''), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 128;
}
