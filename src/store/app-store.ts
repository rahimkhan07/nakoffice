'use client';
// ─────────────────────────────────────────────────────────────
// VirtOffice – Zustand store
// All state is backed by Firestore with real-time listeners.
// No demo/dummy data imported here.
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User, Company, Department, Project, Task, Meeting,
  Channel, Message, Notification, Announcement, CalendarEvent,
  VirtualRoom, ActivityLog, FileItem,
} from '@/types';
import * as FS from '@/lib/firestore';

// Default empty company (never shown — replaced by Firestore data)
const emptyCompany: Company = {
  id:          'company-1',
  name:        '',
  slug:        '',
  email:       '',
  industry:    '',
  size:        '',
  country:     '',
  timezone:    'UTC',
  brandColor:  '#3b82f6',
  accentColor: '#8b5cf6',
  plan:        'free',
  ownerId:     '',
  createdAt:   '',
  storageUsed: 0,
  storageLimit: 10_737_418_240,
};

interface AppState {
  // ── Data loading ─────────────────────────────
  loading:          boolean;
  initialized:      boolean;
  setLoading:       (v: boolean) => void;
  setInitialized:   (v: boolean) => void;

  // ── Auth ─────────────────────────────────────
  currentUser:      User | null;
  isAuthenticated:  boolean;
  setCurrentUser:   (user: User | null) => void;
  logout:           () => void;

  // ── Company ──────────────────────────────────
  company:          Company;
  setCompany:       (c: Company) => void;
  updateCompany:    (updates: Partial<Company>) => void;

  // ── Users ────────────────────────────────────
  users:            User[];
  setUsers:         (users: User[]) => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
  updateUserPosition: (userId: string, pos: { x: number; y: number }) => void;
  updateCurrentUser:  (updates: Partial<User>) => void;

  // ── Departments ──────────────────────────────
  departments:      Department[];
  setDepartments:   (d: Department[]) => void;
  addDepartment:    (dept: Department) => void;
  deleteDepartment: (id: string) => void;

  // ── Projects ─────────────────────────────────
  projects:         Project[];
  setProjects:      (p: Project[]) => void;
  addProject:       (project: Project) => void;
  updateProject:    (id: string, updates: Partial<Project>) => void;
  deleteProject:    (id: string) => void;

  // ── Tasks ────────────────────────────────────
  tasks:            Task[];
  setTasks:         (t: Task[]) => void;
  addTask:          (task: Task) => void;
  updateTask:       (id: string, updates: Partial<Task>) => void;
  deleteTask:       (id: string) => void;
  moveTask:         (taskId: string, newStatus: Task['status']) => void;

  // ── Meetings ─────────────────────────────────
  meetings:         Meeting[];
  setMeetings:      (m: Meeting[]) => void;
  addMeeting:       (meeting: Meeting) => void;
  deleteMeeting:    (id: string) => void;

  // ── Chat ─────────────────────────────────────
  channels:         Channel[];
  setChannels:      (c: Channel[]) => void;
  messages:         Message[];
  setMessages:      (msgs: Message[]) => void;
  activeChannelId:  string;
  setActiveChannel: (id: string) => void;
  sendMessage:      (msg: Message) => void;
  addReaction:      (msgId: string, emoji: string, userId: string) => void;
  markChannelRead:  (channelId: string) => void;
  addChannel:       (channel: Channel) => void;

  // ── Files ────────────────────────────────────
  files:            FileItem[];
  setFiles:         (f: FileItem[]) => void;
  addFile:          (file: FileItem) => void;
  deleteFile:       (id: string) => void;
  renameFile:       (id: string, name: string) => void;

  // ── Notifications ────────────────────────────
  notifications:    Notification[];
  setNotifications: (n: Notification[]) => void;
  markNotificationRead:    (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification:  (n: Notification) => void;
  unreadNotificationCount: () => number;

  // ── Announcements ────────────────────────────
  announcements:    Announcement[];
  setAnnouncements: (a: Announcement[]) => void;
  addAnnouncement:  (ann: Announcement) => void;
  deleteAnnouncement: (id: string) => void;

  // ── Calendar ─────────────────────────────────
  calendarEvents:   CalendarEvent[];
  setCalendarEvents: (e: CalendarEvent[]) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  deleteCalendarEvent: (id: string) => void;

  // ── Virtual Office ───────────────────────────
  virtualRooms:     VirtualRoom[];
  setVirtualRooms:  (r: VirtualRoom[]) => void;
  activityLog:      ActivityLog[];
  setActivityLog:   (l: ActivityLog[]) => void;
  addActivityLog:   (log: ActivityLog) => void;

  // ── UI ───────────────────────────────────────
  sidebarOpen:      boolean;
  toggleSidebar:    () => void;
  searchOpen:       boolean;
  setSearchOpen:    (v: boolean) => void;
  aiOpen:           boolean;
  setAiOpen:        (v: boolean) => void;
  notifPanelOpen:   boolean;
  setNotifPanelOpen:(v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Data loading ─────────────────────────
      loading:        true,
      initialized:    false,
      setLoading:     (v) => set({ loading: v }),
      setInitialized: (v) => set({ initialized: v }),

      // ── Auth ─────────────────────────────────
      currentUser:     null,
      isAuthenticated: false,
      setCurrentUser:  (user) => set({ currentUser: user, isAuthenticated: !!user }),
      logout:          () => set({ currentUser: null, isAuthenticated: false }),

      // ── Company ──────────────────────────────
      company:      emptyCompany,
      setCompany:   (c) => set({ company: c }),
      updateCompany: (updates) => {
        set(s => ({ company: { ...s.company, ...updates } }));
        FS.updateCompany(get().company.id, updates).catch(console.error);
      },

      // ── Users ────────────────────────────────
      users:    [],
      setUsers: (users) => set({ users }),
      updateUserStatus: (userId, status) => {
        set(s => ({
          users:       s.users.map(u => u.id === userId ? { ...u, status } : u),
          currentUser: s.currentUser?.id === userId ? { ...s.currentUser, status } : s.currentUser,
        }));
        FS.updateUser(userId, { status }).catch(console.error);
      },
      updateUserPosition: (userId, position) => {
        set(s => ({ users: s.users.map(u => u.id === userId ? { ...u, position } : u) }));
        FS.updateUser(userId, { position }).catch(console.error);
      },
      updateCurrentUser: (updates) => {
        set(s => {
          if (!s.currentUser) return s;
          const updated = { ...s.currentUser, ...updates };
          return {
            currentUser: updated,
            users: s.users.map(u => u.id === updated.id ? updated : u),
          };
        });
        const uid = get().currentUser?.id;
        if (uid) FS.updateUser(uid, updates).catch(console.error);
      },

      // ── Departments ──────────────────────────
      departments:      [],
      setDepartments:   (d) => set({ departments: d }),
      addDepartment:    (dept) => {
        set(s => ({ departments: [...s.departments, dept] }));
        FS.addDepartment(dept).catch(console.error);
      },
      deleteDepartment: (id) => {
        set(s => ({ departments: s.departments.filter(d => d.id !== id) }));
        FS.deleteDepartment(id).catch(console.error);
      },

      // ── Projects ─────────────────────────────
      projects:      [],
      setProjects:   (p) => set({ projects: p }),
      addProject:    (project) => {
        set(s => ({ projects: [project, ...s.projects] }));
        FS.addProject(project).catch(console.error);
      },
      updateProject: (id, updates) => {
        set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...updates } : p) }));
        FS.updateProject(id, updates).catch(console.error);
      },
      deleteProject: (id) => {
        set(s => ({ projects: s.projects.filter(p => p.id !== id) }));
        FS.deleteProject(id).catch(console.error);
      },

      // ── Tasks ────────────────────────────────
      tasks:      [],
      setTasks:   (t) => set({ tasks: t }),
      addTask:    (task) => {
        set(s => ({ tasks: [task, ...s.tasks] }));
        FS.addTask(task).catch(console.error);
      },
      updateTask: (id, updates) => {
        set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) }));
        FS.updateTask(id, updates).catch(console.error);
      },
      deleteTask: (id) => {
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
        FS.deleteTask(id).catch(console.error);
      },
      moveTask: (taskId, newStatus) => {
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === taskId
              ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
        FS.updateTask(taskId, { status: newStatus }).catch(console.error);
      },

      // ── Meetings ─────────────────────────────
      meetings:      [],
      setMeetings:   (m) => set({ meetings: m }),
      addMeeting:    (meeting) => {
        set(s => ({ meetings: [meeting, ...s.meetings] }));
        FS.addMeeting(meeting).catch(console.error);
      },
      deleteMeeting: (id) => {
        set(s => ({ meetings: s.meetings.filter(m => m.id !== id) }));
        FS.deleteMeeting(id).catch(console.error);
      },

      // ── Chat ─────────────────────────────────
      channels:         [],
      setChannels:      (c) => set({ channels: c }),
      messages:         [],
      setMessages:      (msgs) => set({ messages: msgs }),
      activeChannelId:  '',
      setActiveChannel: (id) => set({ activeChannelId: id }),
      sendMessage: (msg) => {
        set(s => ({
          messages: [...s.messages, msg],
          channels: s.channels.map(c =>
            c.id === msg.channelId ? { ...c, lastMessage: msg } : c
          ),
        }));
        FS.sendMessage(msg).catch(console.error);
      },
      addReaction: (msgId, emoji, userId) => {
        set(s => ({
          messages: s.messages.map(m => {
            if (m.id !== msgId) return m;
            const reactions  = { ...(m.reactions ?? {}) };
            const existing   = reactions[emoji] ?? [];
            reactions[emoji] = existing.includes(userId)
              ? existing.filter(id => id !== userId)
              : [...existing, userId];
            FS.updateMessageReactions(msgId, reactions).catch(console.error);
            return { ...m, reactions };
          }),
        }));
      },
      markChannelRead: (channelId) =>
        set(s => ({
          channels: s.channels.map(c =>
            c.id === channelId ? { ...c, unreadCount: 0 } : c
          ),
        })),
      addChannel: (channel) => {
        set(s => ({ channels: [channel, ...s.channels] }));
        FS.addChannel(channel).catch(console.error);
      },

      // ── Files ────────────────────────────────
      files:      [],
      setFiles:   (f) => set({ files: f }),
      addFile:    (file) => {
        set(s => ({ files: [file, ...s.files] }));
        FS.addFile(file).catch(console.error);
      },
      deleteFile: (id) => {
        set(s => ({ files: s.files.filter(f => f.id !== id) }));
        FS.deleteFile(id).catch(console.error);
      },
      renameFile: (id, name) => {
        set(s => ({ files: s.files.map(f => f.id === id ? { ...f, name } : f) }));
        FS.renameFile(id, name).catch(console.error);
      },

      // ── Notifications ────────────────────────
      notifications:    [],
      setNotifications: (n) => set({ notifications: n }),
      markNotificationRead: (id) => {
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        }));
        FS.markNotificationRead(id).catch(console.error);
      },
      markAllNotificationsRead: () => {
        const uid = get().currentUser?.id;
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }));
        if (uid) FS.markAllNotificationsRead(uid).catch(console.error);
      },
      addNotification: (notif) => {
        set(s => ({ notifications: [notif, ...s.notifications] }));
        FS.addNotification(notif).catch(console.error);
      },
      unreadNotificationCount: () =>
        get().notifications.filter(n => !n.read).length,

      // ── Announcements ────────────────────────
      announcements:    [],
      setAnnouncements: (a) => set({ announcements: a }),
      addAnnouncement: (ann) => {
        set(s => ({ announcements: [ann, ...s.announcements] }));
        FS.addAnnouncement(ann).catch(console.error);
      },
      deleteAnnouncement: (id) => {
        set(s => ({ announcements: s.announcements.filter(a => a.id !== id) }));
        FS.deleteAnnouncement(id).catch(console.error);
      },

      // ── Calendar ─────────────────────────────
      calendarEvents:   [],
      setCalendarEvents:(e) => set({ calendarEvents: e }),
      addCalendarEvent: (event) => {
        set(s => ({ calendarEvents: [...s.calendarEvents, event] }));
        FS.addCalendarEvent(event).catch(console.error);
      },
      deleteCalendarEvent: (id) => {
        set(s => ({ calendarEvents: s.calendarEvents.filter(e => e.id !== id) }));
        FS.deleteCalendarEvent(id).catch(console.error);
      },

      // ── Virtual Office ───────────────────────
      virtualRooms:    [],
      setVirtualRooms: (r) => set({ virtualRooms: r }),
      activityLog:     [],
      setActivityLog:  (l) => set({ activityLog: l }),
      addActivityLog:  (log) => {
        set(s => ({ activityLog: [log, ...s.activityLog] }));
        FS.addActivityLog(log).catch(console.error);
      },

      // ── UI ───────────────────────────────────
      sidebarOpen:       true,
      toggleSidebar:     () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      searchOpen:        false,
      setSearchOpen:     (v) => set({ searchOpen: v }),
      aiOpen:            false,
      setAiOpen:         (v) => set({ aiOpen: v }),
      notifPanelOpen:    false,
      setNotifPanelOpen: (v) => set({ notifPanelOpen: v }),
    }),
    {
      name:    'nakoffice-store-v3',
      version: 3,
      // Only persist auth + company + UI state between refreshes.
      // Everything else (projects, tasks, messages, etc.) comes from Firestore.
      partialize: (state) => ({
        currentUser:     state.currentUser,
        isAuthenticated: state.isAuthenticated,
        company:         state.company,
        sidebarOpen:     state.sidebarOpen,
        activeChannelId: state.activeChannelId,
      }),
    }
  )
);
