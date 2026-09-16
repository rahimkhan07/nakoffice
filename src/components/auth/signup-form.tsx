'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building2, Chrome } from 'lucide-react';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const INDUSTRIES = [
  { value: '', label: 'Select industry' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
];

const SIZES = [
  { value: '', label: 'Company size' },
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '500+', label: '500+ employees' },
];

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    companyName: '', industry: '', size: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.industry || !form.size) {
      toast.error('Please fill in all company details');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Account created! Let\'s set up your office.');
    router.push('/onboarding');
    setLoading(false);
  };

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value })),
  });

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Create your virtual office</h1>
        <p className="text-[var(--text-secondary)] text-sm">Start free. No credit card required.</p>
      </div>

      <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" type="text" {...field('name')}
            leftIcon={<User className="w-4 h-4" />} placeholder="Your full name" required />

          <Input label="Work email" type="email" {...field('email')}
            leftIcon={<Mail className="w-4 h-4" />} placeholder="you@company.com" required />

          <Input label="Password" type="password" {...field('password')}
            leftIcon={<Lock className="w-4 h-4" />} placeholder="Min. 8 characters"
            hint="At least 8 characters" required minLength={8} />

          <div className="pt-2 border-t border-[var(--border)]">
            <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wide">Company details</p>
            <div className="space-y-4">
              <Input label="Company name" type="text" {...field('companyName')}
                leftIcon={<Building2 className="w-4 h-4" />} placeholder="Your company name" required />

              <div className="grid grid-cols-2 gap-3">
                <Select label="Industry" options={INDUSTRIES}
                  value={form.industry}
                  onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
                <Select label="Team size" options={SIZES}
                  value={form.size}
                  onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            By signing up, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Create My Virtual Office
          </Button>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--bg-elevated)] px-2 text-[var(--text-muted)]">or</span>
            </div>
          </div>

          <Button type="button" variant="secondary" fullWidth size="lg"
            icon={<Chrome className="w-4 h-4" />}>
            Sign up with Google
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
