'use client';

import { useState } from 'react';
import {
  Building2, Palette, Bell, Shield, Users, CreditCard,
  Zap, Globe, Lock, Eye, EyeOff, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, Select, Textarea } from '@/components/ui/input';
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

const BRAND_COLORS = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#06b6d4','#ef4444','#84cc16'];
const OFFICE_BKGS  = ['gradient-blue','gradient-purple','gradient-green','dark-tech','light-minimal','corporate'];

const NOTIF_PREFS = [
  { key: 'newMessage',       label: 'New messages',          on: true  },
  { key: 'taskAssigned',     label: 'Task assigned to you',  on: true  },
  { key: 'taskUpdated',      label: 'Task status changed',   on: false },
  { key: 'meetingScheduled', label: 'Meeting scheduled',     on: true  },
  { key: 'mention',          label: 'Someone mentions you',  on: true  },
  { key: 'fileShared',       label: 'File shared with you',  on: false },
  { key: 'announcement',     label: 'New announcement',      on: true  },
  { key: 'projectUpdate',    label: 'Project updates',       on: false },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className={cn(
        'w-10 h-5.5 rounded-full relative transition-colors',
        on ? 'bg-blue-600' : 'bg-[var(--bg-tertiary)] border border-[var(--border)]'
      )}>
      <span className={cn(
        'absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform',
        on && 'translate-x-4.5'
      )} />
    </button>
  );
}

export function SettingsPage() {
  const { company } = useAppStore();
  const [tab,   setTab]   = useState<SettingsTab>('company');
  const [notifs, setNotifs] = useState(Object.fromEntries(NOTIF_PREFS.map(n => [n.key, n.on])));

  const save = () => toast.success('Settings saved!');

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="w-56 border-r border-[var(--border)] bg-[var(--bg-elevated)] p-4 shrink-0">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-3 mb-2">Settings</p>
        <nav className="space-y-0.5">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all',
                  tab === t.id
                    ? 'bg-blue-600 text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                )}>
                <Icon className="w-4 h-4 shrink-0" />
                {t.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          {/* ── Company ── */}
          {tab === 'company' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Company Settings</h2>
              <Card>
                <div className="space-y-4">
                  <Input label="Company name"  defaultValue={company.name}    />
                  <Input label="Company email" defaultValue={company.email}   type="email" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Industry"    defaultValue={company.industry} />
                    <Input label="Country"     defaultValue={company.country}  />
                  </div>
                  <Select label="Timezone" defaultValue={company.timezone}
                    options={[
                      { value:'Asia/Dubai',   label:'Asia/Dubai (GMT+4)'   },
                      { value:'Europe/London',label:'Europe/London (GMT+0)' },
                      { value:'America/New_York',label:'America/New_York (GMT-5)' },
                    ]} />
                  <Input label="Office name"  defaultValue={company.officeName ?? ''} placeholder="e.g. HQ" />
                  <Button onClick={save}>Save Changes</Button>
                </div>
              </Card>
            </div>
          )}

          {/* ── Appearance ── */}
          {tab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Appearance</h2>
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Brand Colors</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Primary color</p>
                    <div className="flex gap-2.5">
                      {BRAND_COLORS.map(c => (
                        <button key={c} className={cn('w-9 h-9 rounded-xl transition-all hover:scale-110', company.brandColor === c && 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110')}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Accent color</p>
                    <div className="flex gap-2.5">
                      {BRAND_COLORS.map(c => (
                        <button key={c} className={cn('w-9 h-9 rounded-xl transition-all hover:scale-110', company.accentColor === c && 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110')}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Office Background</h3>
                <div className="grid grid-cols-3 gap-3">
                  {OFFICE_BKGS.map(bg => (
                    <button key={bg} className={cn(
                      'p-3 rounded-xl border text-xs font-medium capitalize transition-all',
                      company.officeBackground === bg
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                        : 'border-[var(--border)] hover:border-blue-300 text-[var(--text-secondary)]'
                    )}>
                      {bg.replace(/-/g,' ')}
                    </button>
                  ))}
                </div>
              </Card>
              <Button onClick={save}>Save Appearance</Button>
            </div>
          )}

          {/* ── Notifications ── */}
          {tab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Notification Preferences</h2>
              <Card>
                <div className="space-y-4">
                  {NOTIF_PREFS.map(pref => (
                    <div key={pref.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{pref.label}</p>
                      </div>
                      <Toggle on={notifs[pref.key]} onChange={v => setNotifs(n => ({ ...n, [pref.key]: v }))} />
                    </div>
                  ))}
                </div>
              </Card>
              <Button onClick={save}>Save Preferences</Button>
            </div>
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Security</h2>
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Change Password</h3>
                <div className="space-y-3">
                  <Input label="Current password" type="password" placeholder="••••••••" />
                  <Input label="New password" type="password" placeholder="Min. 8 characters" />
                  <Input label="Confirm new password" type="password" placeholder="••••••••" />
                  <Button onClick={() => toast.success('Password updated!')}>Update Password</Button>
                </div>
              </Card>
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Two-Factor Authentication</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Add an extra layer of security to your account.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Not enabled</Badge>
                    <span className="text-sm text-[var(--text-muted)]">2FA is recommended</span>
                  </div>
                  <Button variant="secondary" size="sm" icon={<Shield className="w-4 h-4" />}>
                    Enable 2FA
                  </Button>
                </div>
              </Card>
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Active Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device:'Chrome on Windows', location:'Dubai, UAE', current:true  },
                    { device:'Safari on iPhone',  location:'Dubai, UAE', current:false },
                  ].map((s,i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)]">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{s.device}</p>
                        <p className="text-xs text-[var(--text-muted)]">{s.location}</p>
                      </div>
                      {s.current
                        ? <Badge variant="success">Current</Badge>
                        : <Button variant="ghost" size="xs">Revoke</Button>
                      }
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ── Roles ── */}
          {tab === 'roles' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Roles & Permissions</h2>
              {[
                { role:'Company Owner',   color:'#f59e0b', perms:['All permissions','Billing','Delete company'] },
                { role:'Company Admin',   color:'#3b82f6', perms:['Manage employees','Manage departments','Manage projects','Company settings'] },
                { role:'Department Head', color:'#8b5cf6', perms:['Manage dept members','Create dept projects','View dept analytics'] },
                { role:'Project Manager', color:'#10b981', perms:['Manage assigned projects','Assign tasks','View project reports'] },
                { role:'Employee',        color:'#64748b', perms:['View assigned projects','Update own tasks','Use chat & meetings'] },
              ].map(r => (
                <Card key={r.role}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${r.color}20` }}>
                      <Shield className="w-4 h-4" style={{ color: r.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--text-primary)] mb-2">{r.role}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {r.perms.map(p => (
                          <span key={p} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)]">
                            <Check className="w-3 h-3 text-green-500" /> {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ── Billing ── */}
          {tab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Billing</h2>
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <p className="font-bold text-[var(--text-primary)] uppercase tracking-wide">{company.plan} Plan</p>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">Billed monthly · Next billing: Oct 1, 2026</p>
                  </div>
                  <Button variant="secondary" size="sm">Upgrade Plan</Button>
                </div>
              </Card>
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Payment Method</h3>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
                  <CreditCard className="w-5 h-5 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Visa ending in 4242</p>
                    <p className="text-xs text-[var(--text-muted)]">Expires 12/27</p>
                  </div>
                  <Button variant="ghost" size="xs" className="ml-auto">Change</Button>
                </div>
              </Card>
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Invoice History</h3>
                <div className="space-y-2">
                  {[
                    { date:'Sep 1, 2026', amount:'$49.00', status:'Paid' },
                    { date:'Aug 1, 2026', amount:'$49.00', status:'Paid' },
                    { date:'Jul 1, 2026', amount:'$49.00', status:'Paid' },
                  ].map((inv, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <span className="text-sm text-[var(--text-secondary)]">{inv.date}</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{inv.amount}</span>
                      <Badge variant="success">{inv.status}</Badge>
                      <Button variant="ghost" size="xs">Download</Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
