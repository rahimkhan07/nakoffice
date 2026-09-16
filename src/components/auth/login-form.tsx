'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import toast from 'react-hot-toast';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAppStore();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: 'rahim@nakdigital.com', password: 'demo1234' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // Demo: log in as first user
    login('user-1');
    toast.success('Welcome back! 👋');
    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Welcome back</h1>
        <p className="text-[var(--text-secondary)] text-sm">Sign in to your virtual office</p>
      </div>

      {/* Demo notice */}
      <div className="mb-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400">
        <strong>Demo credentials:</strong> rahim@nakdigital.com / demo1234
      </div>

      <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Work email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            leftIcon={<Mail className="w-4 h-4" />}
            placeholder="you@company.com"
            required
          />

          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPass(!showPass)} className="hover:text-[var(--text-primary)]">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--bg-elevated)] px-2 text-[var(--text-muted)]">or continue with</span>
            </div>
          </div>

          <Button type="button" variant="secondary" fullWidth size="lg"
            icon={<svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 110 16A8 8 0 0112 4zm0 2a6 6 0 100 12A6 6 0 0012 6zm0 2a4 4 0 110 8 4 4 0 010-8z"/></svg>}>
            Continue with Google
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
          Create one free
        </Link>
      </p>
    </div>
  );
}
