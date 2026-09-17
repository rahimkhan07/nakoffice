// ─────────────────────────────────────────────────────────────
// Firebase Admin SDK  (server-side only — bypasses security rules)
// Uses Application Default Credentials or a service account key.
// In development with no service account we use the project ID
// directly via the REST Admin API emulation approach.
// ─────────────────────────────────────────────────────────────
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // If a service account JSON is available via env var, use it.
  // Otherwise fall back to application default credentials.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // Fallback: use project ID with default credentials
  // (works on Google Cloud / Vercel with Workload Identity)
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  });
}

let adminDb: Firestore;

export function getAdminDb(): Firestore {
  if (!adminDb) {
    const app = getAdminApp();
    adminDb = getFirestore(app);
  }
  return adminDb;
}
