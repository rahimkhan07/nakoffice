'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Check your email</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Forgot your password?</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email address" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="you@company.com" required />
              <Button type="submit" fullWidth loading={loading}>Send reset link</Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
