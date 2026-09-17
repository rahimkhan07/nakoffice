// ─────────────────────────────────────────────────────────────
// Firestore service layer
//
// IMPORTANT: All real-time listeners (onSnapshot) use ONLY
// simple `where` filters — no `orderBy`. This avoids the need
// for composite indexes. Sorting is done in-memory after fetch.
// ─────────────────────────────────────────────────────────────
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc,
  deleteDoc, query, where, orderBy, limit, onSnapshot,
  writeBatch, type DocumentData, type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User, Company, Department, Project, Task, Meeting,
  Channel, Message, FileItem, Announcement, Notification,
  CalendarEvent, VirtualRoom, ActivityLog,
} from '@/types';

// ── Collection names ──────────────────────────────────────────
export const COLLECTIONS = {
  COMPANIES:     'companies',
  USERS:         'users',
  DEPARTMENTS:   'departments',
  PROJECTS:      'projects',
  TASKS:         'tasks',
  MEETINGS:      'meetings',
  CHANNELS:      'channels',
  MESSAGES:      'messages',
  FILES:         'files',
  ANNOUNCEMENTS: 'announcements',
  NOTIFICATIONS: 'notifications',
  CALENDAR:      'calendarEvents',
  ROOMS:         'virtualRooms',
  ACTIVITY:      'activityLog',
} as const;

// ── Helpers ───────────────────────────────────────────────────
function fromDoc<T>(snap: DocumentData): T {
  return { id: snap.id, ...snap.data() } as T;
}

function clean<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

// Sort helpers (in-memory — no index required)
const byCreatedDesc = <T extends { createdAt: string }>(a: T, b: T) =>
  b.createdAt.localeCompare(a.createdAt);
const byCreatedAsc = <T extends { createdAt: string }>(a: T, b: T) =>
  a.createdAt.localeCompare(b.createdAt);

// ─────────────────────────────────────────────────────────────
// Company
// ─────────────────────────────────────────────────────────────
export async function getCompany(id: string): Promise<Company | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.COMPANIES, id));
  return snap.exists() ? fromDoc<Company>(snap) : null;
}
export async function setCompany(company: Company): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.COMPANIES, company.id), clean(company));
}
export async function updateCompany(id: string, updates: Partial<Company>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.COMPANIES, id), clean(updates));
}
export function listenCompany(id: string, cb: (c: Company) => void): Unsubscribe {
  return onSnapshot(doc(db, COLLECTIONS.COMPANIES, id), snap => {
    if (snap.exists()) cb(fromDoc<Company>(snap));
  });
}

// ─────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────
export async function getUserById(id: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, id));
  return snap.exists() ? fromDoc<User>(snap) : null;
}
export async function setUser(user: User): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.USERS, user.id), clean(user));
}
export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, id), clean(updates));
}
// ✅ Simple where — no composite index needed
export function listenUsers(companyId: string, cb: (u: User[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    const users = snap.docs.map(d => fromDoc<User>(d));
    cb(users);
  });
}

// ─────────────────────────────────────────────────────────────
// Departments
// ─────────────────────────────────────────────────────────────
export async function addDepartment(dept: Department): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.DEPARTMENTS, dept.id), clean(dept));
}
export async function deleteDepartment(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.DEPARTMENTS, id));
}
// ✅ Simple where — no composite index needed
export function listenDepartments(companyId: string, cb: (d: Department[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.DEPARTMENTS),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    const depts = snap.docs.map(d => fromDoc<Department>(d));
    cb(depts.sort((a, b) => a.name.localeCompare(b.name)));
  });
}

// ─────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────
export async function addProject(project: Project): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.PROJECTS, project.id), clean(project));
}
export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.PROJECTS, id), clean(updates));
}
export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.PROJECTS, id));
}
// ✅ Simple where — sort in-memory
export function listenProjects(companyId: string, cb: (p: Project[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.PROJECTS),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    const projects = snap.docs.map(d => fromDoc<Project>(d));
    cb(projects.sort(byCreatedDesc));
  });
}

// ─────────────────────────────────────────────────────────────
// Tasks  ← THE KEY ONE (was failing with index error)
// ─────────────────────────────────────────────────────────────
export async function addTask(task: Task): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.TASKS, task.id), clean(task));
}
export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.TASKS, id), {
    ...clean(updates),
    updatedAt: new Date().toISOString(),
  });
}
export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.TASKS, id));
}
// ✅ Simple where only — no orderBy — no composite index needed
export function listenTasks(companyId: string, cb: (t: Task[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.TASKS),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    const tasks = snap.docs.map(d => fromDoc<Task>(d));
    // Sort in-memory: by order field, then by createdAt
    cb(tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  });
}

// ─────────────────────────────────────────────────────────────
// Meetings
// ─────────────────────────────────────────────────────────────
export async function addMeeting(meeting: Meeting): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.MEETINGS, meeting.id), clean(meeting));
}
export async function deleteMeeting(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.MEETINGS, id));
}
// ✅ Simple where — sort by startTime in-memory
export function listenMeetings(companyId: string, cb: (m: Meeting[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.MEETINGS),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    const meetings = snap.docs.map(d => fromDoc<Meeting>(d));
    cb(meetings.sort((a, b) => a.startTime.localeCompare(b.startTime)));
  });
}

// ─────────────────────────────────────────────────────────────
// Channels
// ─────────────────────────────────────────────────────────────
export async function addChannel(channel: Channel): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.CHANNELS, channel.id), clean(channel));
}
export async function updateChannel(id: string, updates: Partial<Channel>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CHANNELS, id), clean(updates));
}
// ✅ Simple where
export function listenChannels(companyId: string, cb: (c: Channel[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.CHANNELS),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => fromDoc<Channel>(d)));
  });
}

// ─────────────────────────────────────────────────────────────
// Messages  (scoped by channelId — no companyId filter needed)
// ─────────────────────────────────────────────────────────────
export async function sendMessage(message: Message): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.MESSAGES, message.id), clean(message));
  await updateDoc(doc(db, COLLECTIONS.CHANNELS, message.channelId), {
    lastMessage: clean(message),
  });
}
export async function updateMessageReactions(
  messageId: string,
  reactions: Record<string, string[]>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.MESSAGES, messageId), { reactions });
}
// ✅ Single where on channelId — no composite index
export function listenMessages(channelId: string, cb: (msgs: Message[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.MESSAGES),
    where('channelId', '==', channelId)
  );
  return onSnapshot(q, snap => {
    const msgs = snap.docs.map(d => fromDoc<Message>(d));
    cb(msgs.sort(byCreatedAsc));
  });
}

// ─────────────────────────────────────────────────────────────
// Files
// ─────────────────────────────────────────────────────────────
export async function addFile(file: FileItem): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.FILES, file.id), clean(file));
}
export async function deleteFile(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.FILES, id));
}
export async function renameFile(id: string, name: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.FILES, id), {
    name,
    updatedAt: new Date().toISOString(),
  });
}
// ✅ Simple where
export function listenFiles(companyId: string, cb: (f: FileItem[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.FILES),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => fromDoc<FileItem>(d)));
  });
}

// ─────────────────────────────────────────────────────────────
// Announcements
// ─────────────────────────────────────────────────────────────
export async function addAnnouncement(ann: Announcement): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, ann.id), clean(ann));
}
export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, id));
}
// ✅ Simple where — sort in-memory
export function listenAnnouncements(companyId: string, cb: (a: Announcement[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.ANNOUNCEMENTS),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    const anns = snap.docs.map(d => fromDoc<Announcement>(d));
    cb(anns.sort(byCreatedDesc));
  });
}

// ─────────────────────────────────────────────────────────────
// Notifications  (per user)
// ─────────────────────────────────────────────────────────────
export async function addNotification(notif: Notification): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notif.id), clean(notif));
}
export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
}
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snaps = await getDocs(q);
  const batch = writeBatch(db);
  snaps.docs.forEach(d => batch.update(d.ref, { read: true }));
  if (snaps.docs.length) await batch.commit();
}
// ✅ Single where on userId — no composite index
export function listenNotifications(userId: string, cb: (n: Notification[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId)
  );
  return onSnapshot(q, snap => {
    const notifs = snap.docs.map(d => fromDoc<Notification>(d));
    cb(notifs.sort(byCreatedDesc).slice(0, 50));
  });
}

// ─────────────────────────────────────────────────────────────
// Calendar Events
// ─────────────────────────────────────────────────────────────
export async function addCalendarEvent(event: CalendarEvent): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.CALENDAR, event.id), clean(event));
}
export async function deleteCalendarEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CALENDAR, id));
}
// ✅ Simple where
export function listenCalendarEvents(companyId: string, cb: (e: CalendarEvent[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.CALENDAR),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    const evts = snap.docs.map(d => fromDoc<CalendarEvent>(d));
    cb(evts.sort((a, b) => a.startDate.localeCompare(b.startDate)));
  });
}

// ─────────────────────────────────────────────────────────────
// Virtual Rooms
// ─────────────────────────────────────────────────────────────
export async function setVirtualRoom(room: VirtualRoom): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.ROOMS, room.id), clean(room));
}
// ✅ Simple where
export function listenVirtualRooms(companyId: string, cb: (r: VirtualRoom[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.ROOMS),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => fromDoc<VirtualRoom>(d)));
  });
}

// ─────────────────────────────────────────────────────────────
// Activity Log
// ─────────────────────────────────────────────────────────────
export async function addActivityLog(log: ActivityLog): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.ACTIVITY, log.id), clean(log));
}
// ✅ Simple where — sort in-memory
export function listenActivityLog(companyId: string, cb: (l: ActivityLog[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.ACTIVITY),
    where('companyId', '==', companyId)
  );
  return onSnapshot(q, snap => {
    const logs = snap.docs.map(d => fromDoc<ActivityLog>(d));
    cb(logs.sort(byCreatedDesc).slice(0, 50));
  });
}
