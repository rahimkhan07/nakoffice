import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="h-14 flex items-center px-6 border-b border-[var(--border)]">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[var(--text-primary)]">VirtOffice</span>
        </Link>
      </header>
      {children}
    </div>
  );
}
