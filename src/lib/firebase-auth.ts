'use client';
// ─────────────────────────────────────────────────────────────
// Firebase Authentication helpers
// ─────────────────────────────────────────────────────────────
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  type User as FBUser,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './firebase';
import { setUser, getUserById } from './firestore';
import type { User } from '@/types';

const googleProvider = new GoogleAuthProvider();

// ─────────────────────────────────────────────────────────────
// Sign up with email + password
// ─────────────────────────────────────────────────────────────
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  companyId: string,
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await sendEmailVerification(cred.user);

  const user: User = {
    id:           cred.user.uid,
    email,
    name,
    status:       'available',
    role:         'employee',
    companyId,
    joinedAt:     new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    isOnline:     true,
    position:     { x: 320, y: 180 },
  };
  await setUser(user);
  return user;
}

// ─────────────────────────────────────────────────────────────
// Sign in with email + password
// ─────────────────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string): Promise<FBUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ─────────────────────────────────────────────────────────────
// Sign in with Google popup
// ─────────────────────────────────────────────────────────────
export async function loginWithGoogle(companyId: string): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  const fb   = cred.user;

  // Check if a user doc already exists
  let user = await getUserById(fb.uid);
  if (!user) {
    user = {
      id:           fb.uid,
      email:        fb.email ?? '',
      name:         fb.displayName ?? 'New User',
      avatar:       fb.photoURL ?? undefined,
      status:       'available',
      role:         'employee',
      companyId,
      joinedAt:     new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isOnline:     true,
      position:     { x: 320, y: 180 },
    };
    await setUser(user);
  }
  return user;
}

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await signOut(auth);
}

// ─────────────────────────────────────────────────────────────
// Forgot password
// ─────────────────────────────────────────────────────────────
export async function forgotPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// ─────────────────────────────────────────────────────────────
// Auth state listener
// ─────────────────────────────────────────────────────────────
export function onAuthChange(cb: (user: FBUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, cb);
}

// ─────────────────────────────────────────────────────────────
// Get current Firebase user
// ─────────────────────────────────────────────────────────────
export function getCurrentFBUser(): FBUser | null {
  return auth.currentUser;
}
