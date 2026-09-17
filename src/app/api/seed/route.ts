// ─────────────────────────────────────────────────────────────────────────────
// POST /api/seed?force=true   — seeds ALL Firestore collections
//
// Collections seeded:
//   companies · users · departments · projects · tasks · meetings
//   channels  · messages · files · announcements · notifications
//   calendarEvents · virtualRooms · activityLog
//
// BEFORE RUNNING:
//   Set Firestore rules to allow all:
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{database}/documents {
//       match /{document=**} { allow read, write: if true; }
//     }
//   }
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, writeBatch, collection, deleteDoc, getDocs } from 'firebase/firestore';
import type {
  Company, User, Department, Project, Task, Meeting,
  Channel, Message, FileItem, Announcement, Notification,
  CalendarEvent, VirtualRoom, ActivityLog,
} from '@/types';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? 'company-1';

// ── helpers ──────────────────────────────────────────────────
function id(prefix: string, n: number | string) { return `${prefix}-${n}`; }
const now = () => new Date().toISOString();
const future = (ms: number) => new Date(Date.now() + ms).toISOString();
const past   = (ms: number) => new Date(Date.now() - ms).toISOString();

// ── delete an entire collection ───────────────────────────────
async function clearCollection(col: string) {
  const snaps = await getDocs(collection(db, col));
  const b = writeBatch(db);
  snaps.docs.forEach(d => b.delete(d.ref));
  if (snaps.docs.length) await b.commit();
}

export async function POST(req: NextRequest) {
  const force = req.nextUrl.searchParams.get('force') === 'true';

  try {
    // Guard: skip unless ?force=true
    if (!force) {
      const existing = await getDoc(doc(db, 'companies', COMPANY_ID));
      if (existing.exists()) {
        return NextResponse.json({
          ok: true,
          message: 'Already seeded. Pass ?force=true to re-seed.',
        });
      }
    }

    // ── Delete all existing data when force=true ──────────────
    if (force) {
      await Promise.all([
        clearCollection('companies'),     clearCollection('users'),
        clearCollection('departments'),   clearCollection('projects'),
        clearCollection('tasks'),         clearCollection('meetings'),
        clearCollection('channels'),      clearCollection('messages'),
        clearCollection('files'),         clearCollection('announcements'),
        clearCollection('notifications'), clearCollection('calendarEvents'),
        clearCollection('virtualRooms'),  clearCollection('activityLog'),
      ]);
    }

    const T = now();
    const b1 = writeBatch(db); // batch 1 — company, users, departments
    const b2 = writeBatch(db); // batch 2 — projects, tasks
    const b3 = writeBatch(db); // batch 3 — meetings, channels, messages
    const b4 = writeBatch(db); // batch 4 — files, announcements, notifications
    const b5 = writeBatch(db); // batch 5 — calendarEvents, virtualRooms, activityLog

    // ═══════════════════════════════════════════════════════════
    // 1. COMPANY
    // ═══════════════════════════════════════════════════════════
    const company: Company = {
      id: COMPANY_ID, name: 'NAK Digital', slug: 'nak-digital',
      email: 'hello@nakdigital.com', industry: 'Technology & Digital Agency',
      size: '11-50', country: 'UAE', timezone: 'Asia/Dubai',
      brandColor: '#1a73e8', accentColor: '#d4a017',
      officeName: 'NAK HQ', officeLayout: 'modern',
      plan: 'business', ownerId: 'user-1',
      createdAt: T, storageUsed: 4_831_838_208, storageLimit: 107_374_182_400,
    };
    b1.set(doc(db, 'companies', COMPANY_ID), company);

    // ═══════════════════════════════════════════════════════════
    // 2. USERS  (all NAK Digital team members)
    // ═══════════════════════════════════════════════════════════
    const users: User[] = [
      {
        id:'user-1', email:'rahim@nakdigital.com', name:'Rahim Al-Farsi',
        designation:'CEO & Founder',
        bio:'Visionary leader building the future of digital work at NAK Digital. 10+ years in tech.',
        skills:['Leadership','Strategy','Product Vision','Business Development','AI'],
        timezone:'Asia/Dubai', status:'available', role:'company_owner',
        departmentId:'dept-mgmt', companyId:COMPANY_ID, currentProjectId:'proj-1',
        joinedAt:past(365*24*3600*1000), lastActiveAt:T,
        location:'Dubai, UAE', phone:'+971 50 123 4567',
        isOnline:true, position:{x:320, y:180},
      },
      {
        id:'user-2', email:'alex@nakdigital.com', name:'Alex Chen',
        designation:'Senior Full-Stack Developer',
        bio:'Passionate about clean code and scalable architectures. React & Node.js specialist.',
        skills:['React','Next.js','Node.js','TypeScript','PostgreSQL','AWS','Docker'],
        timezone:'Asia/Dubai', status:'available', role:'department_head',
        departmentId:'dept-dev', companyId:COMPANY_ID, currentProjectId:'proj-1',
        joinedAt:past(300*24*3600*1000), lastActiveAt:T,
        location:'Dubai, UAE', phone:'+971 50 234 5678',
        isOnline:true, position:{x:420, y:200},
      },
      {
        id:'user-3', email:'sara@nakdigital.com', name:'Sara Malik',
        designation:'Lead UI/UX Designer',
        bio:'Crafting beautiful interfaces that users love. 7 years of digital design experience.',
        skills:['Figma','User Research','Prototyping','Design Systems','Tailwind CSS','Framer'],
        timezone:'Asia/Dubai', status:'away', role:'department_head',
        departmentId:'dept-design', companyId:COMPANY_ID, currentProjectId:'proj-2',
        joinedAt:past(280*24*3600*1000), lastActiveAt:past(15*60*1000),
        location:'Dubai, UAE', phone:'+971 55 345 6789',
        isOnline:true, position:{x:720, y:200},
      },
      {
        id:'user-4', email:'james@nakdigital.com', name:'James Wright',
        designation:'Head of Marketing',
        bio:'Data-driven marketing strategist. Built campaigns reaching 2M+ people.',
        skills:['SEO','Content Strategy','Google Ads','Social Media','Analytics','Brand'],
        timezone:'Asia/Dubai', status:'busy', role:'department_head',
        departmentId:'dept-mktg', companyId:COMPANY_ID, currentProjectId:'proj-3',
        joinedAt:past(250*24*3600*1000), lastActiveAt:past(5*60*1000),
        location:'London, UK', phone:'+44 79 456 7890',
        isOnline:true, position:{x:920, y:360},
      },
      {
        id:'user-5', email:'nadia@nakdigital.com', name:'Nadia Hassan',
        designation:'Senior Sales Executive',
        bio:'Connecting enterprise clients with the right digital solutions. $2M+ in closed deals.',
        skills:['CRM','Negotiation','Lead Generation','Presentations','Salesforce','B2B'],
        timezone:'Asia/Dubai', status:'available', role:'employee',
        departmentId:'dept-sales', companyId:COMPANY_ID, currentProjectId:'proj-3',
        joinedAt:past(220*24*3600*1000), lastActiveAt:T,
        location:'Dubai, UAE', phone:'+971 56 567 8901',
        isOnline:true, position:{x:1020, y:400},
      },
      {
        id:'user-6', email:'priya@nakdigital.com', name:'Priya Sharma',
        designation:'HR Manager',
        bio:'Building a culture where every NAK Digital employee thrives and grows.',
        skills:['Recruitment','Employee Relations','L&D','HRIS','Culture Building','Onboarding'],
        timezone:'Asia/Dubai', status:'available', role:'department_head',
        departmentId:'dept-hr', companyId:COMPANY_ID,
        joinedAt:past(200*24*3600*1000), lastActiveAt:T,
        location:'Dubai, UAE', phone:'+971 52 678 9012',
        isOnline:false, position:{x:180, y:400},
      },
      {
        id:'user-7', email:'omar@nakdigital.com', name:'Omar Abdullah',
        designation:'Backend Developer',
        bio:'Building robust APIs and microservices. Firebase & Node.js expert.',
        skills:['Node.js','Firebase','Python','Docker','Redis','MongoDB','REST APIs'],
        timezone:'Asia/Dubai', status:'offline', role:'employee',
        departmentId:'dept-dev', companyId:COMPANY_ID, currentProjectId:'proj-1',
        joinedAt:past(180*24*3600*1000), lastActiveAt:past(2*3600*1000),
        location:'Dubai, UAE', phone:'+971 50 789 0123',
        isOnline:false, position:{x:500, y:220},
      },
      {
        id:'user-8', email:'lisa@nakdigital.com', name:'Lisa Park',
        designation:'Product Designer',
        bio:'Bridging design and development. Expert in motion design and design systems.',
        skills:['Figma','Motion Design','React','CSS Animation','Storybook','Accessibility'],
        timezone:'Asia/Seoul', status:'available', role:'employee',
        departmentId:'dept-design', companyId:COMPANY_ID, currentProjectId:'proj-2',
        joinedAt:past(160*24*3600*1000), lastActiveAt:T,
        location:'Seoul, South Korea', phone:'+82 10 890 1234',
        isOnline:true, position:{x:820, y:220},
      },
      {
        id:'user-9', email:'mohammed@nakdigital.com', name:'Mohammed Al-Rashid',
        designation:'Digital Marketing Specialist',
        bio:'Performance marketing expert specialising in UAE & GCC markets.',
        skills:['Google Ads','Meta Ads','TikTok Ads','SEO','Arabic Content','Analytics'],
        timezone:'Asia/Dubai', status:'available', role:'employee',
        departmentId:'dept-mktg', companyId:COMPANY_ID, currentProjectId:'proj-3',
        joinedAt:past(140*24*3600*1000), lastActiveAt:T,
        location:'Abu Dhabi, UAE', phone:'+971 54 901 2345',
        isOnline:true, position:{x:860, y:90},
      },
      {
        id:'user-10', email:'fatima@nakdigital.com', name:'Fatima Al-Zaabi',
        designation:'Sales Development Representative',
        bio:'First point of contact for NAK Digital enterprise prospects across MENA.',
        skills:['Lead Qualification','Cold Outreach','HubSpot','Arabic','English','French'],
        timezone:'Asia/Dubai', status:'available', role:'employee',
        departmentId:'dept-sales', companyId:COMPANY_ID,
        joinedAt:past(120*24*3600*1000), lastActiveAt:T,
        location:'Dubai, UAE', phone:'+971 55 012 3456',
        isOnline:true, position:{x:1060, y:380},
      },
    ];
    users.forEach(u => b1.set(doc(db, 'users', u.id), u));

    // ═══════════════════════════════════════════════════════════
    // 3. DEPARTMENTS
    // ═══════════════════════════════════════════════════════════
    const departments: Department[] = [
      {
        id:'dept-mgmt', companyId:COMPANY_ID, name:'Management',
        description:'Executive leadership, strategy and company direction.',
        icon:'🏢', color:'#d4a017', headId:'user-1', memberCount:1, createdAt:T,
      },
      {
        id:'dept-dev', companyId:COMPANY_ID, name:'Development',
        description:'Full-stack engineering, platform architecture and technical innovation.',
        icon:'⚙️', color:'#1a73e8', headId:'user-2', memberCount:3, createdAt:T,
      },
      {
        id:'dept-design', companyId:COMPANY_ID, name:'Design',
        description:'UI/UX design, brand identity, product aesthetics and design systems.',
        icon:'🎨', color:'#8b5cf6', headId:'user-3', memberCount:2, createdAt:T,
      },
      {
        id:'dept-mktg', companyId:COMPANY_ID, name:'Marketing',
        description:'Digital campaigns, content strategy, SEO and growth initiatives.',
        icon:'📣', color:'#ec4899', headId:'user-4', memberCount:2, createdAt:T,
      },
      {
        id:'dept-sales', companyId:COMPANY_ID, name:'Sales',
        description:'Client acquisition, account management and revenue growth.',
        icon:'💼', color:'#f59e0b', headId:'user-5', memberCount:2, createdAt:T,
      },
      {
        id:'dept-hr', companyId:COMPANY_ID, name:'Human Resources',
        description:'Talent, culture, people operations and employee success.',
        icon:'👥', color:'#22c55e', headId:'user-6', memberCount:1, createdAt:T,
      },
    ];
    departments.forEach(d => b1.set(doc(db, 'departments', d.id), d));

    // ═══════════════════════════════════════════════════════════
    // 4. PROJECTS
    // ═══════════════════════════════════════════════════════════
    const projects: Project[] = [
      {
        id:'proj-1', companyId:COMPANY_ID, departmentId:'dept-dev',
        name:'NAK Office Platform v2',
        description:'Next-generation internal virtual office with AI features, real-time collaboration and Firebase backend.',
        client:'Internal', managerId:'user-2',
        memberIds:['user-1','user-2','user-3','user-7','user-8'],
        startDate:past(60*24*3600*1000), deadline:future(90*24*3600*1000),
        status:'in_progress', priority:'high', progress:68,
        createdAt:past(60*24*3600*1000), color:'#1a73e8', tags:['platform','firebase','ai','internal'],
      },
      {
        id:'proj-2', companyId:COMPANY_ID, departmentId:'dept-design',
        name:'NAK Digital Brand Refresh 2025',
        description:'Complete visual overhaul — new logo, colour system, typography and brand guidelines for all NAK Digital touchpoints.',
        client:'Internal', managerId:'user-3',
        memberIds:['user-3','user-8','user-1'],
        startDate:past(40*24*3600*1000), deadline:future(50*24*3600*1000),
        status:'in_progress', priority:'medium', progress:45,
        createdAt:past(40*24*3600*1000), color:'#8b5cf6', tags:['branding','design','2025'],
      },
      {
        id:'proj-3', companyId:COMPANY_ID, departmentId:'dept-mktg',
        name:'Dubai Expo 2025 Campaign',
        description:'Full 360° marketing campaign for NAK Digital\'s Dubai Expo 2025 presence — digital, print and experiential.',
        client:'External', managerId:'user-4',
        memberIds:['user-4','user-5','user-9','user-10'],
        startDate:past(30*24*3600*1000), deadline:future(20*24*3600*1000),
        status:'review', priority:'urgent', progress:88,
        createdAt:past(30*24*3600*1000), color:'#f59e0b', tags:['marketing','dubai','expo','campaign'],
      },
      {
        id:'proj-4', companyId:COMPANY_ID, departmentId:'dept-dev',
        name:'Client CRM Integration',
        description:'Custom CRM dashboard integrating Salesforce data with NAK internal tools for the sales team.',
        client:'Internal', managerId:'user-2',
        memberIds:['user-2','user-7','user-5'],
        startDate:past(10*24*3600*1000), deadline:future(60*24*3600*1000),
        status:'planning', priority:'high', progress:12,
        createdAt:past(10*24*3600*1000), color:'#10b981', tags:['crm','integration','sales'],
      },
      {
        id:'proj-5', companyId:COMPANY_ID, departmentId:'dept-mktg',
        name:'NAK Digital Website Redesign',
        description:'Full redesign of nakdigital.com — new pages, improved performance, SEO optimisation and Arabic localisation.',
        client:'Internal', managerId:'user-4',
        memberIds:['user-3','user-4','user-8','user-9'],
        startDate:past(5*24*3600*1000), deadline:future(45*24*3600*1000),
        status:'planning', priority:'medium', progress:8,
        createdAt:past(5*24*3600*1000), color:'#06b6d4', tags:['website','seo','arabic'],
      },
    ];
    projects.forEach(p => b2.set(doc(db, 'projects', p.id), p));

    // ═══════════════════════════════════════════════════════════
    // 5. TASKS
    // ═══════════════════════════════════════════════════════════
    const tasks: Task[] = [
      // proj-1 tasks
      {
        id:'task-1', companyId:COMPANY_ID, projectId:'proj-1',
        title:'Implement Firebase real-time listeners for all collections',
        description:'Wire up onSnapshot listeners for users, departments, projects, tasks, meetings, channels, files, announcements, calendar and virtual rooms.',
        assigneeId:'user-2', reporterId:'user-1',
        status:'done', priority:'urgent',
        createdAt:past(14*24*3600*1000), updatedAt:past(2*24*3600*1000), order:1,
        tags:['firebase','backend'],
        checklist:[
          {id:'cl-1',text:'Users listener',completed:true},
          {id:'cl-2',text:'Projects listener',completed:true},
          {id:'cl-3',text:'Tasks listener',completed:true},
          {id:'cl-4',text:'Messages listener',completed:true},
          {id:'cl-5',text:'Notifications listener',completed:true},
        ],
      },
      {
        id:'task-2', companyId:COMPANY_ID, projectId:'proj-1',
        title:'Build virtual office 2D renderer with WASD movement',
        description:'Canvas-based 2D office with department rooms, employee avatars, real-time position updates and proximity chat.',
        assigneeId:'user-2', reporterId:'user-1',
        status:'in_progress', priority:'high',
        dueDate:future(7*24*3600*1000),
        createdAt:past(10*24*3600*1000), updatedAt:past(1*24*3600*1000), order:2,
        tags:['frontend','canvas','realtime'],
        checklist:[
          {id:'cl-6',text:'Room layout rendering',completed:true},
          {id:'cl-7',text:'Avatar system',completed:true},
          {id:'cl-8',text:'WASD movement',completed:true},
          {id:'cl-9',text:'Proximity detection',completed:false},
          {id:'cl-10',text:'Position sync to Firebase',completed:false},
        ],
      },
      {
        id:'task-3', companyId:COMPANY_ID, projectId:'proj-1',
        title:'Integrate NAK AI Office Assistant',
        description:'Context-aware AI assistant with access to meetings, tasks, projects and team data. Respect user permissions.',
        assigneeId:'user-7', reporterId:'user-2',
        status:'review', priority:'high',
        dueDate:future(5*24*3600*1000),
        createdAt:past(8*24*3600*1000), updatedAt:past(12*3600*1000), order:3,
        tags:['ai','backend'],
      },
      {
        id:'task-4', companyId:COMPANY_ID, projectId:'proj-1',
        title:'Kanban board drag-and-drop with Firebase persistence',
        description:'Full drag-and-drop Kanban board where task status changes sync instantly to Firestore.',
        assigneeId:'user-2', reporterId:'user-1',
        status:'todo', priority:'medium',
        dueDate:future(12*24*3600*1000),
        createdAt:past(6*24*3600*1000), updatedAt:past(6*24*3600*1000), order:4,
        tags:['frontend','kanban'],
      },
      {
        id:'task-5', companyId:COMPANY_ID, projectId:'proj-1',
        title:'File upload to Firebase Storage',
        description:'Wire file manager to Firebase Storage with upload progress, preview and permission controls.',
        assigneeId:'user-7', reporterId:'user-2',
        status:'todo', priority:'medium',
        dueDate:future(18*24*3600*1000),
        createdAt:past(4*24*3600*1000), updatedAt:past(4*24*3600*1000), order:5,
        tags:['storage','files'],
      },
      // proj-2 tasks
      {
        id:'task-6', companyId:COMPANY_ID, projectId:'proj-2',
        title:'Create 3 logo concepts for stakeholder review',
        description:'Develop three distinct logo directions for NAK Digital 2025 rebrand. Present with brand rationale.',
        assigneeId:'user-8', reporterId:'user-3',
        status:'done', priority:'high',
        createdAt:past(20*24*3600*1000), updatedAt:past(5*24*3600*1000), order:1,
        tags:['logo','brand'],
      },
      {
        id:'task-7', companyId:COMPANY_ID, projectId:'proj-2',
        title:'Design 2025 colour palette and typography system',
        description:'Define primary navy + gold palette with full accessibility ratios and typography scale.',
        assigneeId:'user-3', reporterId:'user-3',
        status:'in_progress', priority:'medium',
        dueDate:future(8*24*3600*1000),
        createdAt:past(15*24*3600*1000), updatedAt:past(1*24*3600*1000), order:2,
        tags:['colours','typography'],
      },
      {
        id:'task-8', companyId:COMPANY_ID, projectId:'proj-2',
        title:'Build full brand guidelines document',
        description:'Comprehensive brand guidelines PDF — usage rules, do\'s and don\'ts, examples across print and digital.',
        assigneeId:'user-3', reporterId:'user-1',
        status:'todo', priority:'medium',
        dueDate:future(20*24*3600*1000),
        createdAt:past(10*24*3600*1000), updatedAt:past(10*24*3600*1000), order:3,
        tags:['guidelines','brand'],
      },
      // proj-3 tasks
      {
        id:'task-9', companyId:COMPANY_ID, projectId:'proj-3',
        title:'Launch Dubai Expo campaign landing page',
        description:'Build and go-live with the campaign microsite. Full Arabic + English support.',
        assigneeId:'user-4', reporterId:'user-4',
        status:'done', priority:'urgent',
        createdAt:past(25*24*3600*1000), updatedAt:past(3*24*3600*1000), order:1,
        tags:['campaign','landing','arabic'],
      },
      {
        id:'task-10', companyId:COMPANY_ID, projectId:'proj-3',
        title:'Run Google Ads & Meta campaign',
        description:'Set up and optimise paid media campaigns for UAE audience targeting Expo attendees.',
        assigneeId:'user-9', reporterId:'user-4',
        status:'in_progress', priority:'urgent',
        dueDate:future(3*24*3600*1000),
        createdAt:past(20*24*3600*1000), updatedAt:past(6*3600*1000), order:2,
        tags:['ads','paid-media'],
      },
      {
        id:'task-11', companyId:COMPANY_ID, projectId:'proj-3',
        title:'Final stakeholder deck for campaign results',
        description:'Prepare executive presentation showing campaign performance, ROI and next steps.',
        assigneeId:'user-4', reporterId:'user-1',
        status:'review', priority:'high',
        dueDate:future(4*24*3600*1000),
        createdAt:past(8*24*3600*1000), updatedAt:past(1*24*3600*1000), order:3,
        tags:['presentation','reporting'],
      },
      // proj-4 tasks
      {
        id:'task-12', companyId:COMPANY_ID, projectId:'proj-4',
        title:'Salesforce API integration scoping',
        description:'Document all Salesforce endpoints needed and map to NAK internal data model.',
        assigneeId:'user-7', reporterId:'user-2',
        status:'in_progress', priority:'high',
        dueDate:future(10*24*3600*1000),
        createdAt:past(8*24*3600*1000), updatedAt:past(2*24*3600*1000), order:1,
        tags:['salesforce','api'],
      },
    ];
    tasks.forEach(t => b2.set(doc(db, 'tasks', t.id), t));

    // ═══════════════════════════════════════════════════════════
    // 6. MEETINGS
    // ═══════════════════════════════════════════════════════════
    const meetings: Meeting[] = [
      {
        id:'meet-1', companyId:COMPANY_ID,
        title:'NAK Weekly All-Hands',
        description:'Company-wide weekly standup. All departments report progress, blockers and wins.',
        hostId:'user-1',
        participantIds:['user-1','user-2','user-3','user-4','user-5','user-6','user-7','user-8','user-9','user-10'],
        startTime:future(1*3600*1000), endTime:future(2*3600*1000),
        status:'scheduled', roomUrl:'/meeting/nak-digital/all-hands', createdAt:T,
      },
      {
        id:'meet-2', companyId:COMPANY_ID,
        title:'Platform v2 Sprint Review',
        description:'Development team sprint review — demo new features and plan next sprint.',
        hostId:'user-2',
        participantIds:['user-1','user-2','user-3','user-7','user-8'],
        startTime:future(26*3600*1000), endTime:future(28*3600*1000),
        status:'scheduled', roomUrl:'/meeting/nak-digital/sprint-review',
        projectId:'proj-1', createdAt:T,
      },
      {
        id:'meet-3', companyId:COMPANY_ID,
        title:'Dubai Expo Campaign Final Sign-off',
        description:'Final review of all campaign assets before launch. Stakeholder approval needed.',
        hostId:'user-4',
        participantIds:['user-1','user-4','user-5','user-9'],
        startTime:future(50*3600*1000), endTime:future(51.5*3600*1000),
        status:'scheduled', roomUrl:'/meeting/nak-digital/expo-signoff',
        projectId:'proj-3', createdAt:T,
      },
      {
        id:'meet-4', companyId:COMPANY_ID,
        title:'Brand Refresh Design Review',
        description:'Review logo concepts and colour palette proposals from the design team.',
        hostId:'user-3',
        participantIds:['user-1','user-3','user-8'],
        startTime:future(3*24*3600*1000), endTime:future(3*24*3600*1000 + 5400000),
        status:'scheduled', roomUrl:'/meeting/nak-digital/brand-review',
        projectId:'proj-2', createdAt:T,
      },
      {
        id:'meet-5', companyId:COMPANY_ID,
        title:'HR Monthly People Check-in',
        description:'Monthly one-on-ones and team health assessment with HR.',
        hostId:'user-6',
        participantIds:['user-1','user-6'],
        startTime:future(4*24*3600*1000), endTime:future(4*24*3600*1000 + 3600000),
        status:'scheduled', roomUrl:'/meeting/nak-digital/hr-checkin', createdAt:T,
      },
    ];
    meetings.forEach(m => b3.set(doc(db, 'meetings', m.id), m));

    // ═══════════════════════════════════════════════════════════
    // 7. CHANNELS
    // ═══════════════════════════════════════════════════════════
    const channels: Channel[] = [
      {
        id:'chan-1', companyId:COMPANY_ID, name:'general',
        description:'Company-wide announcements, wins and conversations for the whole NAK team.',
        type:'company',
        memberIds:['user-1','user-2','user-3','user-4','user-5','user-6','user-7','user-8','user-9','user-10'],
        icon:'🏢', color:'#1a73e8', createdAt:T, unreadCount:3,
      },
      {
        id:'chan-2', companyId:COMPANY_ID, name:'development',
        description:'Tech discussions, code reviews, architecture decisions and dev updates.',
        type:'department', memberIds:['user-1','user-2','user-7'],
        departmentId:'dept-dev', icon:'⚙️', color:'#1a73e8', createdAt:T, unreadCount:5,
      },
      {
        id:'chan-3', companyId:COMPANY_ID, name:'design',
        description:'Design feedback, Figma links, assets and creative discussions.',
        type:'department', memberIds:['user-3','user-8'],
        departmentId:'dept-design', icon:'🎨', color:'#8b5cf6', createdAt:T, unreadCount:1,
      },
      {
        id:'chan-4', companyId:COMPANY_ID, name:'marketing',
        description:'Campaigns, content calendar, analytics and marketing strategy.',
        type:'department', memberIds:['user-4','user-9'],
        departmentId:'dept-mktg', icon:'📣', color:'#ec4899', createdAt:T, unreadCount:0,
      },
      {
        id:'chan-5', companyId:COMPANY_ID, name:'sales',
        description:'Leads, pipeline updates, deals and client communications.',
        type:'department', memberIds:['user-5','user-10'],
        departmentId:'dept-sales', icon:'💼', color:'#f59e0b', createdAt:T, unreadCount:2,
      },
      {
        id:'chan-6', companyId:COMPANY_ID, name:'platform-v2',
        description:'Project chat for NAK Office Platform v2 team.',
        type:'group', memberIds:['user-1','user-2','user-3','user-7','user-8'],
        icon:'🚀', color:'#06b6d4', createdAt:T, unreadCount:8,
      },
      {
        id:'chan-7', companyId:COMPANY_ID, name:'expo-campaign',
        description:'Dubai Expo 2025 campaign coordination.',
        type:'group', memberIds:['user-4','user-5','user-9','user-10','user-1'],
        icon:'🏆', color:'#f59e0b', createdAt:T, unreadCount:4,
      },
      {
        id:'chan-dm-1', companyId:COMPANY_ID, name:'Rahim Al-Farsi',
        type:'direct', memberIds:['user-1','user-2'],
        createdAt:T, unreadCount:1,
      },
      {
        id:'chan-dm-2', companyId:COMPANY_ID, name:'Sara Malik',
        type:'direct', memberIds:['user-1','user-3'],
        createdAt:T, unreadCount:0,
      },
    ];
    channels.forEach(c => b3.set(doc(db, 'channels', c.id), c));

    // ═══════════════════════════════════════════════════════════
    // 8. MESSAGES  (real conversations per channel)
    // ═══════════════════════════════════════════════════════════
    const messages: Message[] = [
      // #general
      {id:'msg-1', channelId:'chan-1', senderId:'user-1', type:'text', createdAt:past(3*3600*1000),
        content:'Good morning team! 🌟 Big day today — Platform v2 sprint review at 2 PM and Expo campaign sign-off at 4 PM. Let\'s go!',
        reactions:{'🔥':['user-2','user-3','user-4'],'💪':['user-5','user-6']}},
      {id:'msg-2', channelId:'chan-1', senderId:'user-2', type:'text', createdAt:past(2.8*3600*1000),
        content:'Morning Rahim! Sprint demo is ready. We\'ve shipped the Firebase real-time listeners, the Kanban board and the virtual office rooms. Really happy with how it\'s coming together.',
        reactions:{'👏':['user-1','user-3','user-8']}, replyTo:'msg-1'},
      {id:'msg-3', channelId:'chan-1', senderId:'user-3', type:'text', createdAt:past(2.5*3600*1000),
        content:'Just pushed the new brand colour palette to Figma — the navy + gold combo looks 🔥 Can everyone please check the #design channel for feedback?',
        reactions:{'🎨':['user-1','user-8']}},
      {id:'msg-4', channelId:'chan-1', senderId:'user-4', type:'text', createdAt:past(1.5*3600*1000),
        content:'Campaign landing page is live! Arabic + English versions both passing QA. Sharing the URL now with the team for final review before tomorrow\'s sign-off meeting.'},
      {id:'msg-5', channelId:'chan-1', senderId:'user-6', type:'text', createdAt:past(1*3600*1000),
        content:'Reminder: Q4 performance reviews are due by end of Friday. Managers please submit your team assessments through the HR portal. Ping me if you need the form template!',
        reactions:{'✅':['user-2','user-3','user-4','user-5']}},

      // #development
      {id:'msg-6', channelId:'chan-2', senderId:'user-7', type:'text', createdAt:past(4*3600*1000),
        content:'Firebase permissions issue is fixed. The security rules now correctly scope all reads/writes by companyId. Running the seed endpoint now...'},
      {id:'msg-7', channelId:'chan-2', senderId:'user-2', type:'text', createdAt:past(3.5*3600*1000),
        content:'Nice work Omar! I\'ve been working on the virtual office canvas — WASD movement is smooth. Working on proximity detection now for the "nearby colleague" bubble feature.',
        replyTo:'msg-6'},
      {id:'msg-8', channelId:'chan-2', senderId:'user-7', type:'text', createdAt:past(3*3600*1000),
        content:'Seed completed successfully ✅ All 10 collections populated. Dashboard, People, Projects, Tasks, Calendar, Files, Announcements — all showing real data now.',
        reactions:{'🎉':['user-2','user-1']}},
      {id:'msg-9', channelId:'chan-2', senderId:'user-2', type:'text', createdAt:past(1*3600*1000),
        content:'@Omar — can you look at the file upload task (task-5)? Need Firebase Storage wired up this sprint.'},

      // #design
      {id:'msg-10', channelId:'chan-3', senderId:'user-3', type:'text', createdAt:past(5*3600*1000),
        content:'Hey Lisa! I\'ve uploaded the 3 logo concepts to Figma. Link: figma.com/nakdigital-rebrand-2025 — please add your notes directly on the frames.'},
      {id:'msg-11', channelId:'chan-3', senderId:'user-8', type:'text', createdAt:past(4*3600*1000),
        content:'Reviewed! I love concept 2 — the geometric N with the gold accent feels very premium. Concept 3 is too complex for small sizes. Leaving detailed notes on Figma now.',
        reactions:{'💯':['user-3']}, replyTo:'msg-10'},
      {id:'msg-12', channelId:'chan-3', senderId:'user-3', type:'text', createdAt:past(2*3600*1000),
        content:'Perfect. Taking concept 2 forward as the primary direction. Will have the refined version ready for the brand review meeting on Thursday.'},

      // #platform-v2
      {id:'msg-13', channelId:'chan-6', senderId:'user-2', type:'text', createdAt:past(2*3600*1000),
        content:'Sprint update: Canvas renderer 90% done ✅, Firebase listeners all working ✅, Kanban with drag-drop done ✅, AI assistant wired up ✅. Remaining: proximity detection + file storage.'},
      {id:'msg-14', channelId:'chan-6', senderId:'user-3', type:'text', createdAt:past(1.5*3600*1000),
        content:'On the design side: virtual office rooms are visually updated with NAK navy + gold colours. The sidebar rebrand is live too. Looking much more polished!',
        reactions:{'😍':['user-2','user-1','user-8']}},
      {id:'msg-15', channelId:'chan-6', senderId:'user-1', type:'text', createdAt:past(1*3600*1000),
        content:'Great progress everyone! Make sure the seed API creates real, meaningful data for ALL sidebar sections before the demo tomorrow. The platform needs to feel alive.',
        reactions:{'💪':['user-2','user-3','user-7','user-8']}},

      // DM
      {id:'msg-16', channelId:'chan-dm-1', senderId:'user-2', type:'text', createdAt:past(45*60*1000),
        content:'Hey Rahim, I pushed the Firebase seed v2. All 10 collections are now seeded with real NAK data. Dashboard, People, Files, Calendar, Announcements — all showing data now.'},
      {id:'msg-17', channelId:'chan-dm-1', senderId:'user-1', type:'text', createdAt:past(30*60*1000),
        content:'Brilliant! Just tested it. The platform is looking exactly like a real office now. Great work to you and Omar 🙌', reactions:{'🙌':['user-2']}},
    ];
    messages.forEach(m => b3.set(doc(db, 'messages', m.id), m));

    // ═══════════════════════════════════════════════════════════
    // 9. FILES
    // ═══════════════════════════════════════════════════════════
    const files: FileItem[] = [
      // Root folders
      {id:'folder-1', companyId:COMPANY_ID, name:'Company Documents', type:'folder', uploadedBy:'user-1', createdAt:T, updatedAt:T},
      {id:'folder-2', companyId:COMPANY_ID, name:'Development', type:'folder', departmentId:'dept-dev', uploadedBy:'user-2', createdAt:T, updatedAt:T},
      {id:'folder-3', companyId:COMPANY_ID, name:'Design Assets', type:'folder', departmentId:'dept-design', uploadedBy:'user-3', createdAt:T, updatedAt:T},
      {id:'folder-4', companyId:COMPANY_ID, name:'Marketing', type:'folder', departmentId:'dept-mktg', uploadedBy:'user-4', createdAt:T, updatedAt:T},
      {id:'folder-5', companyId:COMPANY_ID, name:'Sales', type:'folder', departmentId:'dept-sales', uploadedBy:'user-5', createdAt:T, updatedAt:T},
      {id:'folder-6', companyId:COMPANY_ID, name:'HR Documents', type:'folder', departmentId:'dept-hr', uploadedBy:'user-6', createdAt:T, updatedAt:T},
      // Files in Company Documents
      {id:'file-1', companyId:COMPANY_ID, name:'NAK Digital Company Overview 2025.pdf', type:'file', mimeType:'application/pdf', size:3_145_728, parentId:'folder-1', uploadedBy:'user-1', createdAt:past(30*24*3600*1000), updatedAt:past(30*24*3600*1000), permissions:'view'},
      {id:'file-2', companyId:COMPANY_ID, name:'Employee Handbook v3.pdf', type:'file', mimeType:'application/pdf', size:2_097_152, parentId:'folder-1', uploadedBy:'user-6', createdAt:past(60*24*3600*1000), updatedAt:past(15*24*3600*1000), permissions:'view'},
      {id:'file-3', companyId:COMPANY_ID, name:'NAK Digital OKRs Q4 2025.xlsx', type:'file', mimeType:'application/vnd.ms-excel', size:524_288, parentId:'folder-1', uploadedBy:'user-1', createdAt:past(7*24*3600*1000), updatedAt:past(2*24*3600*1000), permissions:'view'},
      // Files in Development
      {id:'file-4', companyId:COMPANY_ID, name:'Platform v2 Architecture Diagram.pdf', type:'file', mimeType:'application/pdf', size:1_572_864, parentId:'folder-2', departmentId:'dept-dev', uploadedBy:'user-2', createdAt:past(20*24*3600*1000), updatedAt:past(5*24*3600*1000)},
      {id:'file-5', companyId:COMPANY_ID, name:'Firebase Security Rules v2.md', type:'file', mimeType:'text/markdown', size:8_192, parentId:'folder-2', departmentId:'dept-dev', uploadedBy:'user-7', createdAt:past(3*24*3600*1000), updatedAt:past(1*24*3600*1000)},
      // Files in Design
      {id:'file-6', companyId:COMPANY_ID, name:'NAK Digital Rebrand — Logo Concepts.fig', type:'file', mimeType:'application/figma', size:18_874_368, parentId:'folder-3', departmentId:'dept-design', uploadedBy:'user-3', createdAt:past(10*24*3600*1000), updatedAt:past(2*24*3600*1000)},
      {id:'file-7', companyId:COMPANY_ID, name:'Brand Colour Palette 2025.pdf', type:'file', mimeType:'application/pdf', size:786_432, parentId:'folder-3', departmentId:'dept-design', uploadedBy:'user-8', createdAt:past(5*24*3600*1000), updatedAt:past(1*24*3600*1000)},
      // Files in Marketing
      {id:'file-8', companyId:COMPANY_ID, name:'Dubai Expo Campaign Brief.docx', type:'file', mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size:655_360, parentId:'folder-4', departmentId:'dept-mktg', uploadedBy:'user-4', createdAt:past(25*24*3600*1000), updatedAt:past(5*24*3600*1000)},
      {id:'file-9', companyId:COMPANY_ID, name:'Expo Campaign Performance Report.xlsx', type:'file', mimeType:'application/vnd.ms-excel', size:1_048_576, parentId:'folder-4', departmentId:'dept-mktg', uploadedBy:'user-9', createdAt:past(3*24*3600*1000), updatedAt:past(1*24*3600*1000)},
      // Files in Sales
      {id:'file-10', companyId:COMPANY_ID, name:'Q3 Sales Report 2025.xlsx', type:'file', mimeType:'application/vnd.ms-excel', size:921_600, parentId:'folder-5', departmentId:'dept-sales', uploadedBy:'user-5', createdAt:past(15*24*3600*1000), updatedAt:past(7*24*3600*1000)},
      {id:'file-11', companyId:COMPANY_ID, name:'Enterprise Proposal Template.pptx', type:'file', mimeType:'application/vnd.ms-powerpoint', size:4_194_304, parentId:'folder-5', departmentId:'dept-sales', uploadedBy:'user-5', createdAt:past(40*24*3600*1000), updatedAt:past(10*24*3600*1000)},
      // Files in HR
      {id:'file-12', companyId:COMPANY_ID, name:'Onboarding Checklist 2025.pdf', type:'file', mimeType:'application/pdf', size:393_216, parentId:'folder-6', departmentId:'dept-hr', uploadedBy:'user-6', createdAt:past(90*24*3600*1000), updatedAt:past(14*24*3600*1000)},
    ];
    files.forEach(f => b4.set(doc(db, 'files', f.id), f));

    // ═══════════════════════════════════════════════════════════
    // 10. ANNOUNCEMENTS
    // ═══════════════════════════════════════════════════════════
    const announcements: Announcement[] = [
      {
        id:'ann-1', companyId:COMPANY_ID,
        title:'🎉 NAK Digital Office Platform is LIVE!',
        content:'After weeks of development, our internal virtual office platform is officially live. You can now manage projects, chat with teammates, attend meetings, track tasks and walk through our virtual NAK HQ — all in one place. Big thanks to the Development and Design teams for making this happen!',
        priority:'high', authorId:'user-1',
        publishDate:past(1*3600*1000), createdAt:past(1*3600*1000), readBy:['user-2','user-3'],
      },
      {
        id:'ann-2', companyId:COMPANY_ID,
        title:'📅 Weekly All-Hands — Today at ' + new Date(Date.now() + 3600000).toLocaleTimeString('en-AE', {hour:'2-digit', minute:'2-digit', timeZone:'Asia/Dubai'}),
        content:'This week we cover: Platform v2 sprint review demo, Dubai Expo campaign final sign-off, Brand refresh update from Sara, Q4 performance review process from HR. All 10 team members expected. Link in the Calendar.',
        priority:'normal', authorId:'user-6',
        publishDate:past(3*3600*1000), expiryDate:future(24*3600*1000),
        createdAt:past(3*3600*1000), readBy:['user-1','user-2','user-4'],
      },
      {
        id:'ann-3', companyId:COMPANY_ID,
        title:'🔒 Action Required: Enable 2FA on All Accounts by Friday',
        content:'As part of NAK Digital\'s security upgrade, all team members must enable two-factor authentication on their Google Workspace and platform accounts by this Friday 5 PM. IT will revoke access for accounts without 2FA after the deadline. Setup guide is in the HR Documents folder.',
        priority:'urgent', authorId:'user-1',
        publishDate:past(2*24*3600*1000), createdAt:past(2*24*3600*1000),
        expiryDate:future(5*24*3600*1000), readBy:['user-2','user-3','user-4','user-5'],
      },
      {
        id:'ann-4', companyId:COMPANY_ID,
        title:'🏆 NAK Digital Wins Best Digital Agency — Dubai 2025',
        content:'We are thrilled to announce that NAK Digital has been awarded Best Digital Agency at the Dubai Business Awards 2025! This recognition is a testament to the incredible work every single person on this team puts in every day. Celebration lunch this Thursday — details to follow!',
        priority:'high', authorId:'user-1',
        publishDate:past(5*24*3600*1000), createdAt:past(5*24*3600*1000),
        readBy:['user-2','user-3','user-4','user-5','user-6','user-7','user-8'],
      },
      {
        id:'ann-5', companyId:COMPANY_ID,
        title:'📋 Q4 Performance Reviews — Process & Timeline',
        content:'Q4 performance reviews will run 1–15 October. All managers: submit peer assessments by Oct 5. Employees: complete self-assessments by Oct 3. One-on-one review meetings will be scheduled by HR. Review all goals in the NAK OKR doc before your session.',
        priority:'normal', authorId:'user-6',
        publishDate:past(7*24*3600*1000), expiryDate:future(14*24*3600*1000),
        createdAt:past(7*24*3600*1000), readBy:['user-1','user-2'],
      },
    ];
    announcements.forEach(a => b4.set(doc(db, 'announcements', a.id), a));

    // ═══════════════════════════════════════════════════════════
    // 11. NOTIFICATIONS (for user-1 / Rahim)
    // ═══════════════════════════════════════════════════════════
    const notifications: Notification[] = [
      {id:'notif-1', userId:'user-1', companyId:COMPANY_ID, type:'message', title:'New message from Alex Chen', body:'I pushed the Firebase seed v2. All 10 collections are now seeded with real NAK data.', link:'/messages', read:false, actorId:'user-2', createdAt:past(45*60*1000)},
      {id:'notif-2', userId:'user-1', companyId:COMPANY_ID, type:'meeting', title:'Meeting in 1 hour: NAK Weekly All-Hands', body:'All-Hands meeting starts in 1 hour. 10 participants invited.', link:'/calendar', read:false, createdAt:past(30*60*1000)},
      {id:'notif-3', userId:'user-1', companyId:COMPANY_ID, type:'task', title:'Task review requested', body:'Omar Abdullah requested your review on: Integrate NAK AI Office Assistant', link:'/tasks', read:false, actorId:'user-7', createdAt:past(1*3600*1000)},
      {id:'notif-4', userId:'user-1', companyId:COMPANY_ID, type:'project', title:'Dubai Expo Campaign — 88% complete', body:'The Dubai Expo Campaign project is nearing completion. Final sign-off meeting scheduled.', link:'/projects', read:false, createdAt:past(2*3600*1000)},
      {id:'notif-5', userId:'user-1', companyId:COMPANY_ID, type:'announcement', title:'New announcement posted', body:'Priya Sharma posted: Q4 Performance Reviews — Process & Timeline', link:'/announcements', read:true, actorId:'user-6', createdAt:past(7*24*3600*1000)},
      {id:'notif-6', userId:'user-1', companyId:COMPANY_ID, type:'mention', title:'Sara Malik mentioned you', body:'Sara mentioned @Rahim in #design: "the Figma file is ready for your review"', link:'/messages', read:true, actorId:'user-3', createdAt:past(3*3600*1000)},
    ];
    notifications.forEach(n => b4.set(doc(db, 'notifications', n.id), n));

    // ═══════════════════════════════════════════════════════════
    // 12. CALENDAR EVENTS
    // ═══════════════════════════════════════════════════════════
    const calendarEvents: CalendarEvent[] = [
      {id:'evt-1', companyId:COMPANY_ID, title:'NAK Weekly All-Hands', startDate:future(1*3600*1000), endDate:future(2*3600*1000), type:'meeting', color:'#1a73e8', creatorId:'user-1', meetingId:'meet-1', participantIds:['user-1','user-2','user-3','user-4','user-5','user-6']},
      {id:'evt-2', companyId:COMPANY_ID, title:'Platform v2 Sprint Review', startDate:future(26*3600*1000), endDate:future(28*3600*1000), type:'meeting', color:'#1a73e8', creatorId:'user-2', meetingId:'meet-2', projectId:'proj-1'},
      {id:'evt-3', companyId:COMPANY_ID, title:'Dubai Expo Campaign Sign-off', startDate:future(50*3600*1000), endDate:future(51.5*3600*1000), type:'meeting', color:'#f59e0b', creatorId:'user-4', meetingId:'meet-3', projectId:'proj-3'},
      {id:'evt-4', companyId:COMPANY_ID, title:'Brand Refresh Design Review', startDate:future(3*24*3600*1000), endDate:future(3*24*3600*1000 + 5400000), type:'meeting', color:'#8b5cf6', creatorId:'user-3', meetingId:'meet-4', projectId:'proj-2'},
      {id:'evt-5', companyId:COMPANY_ID, title:'Dubai Expo Campaign Launch', startDate:future(5*24*3600*1000), endDate:future(5*24*3600*1000), allDay:true, type:'deadline', color:'#ef4444', creatorId:'user-4', projectId:'proj-3'},
      {id:'evt-6', companyId:COMPANY_ID, title:'NAK Digital Awards Celebration Lunch', startDate:future(4*24*3600*1000), endDate:future(4*24*3600*1000 + 7200000), type:'event', color:'#d4a017', creatorId:'user-1'},
      {id:'evt-7', companyId:COMPANY_ID, title:'Q4 Performance Reviews Start', startDate:future(13*24*3600*1000), endDate:future(13*24*3600*1000), allDay:true, type:'event', color:'#22c55e', creatorId:'user-6'},
      {id:'evt-8', companyId:COMPANY_ID, title:'Brand Guidelines Deadline', startDate:future(20*24*3600*1000), endDate:future(20*24*3600*1000), allDay:true, type:'deadline', color:'#8b5cf6', creatorId:'user-3', projectId:'proj-2'},
      {id:'evt-9', companyId:COMPANY_ID, title:'CRM Integration Sprint Start', startDate:future(7*24*3600*1000), endDate:future(7*24*3600*1000), allDay:true, type:'event', color:'#10b981', creatorId:'user-2', projectId:'proj-4'},
    ];
    calendarEvents.forEach(e => b5.set(doc(db, 'calendarEvents', e.id), e));

    // ═══════════════════════════════════════════════════════════
    // 13. VIRTUAL ROOMS
    // ═══════════════════════════════════════════════════════════
    const virtualRooms: VirtualRoom[] = [
      {id:'room-1', companyId:COMPANY_ID, name:'Reception',       type:'reception',   icon:'🏢', color:'#d4a017', position:{x:40,  y:40,  width:190, height:130}, capacity:10},
      {id:'room-2', companyId:COMPANY_ID, name:'Development',     type:'development', icon:'⚙️', color:'#1a73e8', position:{x:255, y:40,  width:255, height:195}, capacity:15},
      {id:'room-3', companyId:COMPANY_ID, name:'Design Studio',   type:'design',      icon:'🎨', color:'#8b5cf6', position:{x:535, y:40,  width:215, height:195}, capacity:8 },
      {id:'room-4', companyId:COMPANY_ID, name:'Marketing',       type:'marketing',   icon:'📣', color:'#ec4899', position:{x:775, y:40,  width:195, height:155}, capacity:8 },
      {id:'room-5', companyId:COMPANY_ID, name:'Sales',           type:'sales',       icon:'💼', color:'#f59e0b', position:{x:775, y:220, width:195, height:155}, capacity:8 },
      {id:'room-6', companyId:COMPANY_ID, name:'HR',              type:'hr',          icon:'👥', color:'#22c55e', position:{x:40,  y:230, width:175, height:155}, capacity:5 },
      {id:'room-7', companyId:COMPANY_ID, name:'Meeting Room A',  type:'meeting',     icon:'🎯', color:'#06b6d4', position:{x:255, y:265, width:195, height:135}, capacity:12},
      {id:'room-8', companyId:COMPANY_ID, name:'Conference Room', type:'conference',  icon:'🖥️', color:'#6366f1', position:{x:475, y:265, width:230, height:135}, capacity:20},
      {id:'room-9', companyId:COMPANY_ID, name:'Lounge & Café',   type:'lounge',      icon:'☕', color:'#84cc16', position:{x:255, y:430, width:450, height:115}, capacity:20},
    ];
    virtualRooms.forEach(r => b5.set(doc(db, 'virtualRooms', r.id), r));

    // ═══════════════════════════════════════════════════════════
    // 14. ACTIVITY LOG
    // ═══════════════════════════════════════════════════════════
    const activityLog: ActivityLog[] = [
      {id:'act-1', companyId:COMPANY_ID, userId:'user-2', action:'completed', entityType:'task', entityId:'task-1', entityName:'Implement Firebase real-time listeners', createdAt:past(2*24*3600*1000)},
      {id:'act-2', companyId:COMPANY_ID, userId:'user-3', action:'uploaded',  entityType:'file', entityId:'file-6',  entityName:'NAK Digital Rebrand — Logo Concepts.fig', createdAt:past(10*24*3600*1000)},
      {id:'act-3', companyId:COMPANY_ID, userId:'user-4', action:'launched',  entityType:'project', entityId:'proj-3', entityName:'Dubai Expo 2025 Campaign', createdAt:past(3*24*3600*1000)},
      {id:'act-4', companyId:COMPANY_ID, userId:'user-7', action:'completed', entityType:'task', entityId:'task-3', entityName:'Integrate NAK AI Office Assistant', createdAt:past(12*3600*1000)},
      {id:'act-5', companyId:COMPANY_ID, userId:'user-2', action:'created',   entityType:'project', entityId:'proj-4', entityName:'Client CRM Integration', createdAt:past(10*24*3600*1000)},
      {id:'act-6', companyId:COMPANY_ID, userId:'user-9', action:'updated',   entityType:'task', entityId:'task-10', entityName:'Run Google Ads & Meta campaign', createdAt:past(6*3600*1000)},
      {id:'act-7', companyId:COMPANY_ID, userId:'user-8', action:'reviewed',  entityType:'file', entityId:'file-6', entityName:'Logo Concepts Figma file', createdAt:past(4*3600*1000)},
      {id:'act-8', companyId:COMPANY_ID, userId:'user-1', action:'published', entityType:'announcement', entityId:'ann-4', entityName:'NAK Digital Wins Best Digital Agency', createdAt:past(5*24*3600*1000)},
    ];
    activityLog.forEach(l => b5.set(doc(db, 'activityLog', l.id), l));

    // ── Commit all batches ────────────────────────────────────
    await Promise.all([
      b1.commit(), b2.commit(), b3.commit(), b4.commit(), b5.commit(),
    ]);

    return NextResponse.json({
      ok: true,
      message: force
        ? 'Force re-seeded successfully! All collections refreshed.'
        : 'Database seeded successfully!',
      counts: {
        company: 1,
        users: users.length,
        departments: departments.length,
        projects: projects.length,
        tasks: tasks.length,
        meetings: meetings.length,
        channels: channels.length,
        messages: messages.length,
        files: files.length,
        announcements: announcements.length,
        notifications: notifications.length,
        calendarEvents: calendarEvents.length,
        virtualRooms: virtualRooms.length,
        activityLog: activityLog.length,
        total: users.length + departments.length + projects.length + tasks.length +
               meetings.length + channels.length + messages.length + files.length +
               announcements.length + notifications.length + calendarEvents.length +
               virtualRooms.length + activityLog.length + 1,
      },
    });
  } catch (err) {
    console.error('Seed error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: 'POST /api/seed to seed. POST /api/seed?force=true to re-seed (deletes existing data first).',
    collections: ['companies','users','departments','projects','tasks','meetings','channels','messages','files','announcements','notifications','calendarEvents','virtualRooms','activityLog'],
  });
}
