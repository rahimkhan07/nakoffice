'use client';

import { useState } from 'react';
import { Check, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, period: 'forever',
    color: '#64748b',
    features: ['Up to 5 employees','2 departments','3 active projects','5 GB storage','Basic virtual office','Community support'],
  },
  {
    id: 'starter', name: 'Starter', price: 19, period: 'month',
    color: '#3b82f6', popular: true,
    features: ['Up to 25 employees','10 departments','Unlimited projects','50 GB storage','Custom office layout','Video meetings (50h/mo)','Priority support','Basic analytics'],
  },
  {
    id: 'business', name: 'Business', price: 49, period: 'month',
    color: '#8b5cf6',
    features: ['Up to 100 employees','Unlimited departments','Unlimited projects','250 GB storage','Custom branding','AI Assistant (1000/mo)','Advanced analytics','24/7 support','SSO'],
  },
  {
    id: 'enterprise', name: 'Enterprise', price: null, period: '',
    color: '#f59e0b',
    features: ['Unlimited employees','Unlimited everything','Custom storage','Dedicated infra','SSO / SAML','Unlimited AI','SLA guarantee','Dedicated CSM'],
  },
] as Array<{
  id: string; name: string; price: number | null; period: string;
  color: string; popular?: boolean;
  features: readonly string[];
}>;

export function BillingPage() {
  const { company } = useAppStore();
  const [billing, setBilling] = useState<'monthly'|'yearly'>('monthly');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Subscription Plans</h2>
        <p className="text-[var(--text-secondary)]">Choose the right plan for your team. Upgrade or downgrade anytime.</p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 mt-5 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border)]">
          {(['monthly','yearly'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={cn('px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
                billing === b ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}>
              {b}
              {b === 'yearly' && <span className="ml-1.5 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">-20%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PLANS.map(plan => {
          const isCurrent = company.plan === plan.id;
          const price = plan.price === null ? null
            : billing === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;

          return (
            <div key={plan.id} className={cn(
              'relative rounded-2xl border flex flex-col p-6',
              isCurrent ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' :
              plan.popular ? 'border-blue-400' : 'border-[var(--border)] bg-[var(--bg-elevated)]'
            )}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}

              <div className="mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${plan.color}20` }}>
                  <Zap className="w-4.5 h-4.5" style={{ color: plan.color }} />
                </div>
                <h3 className="font-bold text-lg text-[var(--text-primary)]">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  {price === null ? (
                    <span className="text-2xl font-extrabold text-[var(--text-primary)]">Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold text-[var(--text-primary)]">${price}</span>
                      {plan.period && <span className="text-[var(--text-muted)] text-sm">/{plan.period}</span>}
                    </>
                  )}
                </div>
              </div>

              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={isCurrent ? 'secondary' : plan.popular ? 'primary' : 'outline'}
                fullWidth
                disabled={isCurrent}
                onClick={() => !isCurrent && toast.success(`Upgrading to ${plan.name}…`)}
              >
                {isCurrent ? 'Current Plan' : price === null ? 'Contact Sales' : 'Upgrade'}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Questions about billing?{' '}
          <button className="text-blue-600 hover:text-blue-700 font-medium">Contact our sales team</button>
        </p>
      </div>
    </div>
  );
}
