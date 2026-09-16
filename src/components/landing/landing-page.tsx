'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Zap, ArrowRight, Play, Check, ChevronDown, ChevronUp,
  Building2, MessageSquare, FolderOpen, Video, File,
  Bot, Users, Shield, Globe, Star, Menu, X,
  Sparkles, LayoutDashboard, Bell, Calendar,
  TrendingUp, Lock, Cpu, Wifi,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg">VirtOffice</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {['Features', 'How it works', 'Pricing', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/login"
            className="hidden md:inline-flex text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
            Sign in
          </Link>
          <Link href="/signup"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-4 py-4 space-y-1">
          {['Features', 'How it works', 'Pricing', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="block px-3 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setOpen(false)}>
              {item}
            </a>
          ))}
          <Link href="/login" className="block px-3 py-2 text-sm text-slate-400 hover:text-white">Sign in</Link>
        </div>
      )}
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-slate-950">
      {/* Gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-blue-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-sm font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Now with AI-powered Office Assistant
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
          Your Company.
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Your Office.
          </span>
          <br />
          Anywhere.
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Build a virtual workplace where your team can collaborate, communicate
          and work together from anywhere in the world.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/50">
            Create Your Virtual Office <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/office"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all border border-white/20">
            <Play className="w-4 h-4 fill-current" /> Explore Demo
          </Link>
        </div>

        {/* Mock Office Preview */}
        <div className="relative max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden shadow-2xl shadow-black/50">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-500">
                app.virtoffice.io/nak-digital/office
              </div>
            </div>

            {/* Office preview */}
            <div className="h-[380px] relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            }}>
              {/* Grid */}
              <div className="absolute inset-0 office-grid opacity-20" />

              {/* Rooms */}
              {[
                { name: 'Development', icon: '⚙️', color: '#3b82f6', x: 40, y: 40, w: 180, h: 120 },
                { name: 'Design', icon: '🎨', color: '#8b5cf6', x: 240, y: 40, w: 160, h: 120 },
                { name: 'Marketing', icon: '📣', color: '#ec4899', x: 420, y: 40, w: 150, h: 120 },
                { name: 'Meeting Room', icon: '🎯', color: '#06b6d4', x: 590, y: 40, w: 160, h: 120 },
                { name: 'Sales', icon: '💼', color: '#f59e0b', x: 40, y: 200, w: 150, h: 100 },
                { name: 'HR', icon: '👥', color: '#10b981', x: 210, y: 200, w: 150, h: 100 },
                { name: 'Lounge', icon: '☕', color: '#84cc16', x: 380, y: 200, w: 370, h: 100 },
              ].map(room => (
                <div key={room.name} className="absolute rounded-xl border-2 flex flex-col items-center justify-center"
                  style={{
                    left: room.x, top: room.y, width: room.w, height: room.h,
                    borderColor: `${room.color}50`,
                    backgroundColor: `${room.color}15`,
                  }}>
                  <span className="text-lg">{room.icon}</span>
                  <span className="text-xs font-medium mt-1" style={{ color: room.color }}>{room.name}</span>
                </div>
              ))}

              {/* Avatars */}
              {[
                { name: 'R', color: '#3b82f6', x: 90,  y: 90,  status: 'available' },
                { name: 'A', color: '#8b5cf6', x: 270, y: 85,  status: 'available' },
                { name: 'S', color: '#ec4899', x: 470, y: 90,  status: 'away'      },
                { name: 'J', color: '#f59e0b', x: 80,  y: 240, status: 'busy'      },
                { name: 'N', color: '#10b981', x: 240, y: 240, status: 'available' },
              ].map(av => (
                <div key={av.name} className="absolute" style={{ left: av.x, top: av.y }}>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                      style={{ backgroundColor: av.color }}>
                      {av.name}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900"
                      style={{ backgroundColor: av.status === 'available' ? '#22c55e' : av.status === 'away' ? '#f59e0b' : '#ef4444' }} />
                  </div>
                </div>
              ))}

              {/* Floating chat bubble */}
              <div className="absolute top-4 right-4 bg-slate-800 border border-white/10 rounded-xl p-3 w-52 shadow-lg">
                <p className="text-xs text-slate-400 mb-1.5">💬 Team Chat</p>
                <p className="text-xs text-white">Great work on the v2 launch! 🚀</p>
                <p className="text-xs text-slate-500 mt-1">Alex Chen · just now</p>
              </div>

              {/* Floating task card */}
              <div className="absolute bottom-4 left-4 bg-slate-800 border border-white/10 rounded-xl p-3 w-48 shadow-lg">
                <p className="text-xs text-slate-400 mb-1.5">✅ Active Task</p>
                <p className="text-xs text-white font-medium">Virtual Office UI</p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-700">
                  <div className="h-full rounded-full bg-blue-500 w-[65%]" />
                </div>
                <p className="text-xs text-slate-500 mt-1">65% complete</p>
              </div>
            </div>
          </div>

          {/* Glow */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 -z-10 blur-xl" />
        </div>

        {/* Social proof */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
          <span>Trusted by modern teams at</span>
          {['Acme Corp', 'TechFlow', 'Nexus Inc', 'BuilderCo', 'SprintLabs'].map(co => (
            <span key={co} className="font-semibold text-slate-400">{co}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Building2, color: '#3b82f6',
    title: 'Virtual Office',
    desc: 'A real 2D interactive office where your team lives. See who\'s in which room, move your avatar, and spontaneously collaborate.',
  },
  {
    icon: MessageSquare, color: '#8b5cf6',
    title: 'Team Communication',
    desc: 'Company-wide, department, group, and private chats. Reactions, threads, file sharing, and typing indicators.',
  },
  {
    icon: FolderOpen, color: '#ec4899',
    title: 'Project Management',
    desc: 'Kanban boards, task assignments, priorities, checklists, and activity history — all connected to your virtual office.',
  },
  {
    icon: Video, color: '#06b6d4',
    title: 'Video Meetings',
    desc: 'Start meetings from any room in the office. Screen sharing, participant list, recording, and meeting notes.',
  },
  {
    icon: File, color: '#f59e0b',
    title: 'File Management',
    desc: 'Company cloud storage organized by department and project. Upload, preview, share, and manage permissions.',
  },
  {
    icon: Bot, color: '#a855f7',
    title: 'AI Office Assistant',
    desc: 'Ask AI anything about your meetings, tasks, or team. Summarize meetings, create tasks, and get instant answers.',
  },
  {
    icon: Calendar, color: '#10b981',
    title: 'Calendar & Events',
    desc: 'Company calendar with meetings, deadlines, and events. Month, week, and day views synchronized with your projects.',
  },
  {
    icon: LayoutDashboard, color: '#f59e0b',
    title: 'Smart Dashboard',
    desc: 'Personalized employee dashboard with tasks, meetings, messages, and team activity at a glance.',
  },
  {
    icon: Shield, color: '#ef4444',
    title: 'Security & RBAC',
    desc: 'Role-based access control, tenant isolation, encrypted data, and complete audit logs for every action.',
  },
];

function Features() {
  return (
    <section id="features" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything your team needs,{' '}
            <span className="text-gradient">in one office</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Replace a dozen tools with one beautiful virtual workspace your team will actually use every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title}
                className="group rounded-2xl border border-white/5 bg-slate-900/50 p-6 hover:border-white/10 hover:bg-slate-900 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${f.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
const steps = [
  { step: '01', title: 'Create your virtual office', desc: 'Sign up and build your company\'s digital HQ in minutes. Add your logo, brand colors, and office layout.' },
  { step: '02', title: 'Invite your team', desc: 'Send invites by email. Team members join and appear as avatars in your virtual office automatically.' },
  { step: '03', title: 'Set up departments & projects', desc: 'Create departments, assign roles, and spin up projects with kanban boards and task management.' },
  { step: '04', title: 'Start working together', desc: 'Your team walks into the office every morning. Chat, meet, collaborate, and get work done — together.' },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Up and running in minutes</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            No complex setup. Your office is ready before your next standup.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-blue-600/50 to-transparent -translate-y-1/2 z-0" />
              )}
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center mb-4">
                  <span className="text-blue-400 font-bold text-sm">{s.step}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
const plans = [
  {
    name: 'Free', price: '$0', period: 'forever',
    desc: 'Perfect for small teams getting started.',
    color: '#64748b',
    features: ['Up to 5 employees', '2 departments', '3 active projects', '5GB storage', 'Basic virtual office', 'Community support'],
    cta: 'Get Started Free', href: '/signup',
  },
  {
    name: 'Starter', price: '$19', period: 'per month',
    desc: 'For growing teams that need more power.',
    color: '#3b82f6',
    features: ['Up to 25 employees', '10 departments', 'Unlimited projects', '50GB storage', 'Custom office layout', 'Video meetings (50h/mo)', 'Priority support'],
    cta: 'Start Free Trial', href: '/signup?plan=starter',
    popular: true,
  },
  {
    name: 'Business', price: '$49', period: 'per month',
    desc: 'For established teams with advanced needs.',
    color: '#8b5cf6',
    features: ['Up to 100 employees', 'Unlimited departments', 'Unlimited projects', '250GB storage', 'Custom branding', 'AI Assistant (1000 calls/mo)', 'Advanced analytics', '24/7 support'],
    cta: 'Start Free Trial', href: '/signup?plan=business',
  },
  {
    name: 'Enterprise', price: 'Custom', period: '',
    desc: 'For large organizations needing full control.',
    color: '#f59e0b',
    features: ['Unlimited employees', 'Unlimited everything', 'Custom storage', 'Dedicated infrastructure', 'SSO / SAML', 'Unlimited AI usage', 'SLA guarantee', 'Dedicated CSM'],
    cta: 'Contact Sales', href: '/contact',
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Start free. Scale as your team grows. No hidden fees.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map(plan => (
            <div key={plan.name}
              className={cn(
                'relative rounded-2xl border p-6 flex flex-col',
                plan.popular
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-white/5 bg-slate-900/50'
              )}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${plan.color}20` }}>
                  <Zap className="w-4 h-4" style={{ color: plan.color }} />
                </div>
                <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{plan.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  {plan.period && <span className="text-slate-400 text-sm">/{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}
                className={cn(
                  'block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                )}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const testimonials = [
  { name: 'Sarah K.', role: 'CEO, TechFlow', text: 'VirtOffice transformed how our remote team works. We actually feel like we\'re in the same office now.', stars: 5 },
  { name: 'Marcus T.', role: 'Head of Product, Nexus', text: 'The virtual office concept is brilliant. Our team engagement and productivity increased by 40% in the first month.', stars: 5 },
  { name: 'Aisha R.', role: 'HR Director, BuilderCo', text: 'Onboarding new employees is so much better now. They can walk into the virtual office and immediately feel part of the team.', stars: 5 },
];

function Testimonials() {
  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Loved by remote teams worldwide</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="rounded-2xl bg-slate-800/50 border border-white/5 p-6">
              <div className="flex mb-3">
                {Array(t.stars).fill(0).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-slate-500 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'What is VirtOffice?', a: 'VirtOffice is a SaaS platform that creates a virtual digital office for your company. Your team gets a 2D interactive office environment with real-time communication, project management, video meetings, and AI assistance.' },
  { q: 'How is this different from Slack or Teams?', a: 'VirtOffice combines communication, project management, file storage, video meetings, and a visual virtual office into one platform. Instead of switching between 5 tools, everything lives in your virtual office.' },
  { q: 'Can I try it for free?', a: 'Yes! Our Free plan includes up to 5 employees and 2 departments forever, no credit card required. Paid plans also come with a 14-day free trial.' },
  { q: 'Is our company data secure?', a: 'Absolutely. Each company gets fully isolated data tenants. We use encryption at rest and in transit, RBAC, audit logs, and follow industry-standard security practices.' },
  { q: 'Can I customize the virtual office for my brand?', a: 'Yes — on Starter and above plans you can customize the office layout, background, room names, company colors, and logo to match your brand identity.' },
  { q: 'Does it work on mobile?', a: 'Yes. VirtOffice is fully responsive. While the 2D virtual office is best experienced on desktop, mobile users get a full-featured app with chat, tasks, meetings, and notifications.' },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-slate-900/50 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="text-white font-medium text-sm">{faq.q}</span>
                {openIdx === i
                  ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-4" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-4" />
                }
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5">
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/50 border border-blue-700 text-blue-300 text-sm mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Join 2,000+ remote teams
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
          Ready to open your virtual office?
        </h2>
        <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto">
          Set up your company&apos;s virtual office in under 5 minutes. Free forever for small teams.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-8 py-4 rounded-xl text-base hover:bg-blue-50 transition-colors shadow-lg">
            Create Your Virtual Office <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/office"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium text-base">
            <Play className="w-4 h-4 fill-current" /> See live demo
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold">VirtOffice</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            {['Privacy', 'Terms', 'Security', 'Blog', 'Contact'].map(link => (
              <a key={link} href="#" className="hover:text-slate-300 transition-colors">{link}</a>
            ))}
          </div>
          <p className="text-slate-600 text-sm">© 2026 VirtOffice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
