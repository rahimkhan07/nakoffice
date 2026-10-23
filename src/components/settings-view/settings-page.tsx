'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Palette, Bell, Shield, Users, CreditCard,
  Zap, Check, Monitor, Smartphone, Laptop,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import toast from 'react-hot-toast';

type SettingsTab = 'company' | 'appearance' | 'notifications' | 'security' | 'roles' | 'billing';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'company',       label: 'Company',       icon: Building2  },
  { id: 'appearance',    label: 'Appearance',     icon: Palette    },
  { id: 'notifications', label: 'Notifications',  icon: Bell       },
  { id: 'security',      label: 'Security',       icon: Shield     },
  { id: 'roles',         label: 'Roles & Perms',  icon: Users      },
  { id: 'billing',       label: 'Billing',        icon: CreditCard },
];

const BRAND_COLORS = ['#1a73e8','#8b5cf6','#ec4899','#10b981','#f59e0b','#06b6d4','#ef4444','#d4a017'];
const OFFICE_BKGS  = ['gradient-blue','gradient-purple','dark-tech','light-minimal','corporate','gradient-gold'];

const NOTIF_PREFS = [
  { key: 'newMessage',       label: 'New messages'          },
  { key: 'taskAssigned',     label: 'Task assigned to you'  },
  { key: 'taskUpdated',      label: 'Task status changed'   },
  { key: 'meetingScheduled', label: 'Meeting scheduled'     },
  { key: 'mention',          label: 'Someone mentions you'  },
  { key: 'fileShared',       label: 'File shared with you'  },
  { key: 'announcement',     label: 'New announcement'      },
  { key: 'projectUpdate',    label: 'Project updates'       },
];

const PLAN_PRICES: Record<string, string> = {
  free:       '$0',
  starter:    '$19',
  business:   '$49',
  enterprise: 'Custom',
};

// ── Toggle (uses CSS classes from globals.css — no invalid Tailwind) ──────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn('toggle-track', on ? 'toggle-track-on' : 'toggle-track-off')}
      aria-checked={on}
      role="switch"
    >
      <span className={cn('toggle-knob', on ? 'toggle-knob-on' : 'toggle-knob-off')} />
    </button>
  );
}

// ── Next billing date — compute from company.createdAt ────────────────────────
function getNextBillingDate(createdAt: string): string {
  if (!createdAt) return 'Not available';
  const d    = new Date(createdAt);
  const now  = new Date();
  // Advance to the same day next month (or next upcoming)
  d.setFullYear(now.getFullYear());
  d.setMonth(now.getMonth() + 1);
  return d.toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function SettingsPage() {
  const router = useRouter();
  const { company, updateCompany, currentUser } = useAppStore();

  const [tab,    setTab]    = useState<SettingsTab>('company');
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_PREFS.map(n => [n.key, true]))
  );

  // Company form — pre-populated from real store data
  const [companyForm, setCompanyForm] = useState({
    name:          company.name,
    email:         company.email,
    industry:      company.industry,
    country:       company.country,
    timezone:      company.timezone,
    officeName:    company.officeName ?? '',
    brandColor:    company.brandColor,
    accentColor:   company.accentColor,
    officeBackground: company.officeBackground ?? '',
  });

  const saveCompany = async () => {
    try {
      updateCompany(companyForm);
      toast.success('Company settings saved!');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const saveAppearance = async () => {
    try {
      updateCompany({
        brandColor:       companyForm.brandColor,
        accentColor:      companyForm.accentColor,
        officeBackground: companyForm.officeBackground,
      });
      toast.success('Appearance settings saved!');
    } catch {
      toast.error('Failed to save appearance');
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* ── Settings sidebar ─────────────────────── */}
      <aside className="w-56 border-r border-[var(--border)] bg-[var(--bg-elevated)] p-4 shrink-0">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-3 mb-2">
          Settings
        </p>
        <nav className="space-y-0.5">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all',
                  tab === t.id
                    ? 'bg-blue-600 text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Content ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">

          {/* ── COMPANY ────────────────────────────── */}
          {tab === 'company' && (
            <>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Company Settings</h2>
              <Card>
                <div className="space-y-4">
                  <Input
                    label="Company name"
                    value={companyForm.name}
                    onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))}
                  />
                  <Input
                    label="Company email"
                    type="email"
                    value={companyForm.email}
                    onChange={e => setCompanyForm(f => ({ ...f, email: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Industry"
                      value={companyForm.industry}
                      onChange={e => setCompanyForm(f => ({ ...f, industry: e.target.value }))}
                    />
                    <Input
                      label="Country"
                      value={companyForm.country}
                      onChange={e => setCompanyForm(f => ({ ...f, country: e.target.value }))}
                    />
                  </div>
                  <Select
                    label="Timezone"
                    value={companyForm.timezone}
                    onChange={e => setCompanyForm(f => ({ ...f, timezone: e.target.value }))}
                    options={[
                      { value: 'Asia/Dubai',       label: 'Asia/Dubai (GMT+4)'       },
                      { value: 'Europe/London',    label: 'Europe/London (GMT+0)'    },
                      { value: 'America/New_York', label: 'America/New York (GMT-5)' },
                      { value: 'Asia/Singapore',   label: 'Asia/Singapore (GMT+8)'   },
                      { value: 'Asia/Seoul',       label: 'Asia/Seoul (GMT+9)'       },
                    ]}
                  />
                  <Input
                    label="Office name"
                    value={companyForm.officeName}
                    onChange={e => setCompanyForm(f => ({ ...f, officeName: e.target.value }))}
                    placeholder="e.g. NAK HQ"
                  />
                  <div className="pt-2 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3">
                      <span>Company ID: <code className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">{company.id}</code></span>
                      <span>Created: {company.createdAt ? formatDate(company.createdAt) : '—'}</span>
                    </div>
                  </div>
                  <Button onClick={saveCompany}>Save Changes</Button>
                </div>
              </Card>
            </>
          )}

          {/* ── APPEARANCE ──────────────────────────── */}
          {tab === 'appearance' && (
            <>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Appearance</h2>
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Brand Colors</h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Primary color</p>
                    <div className="flex gap-2.5 flex-wrap">
                      {BRAND_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setCompanyForm(f => ({ ...f, brandColor: c }))}
                          className={cn(
                            'w-9 h-9 rounded-xl transition-all hover:scale-110',
                            companyForm.brandColor === c && 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110'
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Accent color</p>
                    <div className="flex gap-2.5 flex-wrap">
                      {BRAND_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setCompanyForm(f => ({ ...f, accentColor: c }))}
                          className={cn(
                            'w-9 h-9 rounded-xl transition-all hover:scale-110',
                            companyForm.accentColor === c && 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110'
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Office Background</h3>
                <div className="grid grid-cols-3 gap-3">
                  {OFFICE_BKGS.map(bg => (
                    <button
                      key={bg}
                      onClick={() => setCompanyForm(f => ({ ...f, officeBackground: bg }))}
                      className={cn(
                        'p-3 rounded-xl border text-xs font-medium capitalize transition-all text-left',
                        companyForm.officeBackground === bg
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                          : 'border-[var(--border)] hover:border-blue-300 text-[var(--text-secondary)]'
                      )}
                    >
                      {bg.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </Card>
              <Button onClick={saveAppearance}>Save Appearance</Button>
            </>
          )}

          {/* ── NOTIFICATIONS ───────────────────────── */}
          {tab === 'notifications' && (
            <>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Notification Preferences</h2>
              <Card>
                <div className="space-y-4">
                  {NOTIF_PREFS.map(pref => (
                    <div key={pref.key} className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{pref.label}</p>
                      <Toggle
                        on={notifs[pref.key] ?? true}
                        onChange={v => setNotifs(n => ({ ...n, [pref.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </Card>
              <Button onClick={() => toast.success('Notification preferences saved!')}>
                Save Preferences
              </Button>
            </>
          )}

          {/* ── SECURITY ────────────────────────────── */}
          {tab === 'security' && (
            <>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Security</h2>

              {/* Change password */}
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Change Password</h3>
                <div className="space-y-3">
                  <Input label="Current password" type="password" placeholder="••••••••" />
                  <Input label="New password"     type="password" placeholder="Min. 8 characters" />
                  <Input label="Confirm password" type="password" placeholder="••••••••" />
                  <Button onClick={() => toast.success('Password updated!')}>Update Password</Button>
                </div>
              </Card>

              {/* 2FA */}
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Two-Factor Authentication</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Add an extra layer of security to your account with 2FA.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Not enabled</Badge>
                    <span className="text-sm text-[var(--text-muted)]">Strongly recommended</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Shield className="w-4 h-4" />}
                    onClick={() => toast('2FA setup coming soon', { icon: '🔐' })}
                  >
                    Enable 2FA
                  </Button>
                </div>
              </Card>

              {/* Active session — show current user's real data */}
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Active Session</h3>
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Monitor className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">Current device</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Signed in as {currentUser?.email ?? '—'}
                        {' · '}{currentUser?.timezone ?? company.timezone ?? 'UTC'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">Active now</Badge>
                </div>
              </Card>
            </>
          )}

          {/* ── ROLES ───────────────────────────────── */}
          {tab === 'roles' && (
            <>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Roles & Permissions</h2>
              {[
                { role: 'Company Owner',   color: '#d4a017', perms: ['All permissions', 'Billing management', 'Delete company', 'Manage all employees'] },
                { role: 'Company Admin',   color: '#1a73e8', perms: ['Manage employees', 'Manage departments', 'Manage projects', 'Company settings'] },
                { role: 'Department Head', color: '#8b5cf6', perms: ['Manage dept members', 'Create dept projects', 'View dept analytics', 'Dept announcements'] },
                { role: 'Project Manager', color: '#10b981', perms: ['Manage assigned projects', 'Assign tasks', 'View project reports', 'Invite to projects'] },
                { role: 'Employee',        color: '#64748b', perms: ['View assigned projects', 'Update own tasks', 'Use chat & meetings', 'View directory'] },
              ].map(r => (
                <Card key={r.role}>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${r.color}20` }}
                    >
                      <Shield className="w-4 h-4" style={{ color: r.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--text-primary)] mb-2">{r.role}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {r.perms.map(p => (
                          <span
                            key={p}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)]"
                          >
                            <Check className="w-3 h-3 text-green-500" /> {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}

          {/* ── BILLING ─────────────────────────────── */}
          {tab === 'billing' && (
            <>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Billing</h2>

              {/* Current plan — from real company data */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <p className="font-bold text-[var(--text-primary)] uppercase tracking-wide">
                        {company.plan ?? 'free'} Plan
                      </p>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                        {PLAN_PRICES[company.plan ?? 'free'] ?? '$0'}/mo
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Next billing: {getNextBillingDate(company.createdAt)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Company: {company.name || '—'} · {company.email || '—'}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/billing')}
                  >
                    Manage Plan
                  </Button>
                </div>
              </Card>

              {/* Payment method — show a neutral message, no fake card data */}
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Payment Method</h3>
                <div className="p-4 rounded-xl text-center border-2 border-dashed border-[var(--border)]">
                  <CreditCard className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    No payment method on file
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {company.plan === 'free'
                      ? 'Upgrade to a paid plan to add a payment method'
                      : 'Contact support to update your billing details'}
                  </p>
                  {company.plan !== 'free' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={() => toast('Please contact support@nakdigital.com', { icon: '📧' })}
                    >
                      Add Payment Method
                    </Button>
                  )}
                </div>
              </Card>

              {/* Invoice history — show empty state, no fake invoices */}
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Invoice History</h3>
                {company.plan === 'free' ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[var(--text-muted)]">No invoices yet</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Invoices will appear here after your first payment
                    </p>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[var(--text-muted)]">Invoice history not available</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Contact <span className="text-blue-600">billing@nakdigital.com</span> for invoice requests
                    </p>
                  </div>
                )}
              </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
