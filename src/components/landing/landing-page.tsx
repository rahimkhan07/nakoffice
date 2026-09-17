'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight, Check, ChevronDown, ChevronUp,
  Building2, MessageSquare, FolderOpen, Video,
  Bot, Users, Shield, Menu, X, Sparkles,
  LayoutDashboard, Calendar, FileText,
  TrendingUp, Globe, Code2, Palette, Megaphone,
  Briefcase, HeartHandshake,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── NAK brand colours ──────────────────────────────────────────
const NAK_NAVY   = '#0a2540';
const NAK_GOLD   = '#d4a017';
const NAK_BLUE   = '#1a73e8';
const NAK_DARK   = '#061020';

// ── Logo mark ─────────────────────────────────────────────────
function NakLogo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center font-black tracking-tighter select-none shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${NAK_NAVY}, #142840)`,
        border: `1.5px solid rgba(212,160,23,0.45)`,
        color: NAK_GOLD,
        fontSize: size * 0.34,
      }}>
      NAK
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{ background: `${NAK_DARK}e0`, borderBottom: `1px solid rgba(212,160,23,0.15)` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <NakLogo size={34} />
          <div>
            <p className="font-bold text-white text-sm leading-tight">NAK Digital</p>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: NAK_GOLD }}>
              Virtual Office
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {['Features','Departments','How It Works'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="px-3 py-1.5 text-sm rounded-lg transition-colors"
              style={{ color: 'rgba(200,215,230,0.7)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,215,230,0.7)'; e.currentTarget.style.background = 'transparent'; }}>
              {item}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/login"
            className="hidden md:inline-flex text-sm px-3 py-2 transition-colors"
            style={{ color: 'rgba(200,215,230,0.8)' }}>
            Sign in
          </Link>
          <Link href="/signup"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:brightness-110"
            style={{ background: NAK_BLUE, color: '#fff' }}>
            Enter Office <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button className="md:hidden p-2" style={{ color: 'rgba(200,215,230,0.8)' }} onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-4 py-4 space-y-1" style={{ borderTop: `1px solid rgba(212,160,23,0.15)`, background: NAK_DARK }}>
          {['Features','Departments','How It Works'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="block px-3 py-2 text-sm rounded-lg"
              style={{ color: 'rgba(200,215,230,0.8)' }}
              onClick={() => setOpen(false)}>{item}</a>
          ))}
          <Link href="/login" className="block px-3 py-2 text-sm" style={{ color: 'rgba(200,215,230,0.8)' }}>
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden" style={{ background: NAK_DARK }}>
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{ background: NAK_BLUE }} />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
          style={{ background: NAK_GOLD }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-52 rounded-full blur-3xl opacity-15"
          style={{ background: NAK_NAVY }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{ background: 'rgba(212,160,23,0.12)', border: `1px solid rgba(212,160,23,0.3)`, color: NAK_GOLD }}>
          <Sparkles className="w-3.5 h-3.5" />
          NAK Digital Internal Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
          One Office.<br />
          <span style={{
            background: `linear-gradient(135deg, ${NAK_BLUE} 0%, ${NAK_GOLD} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Entire Team.
          </span><br />
          Anywhere.
        </h1>

        <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'rgba(200,215,230,0.75)' }}>
          The NAK Digital virtual office — where our development, design, marketing,
          sales and HR teams collaborate, communicate and ship great work together.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup"
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-xl text-base transition-all hover:brightness-110 hover:scale-105 active:scale-95 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${NAK_BLUE}, #1557c0)`, color: '#fff' }}>
            Enter Your Office <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-xl text-base transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
            Sign In
          </Link>
        </div>

        {/* Office preview mockup */}
        <div className="relative max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ border: `1px solid rgba(212,160,23,0.2)`, background: '#0d1f36' }}>
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#0a1a2e', borderBottom: '1px solid rgba(212,160,23,0.1)' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
              </div>
              <div className="flex-1 mx-4 rounded-md px-3 py-1 text-xs" style={{ background: '#142840', color: '#4a6580' }}>
                office.nakdigital.com
              </div>
            </div>

            {/* Virtual office canvas */}
            <div className="h-[360px] relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #061020 0%, #0a1e35 100%)' }}>
              {/* Grid */}
              <div className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(rgba(26,115,232,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,115,232,0.05) 1px, transparent 1px)',
                  backgroundSize: '44px 44px',
                }} />

              {/* Rooms */}
              {[
                { name:'Development', icon:'⚙️', color:'#1a73e8', x:30,  y:30,  w:180, h:120 },
                { name:'Design',      icon:'🎨', color:'#8b5cf6', x:225, y:30,  w:160, h:120 },
                { name:'Marketing',   icon:'📣', color:'#ec4899', x:400, y:30,  w:155, h:120 },
                { name:'Sales',       icon:'💼', color:'#d4a017', x:570, y:30,  w:150, h:120 },
                { name:'HR',          icon:'👥', color:'#22c55e', x:30,  y:185, w:155, h:105 },
                { name:'Meeting Rm',  icon:'🎯', color:'#06b6d4', x:200, y:185, w:180, h:105 },
                { name:'Lounge',      icon:'☕', color:'#84cc16', x:395, y:185, w:325, h:105 },
              ].map(r => (
                <div key={r.name} className="absolute rounded-xl flex flex-col"
                  style={{ left:r.x, top:r.y, width:r.w, height:r.h, border:`1.5px solid ${r.color}45`, background:`${r.color}10` }}>
                  <div className="flex items-center gap-1.5 px-3 pt-2.5">
                    <span className="text-base">{r.icon}</span>
                    <span className="text-xs font-semibold" style={{ color:r.color }}>{r.name}</span>
                  </div>
                </div>
              ))}

              {/* Avatars */}
              {[
                { initials:'RA', color:'#1a73e8', x:80,  y:75,  status:'#22c55e' },
                { initials:'AC', color:'#8b5cf6', x:255, y:70,  status:'#22c55e' },
                { initials:'SM', color:'#ec4899', x:430, y:70,  status:'#f59e0b' },
                { initials:'JW', color:'#d4a017', x:600, y:70,  status:'#ef4444' },
                { initials:'NH', color:'#22c55e', x:70,  y:235, status:'#22c55e' },
              ].map((av,i) => (
                <div key={i} className="absolute" style={{ left:av.x, top:av.y }}>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                      style={{ background:av.color }}>
                      {av.initials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                      style={{ background:av.status, border:'2px solid #061020' }} />
                  </div>
                </div>
              ))}

              {/* Floating chat */}
              <div className="absolute top-3 right-3 w-52 rounded-xl p-3 shadow-xl"
                style={{ background:'#0d1f36', border:'1px solid rgba(212,160,23,0.2)' }}>
                <p className="text-xs mb-1.5" style={{ color:'rgba(212,160,23,0.8)' }}>💬 General</p>
                <p className="text-xs text-white">Great work on the campaign launch! 🚀</p>
                <p className="text-[10px] mt-1" style={{ color:'#4a6580' }}>Rahim Al-Farsi · just now</p>
              </div>

              {/* Floating task widget */}
              <div className="absolute bottom-3 left-3 w-48 rounded-xl p-3 shadow-xl"
                style={{ background:'#0d1f36', border:'1px solid rgba(26,115,232,0.3)' }}>
                <p className="text-[10px] mb-1.5 font-medium" style={{ color:'rgba(26,115,232,0.9)' }}>📋 Active Sprint</p>
                <p className="text-xs text-white font-medium">Platform v2 Build</p>
                <div className="mt-2 h-1.5 rounded-full" style={{ background:'#142840' }}>
                  <div className="h-full rounded-full w-[72%]" style={{ background:'linear-gradient(90deg, #1a73e8, #d4a017)' }} />
                </div>
                <p className="text-[10px] mt-1" style={{ color:'#4a6580' }}>72% complete</p>
              </div>
            </div>
          </div>
          {/* Glow beneath card */}
          <div className="absolute -inset-4 -z-10 rounded-3xl blur-2xl opacity-20"
            style={{ background: `linear-gradient(135deg, ${NAK_BLUE}, ${NAK_GOLD})` }} />
        </div>

        {/* Stats */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
          {[
            { value:'8+',   label:'Team members'    },
            { value:'5',    label:'Departments'      },
            { value:'100%', label:'Remote-ready'     },
            { value:'24/7', label:'Always connected' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold" style={{ color:NAK_GOLD }}>{s.value}</p>
              <p className="text-xs" style={{ color:'rgba(200,215,230,0.5)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Departments ────────────────────────────────────────────────
const depts = [
  { icon: Code2,          name: 'Development',  color: '#1a73e8', desc: 'Full-stack engineering, platform architecture, and technical innovation.' },
  { icon: Palette,        name: 'Design',        color: '#8b5cf6', desc: 'UI/UX design, brand identity, and product aesthetics.' },
  { icon: Megaphone,      name: 'Marketing',     color: '#ec4899', desc: 'Campaigns, content strategy, SEO, and growth initiatives.' },
  { icon: Briefcase,      name: 'Sales',         color: '#d4a017', desc: 'Client acquisition, account management, and revenue growth.' },
  { icon: HeartHandshake, name: 'HR',            color: '#22c55e', desc: 'Talent, culture, people operations, and employee success.' },
];

function Departments() {
  return (
    <section id="departments" className="py-24" style={{ background: '#0a1a2e' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">
            Every team. <span style={{ color: NAK_GOLD }}>One office.</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(200,215,230,0.65)' }}>
            All NAK Digital departments in a single virtual workspace — each with their own room,
            channels, projects, and dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {depts.map(d => {
            const Icon = d.icon;
            return (
              <div key={d.name}
                className="rounded-2xl p-5 transition-all group hover:-translate-y-1"
                style={{ background: '#0d1f36', border: `1px solid ${d.color}25` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${d.color}18` }}>
                  <Icon className="w-5 h-5" style={{ color: d.color }} />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{d.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(200,215,230,0.55)' }}>{d.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Features ───────────────────────────────────────────────────
const features = [
  { icon: Building2,       color: NAK_BLUE,  title: '2D Virtual Office',    desc: 'Walk your avatar through NAK HQ. See who\'s in which room, join spontaneous conversations, and feel the team presence.' },
  { icon: MessageSquare,   color: '#8b5cf6', title: 'Team Chat',             desc: 'Company, department, group and direct messages with reactions, threads and file sharing.' },
  { icon: FolderOpen,      color: '#ec4899', title: 'Project Management',    desc: 'Kanban boards, tasks, sprints and timelines — all linked to your team members.' },
  { icon: Video,           color: '#06b6d4', title: 'Video Meetings',        desc: 'Start instant meetings from any office room. Screen sharing, recording and smart notes.' },
  { icon: LayoutDashboard, color: NAK_GOLD,  title: 'Personal Dashboard',    desc: 'Your meetings, tasks, projects and team activity — curated and ready every morning.' },
  { icon: Bot,             color: '#a855f7', title: 'NAK AI Assistant',      desc: 'Ask AI about your meetings, tasks or team. Summarise docs, create tasks and get instant answers.' },
  { icon: FileText,        color: '#10b981', title: 'File Management',        desc: 'Shared company storage organised by department and project with permissions.' },
  { icon: Calendar,        color: '#f59e0b', title: 'Team Calendar',          desc: 'Meetings, deadlines, events and company holidays — all in sync.' },
  { icon: Shield,          color: '#ef4444', title: 'Role-Based Access',      desc: 'Owner, admin, department head, manager and employee roles with granular permissions.' },
];

function Features() {
  return (
    <section id="features" className="py-24" style={{ background: NAK_DARK }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">
            Built for how <span style={{ color: NAK_GOLD }}>NAK Digital</span> works
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(200,215,230,0.65)' }}>
            Every feature is designed around how our team actually collaborates — not a generic tool.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title}
                className="rounded-2xl p-6 group transition-all"
                style={{ background: '#0d1f36', border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.border = `1px solid ${f.color}40`)}
                onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)')}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}1a` }}>
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(200,215,230,0.55)' }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── How it works ───────────────────────────────────────────────
const steps = [
  { n:'01', title:'Sign in to NAK Office',      desc:'Use your NAK Digital credentials to access your personalised virtual office.' },
  { n:'02', title:'Enter your department room', desc:'Walk your avatar to your department — Development, Design, Marketing, Sales or HR.' },
  { n:'03', title:'Start collaborating',        desc:'Chat, join meetings, work on projects, share files and track tasks — all in one place.' },
  { n:'04', title:'Stay connected anywhere',    desc:'Remote, in-office or on the road — the NAK Digital office is always open.' },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24" style={{ background: '#0a1a2e' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">Getting started is simple</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-px -translate-y-1/2"
                  style={{ background: `linear-gradient(90deg, ${NAK_GOLD}40, transparent)` }} />
              )}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(26,115,232,0.12)', border: `1px solid rgba(26,115,232,0.3)` }}>
                <span className="font-bold text-sm" style={{ color: NAK_BLUE }}>{s.n}</span>
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{s.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(200,215,230,0.55)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────
const faqs = [
  { q:'Who can access the NAK Digital Office?',  a:'Only verified NAK Digital team members with company email credentials or approved Google accounts can sign in.' },
  { q:'Can I use it on mobile?',                  a:'Yes. The platform is fully responsive. While the 2D virtual office is best on desktop, all core features work on mobile — chat, tasks, meetings and notifications.' },
  { q:'Is our company data secure?',              a:'Absolutely. All data is stored in Google Firebase with strict security rules. Only authenticated NAK team members can read or write company data.' },
  { q:'How does the virtual office work?',        a:'You control an avatar with WASD/arrow keys. Move between department rooms, see who is online, walk up to colleagues to start a conversation or video call.' },
  { q:'Can I work from outside Dubai?',           a:'Yes. NAK Digital Office works from anywhere in the world with an internet connection — remote, hybrid or on the go.' },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24" style={{ background: NAK_DARK }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Questions? We have answers.</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ border: `1px solid rgba(212,160,23,${open===i?'0.3':'0.12'})`, background:'#0d1f36' }}>
              <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open===i ? null : i)}>
                <span className="font-medium text-sm text-white">{f.q}</span>
                {open===i
                  ? <ChevronUp   className="w-4 h-4 shrink-0 ml-4" style={{ color: NAK_GOLD }} />
                  : <ChevronDown className="w-4 h-4 shrink-0 ml-4" style={{ color: 'rgba(200,215,230,0.4)' }} />
                }
              </button>
              {open===i && (
                <div className="px-5 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(200,215,230,0.6)' }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${NAK_NAVY} 0%, #0d1f36 100%)` }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: NAK_GOLD }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: NAK_BLUE }} />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
          style={{ background:'rgba(212,160,23,0.12)', border:`1px solid rgba(212,160,23,0.3)`, color:NAK_GOLD }}>
          <Sparkles className="w-3.5 h-3.5" />
          NAK Digital Team Platform
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
          Ready to enter<br />your office?
        </h2>
        <p className="text-base mb-10" style={{ color: 'rgba(200,215,230,0.7)' }}>
          Sign in with your NAK Digital account and walk into your virtual office right now.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup"
            className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base transition-all hover:brightness-110"
            style={{ background: '#fff', color: NAK_NAVY }}>
            Enter NAK Office <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-2 text-base font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.65)' }}>
            Already a member? Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-10" style={{ background: '#030d1a', borderTop: `1px solid rgba(212,160,23,0.12)` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <NakLogo size={30} />
            <div>
              <p className="text-white font-bold text-sm">NAK Digital</p>
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: NAK_GOLD }}>
                Virtual Office
              </p>
            </div>
          </div>
          <p className="text-xs text-center" style={{ color: 'rgba(200,215,230,0.3)' }}>
            © {new Date().getFullYear()} NAK Digital. Internal platform — confidential.
          </p>
          <div className="flex gap-5 text-xs" style={{ color: 'rgba(200,215,230,0.4)' }}>
            {['Privacy','Terms','Help'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Export ─────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div style={{ background: NAK_DARK }}>
      <Nav />
      <Hero />
      <Departments />
      <Features />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
