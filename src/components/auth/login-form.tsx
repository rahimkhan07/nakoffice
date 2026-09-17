'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import { loginWithEmail, loginWithGoogle } from '@/lib/firebase-auth';
import { getUserById, setUser } from '@/lib/firestore';
import type { User } from '@/types';
import toast from 'react-hot-toast';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? 'company-1';

export function LoginForm() {
  const router = useRouter();
  const { setCurrentUser } = useAppStore();

  const [showPass,      setShowPass]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error,         setError]         = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  // ── Resolve user: fetch from Firestore, auto-create if missing ──
  // This handles the case where a Firebase Auth user exists but has
  // no matching Firestore document (e.g. signed up via Firebase Console,
  // or account pre-exists from a different session).
  const resolveUser = async (
    uid: string,
    email: string,
    displayName?: string | null,
  ): Promise<User> => {
    let appUser = await getUserById(uid);

    if (!appUser) {
      // No Firestore doc → create one so the app can proceed
      const fallbackName = displayName || email.split('@')[0].replace(/[._]/g, ' ');
      appUser = {
        id:           uid,
        email:        email,
        name:         fallbackName,
        designation:  'Team Member',
        status:       'available',
        role:         'employee',
        companyId:    COMPANY_ID,
        joinedAt:     new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isOnline:     true,
        position:     { x: 320, y: 180 },
      };
      await setUser(appUser);
      console.info('[NAK] Created missing Firestore user doc for', uid);
    }

    return appUser;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fbUser  = await loginWithEmail(form.email, form.password);
      const appUser = await resolveUser(fbUser.uid, fbUser.email ?? form.email, fbUser.displayName);
      setCurrentUser(appUser);
      toast.success('Welcome back to NAK Digital Office! 👋');
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(getFirebaseError(err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle(COMPANY_ID);
      setCurrentUser(user);
      toast.success('Welcome to NAK Digital Office!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('popup-closed') || msg.includes('cancelled')) {
        toast.error('Sign-in was cancelled.');
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* NAK Logo + title */}
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #0a2540, #142840)',
            border: '2px solid rgba(212,160,23,0.4)',
          }}
        >
          <span className="text-xl font-black tracking-tighter" style={{ color: '#d4a017' }}>NAK</span>
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          NAK Digital Office
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Sign in with your NAK Digital account
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl border p-8 shadow-sm"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
      >
        {/* Error banner */}
        {error && (
          <div
            className="mb-5 p-3 rounded-xl text-sm"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Work email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            leftIcon={<Mail className="w-4 h-4" />}
            placeholder="you@nakdigital.com"
            required
          />

          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label
              className="flex items-center gap-2 cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <input type="checkbox" className="rounded" />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: '#1a73e8' }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0a2540, #1557c0)' }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in…
              </>
            ) : 'Sign In to NAK Office'}
          </button>

          {/* Divider */}
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--border)' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span
                className="px-2"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
              >
                or continue with
              </span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogle}
            className="w-full h-11 rounded-xl text-sm font-medium transition-all hover:brightness-105 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2.5"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {googleLoading ? (
              <span className="w-4 h-4 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--text-primary)] animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Connecting…' : 'Continue with Google'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
        🔒 Internal platform — NAK Digital team only.
        <br />
        Not a team member?{' '}
        <a
          href="https://nakdigital.com"
          className="underline hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          Visit our website
        </a>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function getFirebaseError(msg: string): string {
  if (msg.includes('user-not-found'))          return 'No account found with this email.';
  if (msg.includes('wrong-password'))           return 'Incorrect password.';
  if (msg.includes('invalid-credential'))      return 'Invalid email or password.';
  if (msg.includes('too-many-requests'))        return 'Too many attempts — please wait and try again.';
  if (msg.includes('invalid-email'))            return 'Please enter a valid email address.';
  if (msg.includes('network-request-failed'))  return 'Network error — check your internet connection.';
  if (msg.includes('email-already-in-use'))     return 'This email is already registered. Sign in instead.';
  return 'Sign in failed. Please check your credentials and try again.';
}
