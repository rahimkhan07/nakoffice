'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User, Company, Department, Project, Task, Meeting,
  Channel, Message, Notification, Announcement, CalendarEvent,
  VirtualRoom, ActivityLog, FileItem,
} from '@/types';
import {
  demoUsers, demoCompany, demoDepartments, demoProjects,
  demoTasks, demoMeetings, demoChannels, demoMessages,
  demoNotifications, demoAnnouncements, demoCalendarEvents,
  demoVirtualRooms, demoActivityLog, demoFiles,
} from '@/data/demo';

interface AppState {
  // ─── Auth ─────────────────────────────────────
  currentUser: User | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  login: (userId: string) => void;
  logout: () => void;

  // ─── Company ──────────────────────────────────
  company: Company;
  setCompany: (company: Company) => void;

  // ─── Users ────────────────────────────────────
  users: User[];
  updateUserStatus: (userId: string, status: User['status']) => void;
  updateUserPosition: (userId: string, position: { x: number; y: number }) => void;

  // ─── Departments ──────────────────────────────
  departments: Department[];
  addDepartment: (dept: Department) => void;

  // ─── Projects ─────────────────────────────────
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // ─── Tasks ────────────────────────────────────
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: Task['status']) => void;

  // ─── Meetings ─────────────────────────────────
  meetings: Meeting[];
  addMeeting: (meeting: Meeting) => void;

  // ─── Chat ─────────────────────────────────────
  channels: Channel[];
  messages: Message[];
  activeChannelId: string;
  setActiveChannel: (channelId: string) => void;
  sendMessage: (message: Message) => void;
  addReaction: (messageId: string, emoji: string, userId: string) => void;
  markChannelRead: (channelId: string) => void;

  // ─── Files ────────────────────────────────────
  files: FileItem[];
  addFile: (file: FileItem) => void;

  // ─── Notifications ────────────────────────────
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Notification) => void;
  unreadNotificationCount: () => number;

  // ─── Announcements ────────────────────────────
  announcements: Announcement[];

  // ─── Calendar ─────────────────────────────────
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: CalendarEvent) => void;

  // ─── Virtual Office ───────────────────────────
  virtualRooms: VirtualRoom[];
  activityLog: ActivityLog[];

  // ─── UI State ─────────────────────────────────
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  notifPanelOpen: boolean;
  setNotifPanelOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ─── Auth ─────────────────────────────────────
      currentUser: demoUsers[0],
      isAuthenticated: true,
      setCurrentUser: (user) => set({ currentUser: user }),
      login: (userId) => {
        const user = get().users.find(u => u.id === userId) ?? null;
        set({ currentUser: user, isAuthenticated: !!user });
      },
      logout: () => set({ currentUser: null, isAuthenticated: false }),

      // ─── Company ──────────────────────────────────
      company: demoCompany,
      setCompany: (company) => set({ company }),

      // ─── Users ────────────────────────────────────
      users: demoUsers,
      updateUserStatus: (userId, status) =>
        set(s => ({
          users: s.users.map(u => u.id === userId ? { ...u, status } : u),
          currentUser: s.currentUser?.id === userId
            ? { ...s.currentUser, status } : s.currentUser,
        })),
      updateUserPosition: (userId, position) =>
        set(s => ({
          users: s.users.map(u => u.id === userId ? { ...u, position } : u),
        })),

      // ─── Departments ──────────────────────────────
      departments: demoDepartments,
      addDepartment: (dept) => set(s => ({ departments: [...s.departments, dept] })),

      // ─── Projects ─────────────────────────────────
      projects: demoProjects,
      addProject: (project) => set(s => ({ projects: [project, ...s.projects] })),
      updateProject: (id, updates) =>
        set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...updates } : p) })),
      deleteProject: (id) => set(s => ({ projects: s.projects.filter(p => p.id !== id) })),

      // ─── Tasks ────────────────────────────────────
      tasks: demoTasks,
      addTask: (task) => set(s => ({ tasks: [task, ...s.tasks] })),
      updateTask: (id, updates) =>
        set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) })),
      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      moveTask: (taskId, newStatus) =>
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
          ),
        })),

      // ─── Meetings ─────────────────────────────────
      meetings: demoMeetings,
      addMeeting: (meeting) => set(s => ({ meetings: [meeting, ...s.meetings] })),

      // ─── Chat ─────────────────────────────────────
      channels: demoChannels,
      messages: demoMessages,
      activeChannelId: 'chan-1',
      setActiveChannel: (channelId) => set({ activeChannelId: channelId }),
      sendMessage: (message) =>
        set(s => ({
          messages: [...s.messages, message],
          channels: s.channels.map(c =>
            c.id === message.channelId ? { ...c, lastMessage: message } : c
          ),
        })),
      addReaction: (messageId, emoji, userId) =>
        set(s => ({
          messages: s.messages.map(m => {
            if (m.id !== messageId) return m;
            const reactions = { ...m.reactions };
            if (!reactions[emoji]) reactions[emoji] = [];
            const idx = reactions[emoji].indexOf(userId);
            if (idx > -1) reactions[emoji].splice(idx, 1);
            else reactions[emoji].push(userId);
            return { ...m, reactions };
          }),
        })),
      markChannelRead: (channelId) =>
        set(s => ({
          channels: s.channels.map(c =>
            c.id === channelId ? { ...c, unreadCount: 0 } : c
          ),
        })),

      // ─── Files ────────────────────────────────────
      files: demoFiles,
      addFile: (file) => set(s => ({ files: [file, ...s.files] })),

      // ─── Notifications ────────────────────────────
      notifications: demoNotifications,
      markNotificationRead: (id) =>
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        })),
      markAllNotificationsRead: () =>
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
      addNotification: (notif) =>
        set(s => ({ notifications: [notif, ...s.notifications] })),
      unreadNotificationCount: () =>
        get().notifications.filter(n => !n.read).length,

      // ─── Announcements ────────────────────────────
      announcements: demoAnnouncements,

      // ─── Calendar ─────────────────────────────────
      calendarEvents: demoCalendarEvents,
      addCalendarEvent: (event) =>
        set(s => ({ calendarEvents: [...s.calendarEvents, event] })),

      // ─── Virtual Office ───────────────────────────
      virtualRooms: demoVirtualRooms,
      activityLog: demoActivityLog,

      // ─── UI ───────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      aiOpen: false,
      setAiOpen: (open) => set({ aiOpen: open }),
      notifPanelOpen: false,
      setNotifPanelOpen: (open) => set({ notifPanelOpen: open }),
    }),
    {
      name: 'virtoffice-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        company: state.company,
      }),
    }
  )
);
