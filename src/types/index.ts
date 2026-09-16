// ============================================================
// VIRTOFFICE - Core Type Definitions
// ============================================================

export type UserStatus = 'available' | 'away' | 'busy' | 'offline';
export type UserRole = 'super_admin' | 'company_owner' | 'company_admin' | 'department_head' | 'project_manager' | 'employee';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed';
export type MeetingStatus = 'scheduled' | 'ongoing' | 'ended';
export type SubscriptionPlan = 'free' | 'starter' | 'business' | 'enterprise';
export type NotificationType = 'task' | 'meeting' | 'message' | 'mention' | 'file' | 'announcement' | 'project';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

// -----------------------------------------------
// User & Auth
// -----------------------------------------------
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  designation?: string;
  bio?: string;
  skills?: string[];
  timezone?: string;
  status: UserStatus;
  role: UserRole;
  departmentId?: string;
  companyId: string;
  currentProjectId?: string;
  joinedAt: string;
  lastActiveAt: string;
  location?: string;
  phone?: string;
  isOnline: boolean;
  position?: { x: number; y: number }; // virtual office position
}

// -----------------------------------------------
// Company
// -----------------------------------------------
export interface Company {
  id: string;
  name: string;
  slug: string;
  email: string;
  logo?: string;
  industry: string;
  size: string;
  country: string;
  timezone: string;
  brandColor: string;
  accentColor: string;
  officeName?: string;
  officeLayout?: string;
  officeBackground?: string;
  plan: SubscriptionPlan;
  ownerId: string;
  createdAt: string;
  storageUsed: number; // bytes
  storageLimit: number; // bytes
}

// -----------------------------------------------
// Department
// -----------------------------------------------
export interface Department {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  headId?: string;
  memberCount: number;
  createdAt: string;
}

// -----------------------------------------------
// Project
// -----------------------------------------------
export interface Project {
  id: string;
  companyId: string;
  departmentId?: string;
  name: string;
  description?: string;
  client?: string;
  managerId: string;
  memberIds: string[];
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  priority: TaskPriority;
  progress: number; // 0-100
  createdAt: string;
  color?: string;
  tags?: string[];
}

// -----------------------------------------------
// Task
// -----------------------------------------------
export interface Task {
  id: string;
  companyId: string;
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  reporterId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  checklist?: ChecklistItem[];
  attachments?: Attachment[];
  comments?: Comment[];
  order: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// -----------------------------------------------
// Meeting
// -----------------------------------------------
export interface Meeting {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  hostId: string;
  participantIds: string[];
  startTime: string;
  endTime: string;
  status: MeetingStatus;
  roomUrl?: string;
  projectId?: string;
  departmentId?: string;
  createdAt: string;
}

// -----------------------------------------------
// Message & Channel
// -----------------------------------------------
export interface Channel {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  type: 'company' | 'department' | 'group' | 'direct';
  memberIds: string[];
  departmentId?: string;
  createdAt: string;
  lastMessage?: Message;
  unreadCount?: number;
  icon?: string;
  color?: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: Attachment[];
  replyTo?: string;
  reactions?: Record<string, string[]>;
  edited?: boolean;
  editedAt?: string;
  createdAt: string;
  readBy?: string[];
}

// -----------------------------------------------
// File & Folder
// -----------------------------------------------
export interface FileItem {
  id: string;
  companyId: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  url?: string;
  parentId?: string;
  departmentId?: string;
  projectId?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  sharedWith?: string[];
  permissions?: 'view' | 'edit' | 'full';
}

// -----------------------------------------------
// Announcement
// -----------------------------------------------
export interface Announcement {
  id: string;
  companyId: string;
  title: string;
  content: string;
  image?: string;
  priority: AnnouncementPriority;
  authorId: string;
  publishDate: string;
  expiryDate?: string;
  departmentIds?: string[]; // empty = company-wide
  readBy?: string[];
  createdAt: string;
}

// -----------------------------------------------
// Notification
// -----------------------------------------------
export interface Notification {
  id: string;
  userId: string;
  companyId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
  actorId?: string;
}

// -----------------------------------------------
// Calendar Event
// -----------------------------------------------
export interface CalendarEvent {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  type: 'meeting' | 'deadline' | 'event' | 'holiday';
  color?: string;
  creatorId: string;
  participantIds?: string[];
  meetingId?: string;
  projectId?: string;
}

// -----------------------------------------------
// Virtual Office
// -----------------------------------------------
export interface VirtualRoom {
  id: string;
  companyId: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  position: { x: number; y: number; width: number; height: number };
  occupants?: string[]; // user IDs currently in the room
  capacity?: number;
  isPrivate?: boolean;
}

// -----------------------------------------------
// Activity Log
// -----------------------------------------------
export interface ActivityLog {
  id: string;
  companyId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// -----------------------------------------------
// Billing & Subscription
// -----------------------------------------------
export interface Subscription {
  id: string;
  companyId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// -----------------------------------------------
// AI Assistant
// -----------------------------------------------
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
