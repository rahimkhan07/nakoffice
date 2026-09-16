'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Building2, Image as ImageIcon, Briefcase, Users, Layers, Mail, Layout, Palette, Rocket, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'Company Name',   icon: Building2,  desc: 'What\'s your company called?' },
  { id: 2, title: 'Company Logo',   icon: ImageIcon,  desc: 'Add your brand identity' },
  { id: 3, title: 'Industry',       icon: Briefcase,  desc: 'Tell us about your business' },
  { id: 4, title: 'Team Size',      icon: Users,      desc: 'How big is your team?' },
  { id: 5, title: 'Departments',    icon: Layers,     desc: 'Set up your structure' },
  { id: 6, title: 'Invite Team',    icon: Mail,       desc: 'Bring your team aboard' },
  { id: 7, title: 'Office Layout',  icon: Layout,     desc: 'Design your virtual space' },
  { id: 8, title: 'Branding',       icon: Palette,    desc: 'Make it your own' },
  { id: 9, title: 'All Done!',      icon: Rocket,     desc: 'Your office is ready' },
];

const INDUSTRIES = [
  { value: 'technology', label: 'Technology & Software' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'ecommerce', label: 'E-Commerce & Retail' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'other', label: 'Other' },
];

const SIZES = [
  { value: '1-5',     label: '1–5', sub: 'Just getting started' },
  { value: '6-15',    label: '6–15', sub: 'Small team' },
  { value: '16-50',   label: '16–50', sub: 'Growing team' },
  { value: '51-200',  label: '51–200', sub: 'Mid-size company' },
  { value: '201-500', label: '201–500', sub: 'Large company' },
  { value: '500+',    label: '500+', sub: 'Enterprise' },
];

const LAYOUTS = [
  { id: 'modern',    name: 'Modern HQ',     desc: 'Clean open-plan with collaborative spaces' },
  { id: 'classic',   name: 'Classic Office', desc: 'Traditional layout with private offices' },
  { id: 'startup',   name: 'Startup Hub',   desc: 'Energetic and dynamic work environment' },
  { id: 'enterprise', name: 'Enterprise',   desc: 'Multiple floors with dedicated zones' },
];

const DEFAULT_DEPTS = ['Development', 'Design', 'Marketing', 'Sales', 'HR'];

const BRAND_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#84cc16'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((s, i) => {
        const done    = currentStep > s.id;
        const active  = currentStep === s.id;
        return (
          <div key={s.id} className="flex items-center gap-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
              done   ? 'bg-green-500 text-white' :
              active ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900' :
                       'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            )}>
              {done ? <Check className="w-3.5 h-3.5" /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('w-6 h-0.5 transition-colors', done ? 'bg-green-400' : 'bg-[var(--border)]')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    companyName: 'NAK Digital',
    logo: '',
    industry: 'technology',
    size: '11-50',
    departments: DEFAULT_DEPTS,
    inviteEmails: '',
    layout: 'modern',
    brandColor: '#3b82f6',
    accentColor: '#8b5cf6',
  });

  const next = () => setStep(s => Math.min(s + 1, STEPS.length));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const finish = () => {
    toast.success('Your virtual office is ready! Welcome aboard 🎉');
    router.push('/dashboard');
  };

  const stepInfo = STEPS[step - 1];
  const Icon = stepInfo.icon;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Icon className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{stepInfo.title}</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{stepInfo.desc}</p>
        </div>

        <StepIndicator currentStep={step} />

        {/* Step card */}
        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <Input label="Company name" value={data.companyName}
                onChange={e => setData(d => ({ ...d, companyName: e.target.value }))}
                placeholder="e.g. Acme Corp" inputSize="lg" />
              <Input label="Company email" type="email" placeholder="hello@yourcompany.com" inputSize="lg" />
              <Input label="Country" placeholder="e.g. United Arab Emirates" inputSize="lg" />
              <Select label="Timezone" value="Asia/Dubai"
                options={[
                  { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)' },
                  { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
                  { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
                  { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+8)' },
                ]} />
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-2xl p-12 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                <Upload className="w-10 h-10 text-[var(--text-muted)] mb-3" />
                <p className="text-sm font-medium text-[var(--text-primary)]">Upload company logo</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, SVG up to 5MB</p>
                <Button variant="outline" size="sm" className="mt-4">Choose file</Button>
              </div>
              <p className="text-center text-sm text-[var(--text-muted)]">or skip for now and add it later</p>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-3">
              {INDUSTRIES.map(ind => (
                <button key={ind.value}
                  onClick={() => setData(d => ({ ...d, industry: ind.value }))}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                    data.industry === ind.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                      : 'border-[var(--border)] hover:border-[var(--border)] hover:bg-[var(--bg-secondary)]'
                  )}>
                  <span className="flex-1 text-sm font-medium">{ind.label}</span>
                  {data.industry === ind.value && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="grid grid-cols-2 gap-3">
              {SIZES.map(s => (
                <button key={s.value}
                  onClick={() => setData(d => ({ ...d, size: s.value }))}
                  className={cn(
                    'flex flex-col items-center p-5 rounded-xl border transition-all',
                    data.size === s.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-[var(--border)] hover:bg-[var(--bg-secondary)]'
                  )}>
                  <span className={cn('text-2xl font-extrabold mb-1', data.size === s.value ? 'text-blue-600' : 'text-[var(--text-primary)]')}>{s.label}</span>
                  <span className="text-xs text-[var(--text-muted)]">{s.sub}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)] mb-3">Select or create your departments:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Development', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Customer Success', 'Legal'].map(dept => (
                  <button key={dept}
                    onClick={() => setData(d => ({
                      ...d,
                      departments: d.departments.includes(dept)
                        ? d.departments.filter(x => x !== dept)
                        : [...d.departments, dept]
                    }))}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                      data.departments.includes(dept)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-blue-400'
                    )}>
                    {data.departments.includes(dept) ? '✓ ' : '+ '}{dept}
                  </button>
                ))}
              </div>
              <Input placeholder="+ Add custom department" inputSize="sm" />
            </div>
          )}

          {/* Step 6 */}
          {step === 6 && (
            <div className="space-y-4">
              <Textarea label="Invite by email (one per line)"
                value={data.inviteEmails}
                onChange={e => setData(d => ({ ...d, inviteEmails: e.target.value }))}
                placeholder={'colleague@company.com\nanother@company.com'}
                rows={5} />
              <p className="text-xs text-[var(--text-muted)]">They&apos;ll receive an email invitation to join your virtual office.</p>
              <Button variant="secondary" size="sm" fullWidth>Skip for now</Button>
            </div>
          )}

          {/* Step 7 */}
          {step === 7 && (
            <div className="space-y-3">
              {LAYOUTS.map(layout => (
                <button key={layout.id}
                  onClick={() => setData(d => ({ ...d, layout: layout.id }))}
                  className={cn(
                    'w-full flex items-start gap-4 px-4 py-4 rounded-xl border transition-all text-left',
                    data.layout === layout.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-[var(--border)] hover:bg-[var(--bg-secondary)]'
                  )}>
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    data.layout === layout.id ? 'bg-blue-600' : 'bg-[var(--bg-tertiary)]')}>
                    <Layout className={cn('w-5 h-5', data.layout === layout.id ? 'text-white' : 'text-[var(--text-muted)]')} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[var(--text-primary)]">{layout.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{layout.desc}</p>
                  </div>
                  {data.layout === layout.id && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                </button>
              ))}
            </div>
          )}

          {/* Step 8 */}
          {step === 8 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Primary brand color</p>
                <div className="flex flex-wrap gap-2">
                  {BRAND_COLORS.map(color => (
                    <button key={color}
                      onClick={() => setData(d => ({ ...d, brandColor: color }))}
                      className={cn('w-10 h-10 rounded-xl transition-all', data.brandColor === color && 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110')}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Accent color</p>
                <div className="flex flex-wrap gap-2">
                  {BRAND_COLORS.map(color => (
                    <button key={color}
                      onClick={() => setData(d => ({ ...d, accentColor: color }))}
                      className={cn('w-10 h-10 rounded-xl transition-all', data.accentColor === color && 'ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110')}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                <p className="text-xs text-[var(--text-muted)] mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: data.brandColor }} />
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{data.companyName}</p>
                    <p className="text-xs" style={{ color: data.accentColor }}>Virtual Office</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 9 */}
          {step === 9 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-3xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Your office is ready! 🎉
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-2">
                <strong>{data.companyName}</strong> is all set up with:
              </p>
              <div className="mt-4 space-y-2 text-sm text-left max-w-xs mx-auto">
                {[
                  `✅ Company profile configured`,
                  `✅ ${data.departments.length} departments created`,
                  `✅ ${data.layout} office layout selected`,
                  `✅ Brand colors applied`,
                  `✅ Team invitations sent`,
                ].map(item => (
                  <p key={item} className="text-[var(--text-secondary)]">{item}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" onClick={back} disabled={step === 1} size="sm">
            Back
          </Button>
          <p className="text-xs text-[var(--text-muted)]">Step {step} of {STEPS.length}</p>
          {step < STEPS.length ? (
            <Button onClick={next} size="sm" iconRight={<ChevronRight className="w-4 h-4" />}>
              Continue
            </Button>
          ) : (
            <Button onClick={finish} size="sm">
              Enter My Office 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
