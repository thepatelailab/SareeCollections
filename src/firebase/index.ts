'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseSdks {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
}

let sdkCache: FirebaseSdks | null = null;

/**
 * Initializes Firebase and returns the singleton instances of the SDKs.
 * Uses a module-level cache and standard SDK checks to ensure idempotency.
 * Guarded for SSR to prevent "prototype" errors on the server.
 */
export function initializeFirebase(): FirebaseSdks {
  // 1. Check local module cache
  if (sdkCache) {
    return sdkCache;
  }

  // 2. Check if an app is already initialized via global Firebase registry
  const existingApps = getApps();
  let app: FirebaseApp;

  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    // 3. Initialize new app instance
    try {
      // Attempt automatic initialization (App Hosting / Google Environment)
      app = initializeApp();
    } catch (e) {
      // Fallback to manual config
      app = initializeApp(firebaseConfig);
    }
  }

  // CRITICAL: Only initialize services on the client to avoid SSR crashes
  if (typeof window !== 'undefined') {
    sdkCache = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app),
    };
  } else {
    // Return app instance but null services for SSR
    sdkCache = {
      firebaseApp: app,
      auth: null,
      firestore: null,
      storage: null,
    };
  }

  return sdkCache;
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
