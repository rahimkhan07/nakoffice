'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import { Input, Select } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import { signUpWithEmail, loginWithGoogle } from '@/lib/firebase-auth';
import { setCompany as fsSetCompany } from '@/lib/firestore';
import toast from 'react-hot-toast';
import type { Company } from '@/types';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? 'company-1';

// NAK Digital departments for the signup form
const DEPARTMENTS = [
  { value: '',            label: 'Select your department'  },
  { value: 'development', label: '⚙️  Development'          },
  { value: 'design',      label: '🎨  Design'               },
  { value: 'marketing',   label: '📣  Marketing'            },
  { value: 'sales',       label: '💼  Sales'                },
  { value: 'hr',          label: '👥  Human Resources'      },
  { value: 'management',  label: '🏢  Management'           },
];

const ROLES_DISPLAY = [
  { value: '',                 label: 'Select your role'       },
  { value: 'employee',         label: 'Team Member'            },
  { value: 'department_head',  label: 'Department Head'        },
  { value: 'project_manager',  label: 'Project Manager'        },
  { value: 'company_admin',    label: 'Company Admin'          },
];

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

export function SignupForm() {
  const router = useRouter();
  const { setCurrentUser, setCompany } = useAppStore();

  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error,         setError]         = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    designation: '', department: '', role: 'employee',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim())  { toast.error('Please enter your full name'); return; }
    if (!form.department)   { toast.error('Please select your department'); return; }

    setLoading(true);
    try {
      const user = await signUpWithEmail(form.email, form.password, form.name, COMPANY_ID);

      // Patch user with NAK-specific fields
      user.designation = form.designation;
      user.role        = form.role as typeof user.role;

      setCurrentUser(user);

      // Ensure company doc exists (first signup creates it)
      const nakCompany: Company = {
        id:           COMPANY_ID,
        name:         'NAK Digital',
        slug:         'nak-digital',
        email:        'hello@nakdigital.com',
        industry:     'Technology',
        size:         '11-50',
        country:      'UAE',
        timezone:     'Asia/Dubai',
        brandColor:   '#1a73e8',
        accentColor:  '#d4a017',
        officeName:   'NAK HQ',
        officeLayout: 'modern',
        plan:         'business',
        ownerId:      user.id,
        createdAt:    new Date().toISOString(),
        storageUsed:  0,
        storageLimit: 107_374_182_400,
      };
      await fsSetCompany(nakCompany);
      setCompany(nakCompany);

      toast.success('Welcome to NAK Digital Office! 🎉');
      router.push('/onboarding');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (msg.includes('weak-password')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError('Registration failed. Please try again.');
        console.error(err);
      }
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
    } catch {
      toast.error('Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* NAK Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #0a2540, #142840)', border: '2px solid rgba(212,160,23,0.4)' }}>
          <span className="text-xl font-black tracking-tighter" style={{ color: '#d4a017' }}>NAK</span>
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Join NAK Digital Office
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Create your NAK Digital team account
        </p>
      </div>

      <div className="rounded-2xl border p-8 shadow-sm"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" type="text" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            leftIcon={<User className="w-4 h-4" />} placeholder="Your full name" required />

          <Input label="Work email" type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            leftIcon={<Mail className="w-4 h-4" />} placeholder="you@nakdigital.com" required />

          <Input label="Password" type="password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            leftIcon={<Lock className="w-4 h-4" />} placeholder="Min. 6 characters"
            hint="At least 6 characters" required minLength={6} />

          <Input label="Job title / Designation" type="text" value={form.designation}
            onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
            placeholder="e.g. Senior Developer, Marketing Manager" />

          <div className="grid grid-cols-2 gap-3">
            <Select label="Department *" value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              options={DEPARTMENTS} />
            <Select label="Role" value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              options={ROLES_DISPLAY} />
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            By creating an account you agree to the NAK Digital internal use policy.
          </p>

          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0a2540, #1557c0)' }}>
            {loading
              ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating account…</>
              : 'Create NAK Digital Account'
            }
          </button>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--border)' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-[var(--text-muted)]" style={{ background: 'var(--bg-elevated)' }}>or</span>
            </div>
          </div>

          <button type="button" disabled={googleLoading} onClick={handleGoogle}
            className="w-full h-11 rounded-xl text-sm font-medium transition-all hover:brightness-105 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2.5"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            {googleLoading
              ? <span className="w-4 h-4 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--text-primary)] animate-spin" />
              : <GoogleIcon />
            }
            {googleLoading ? 'Connecting…' : 'Sign up with Google'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
        Already on the team?{' '}
        <Link href="/login" className="font-semibold hover:opacity-80 transition-opacity"
          style={{ color: '#1a73e8' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
