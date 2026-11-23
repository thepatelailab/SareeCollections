'use client';

/**
 * @fileOverview Firebase Client SDK Initialization barrel file.
 * This file is safe for both SSR and client-side execution.
 */

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

export interface FirebaseSdks {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
}

let sdkCache: FirebaseSdks | null = null;

export function initializeFirebase(): FirebaseSdks {
  if (sdkCache) return sdkCache;

  const existingApps = getApps();
  let app: FirebaseApp;

  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    app = initializeApp(firebaseConfig);
  }

  // Guard for SSR: Return app instance but no services
  if (typeof window === 'undefined') {
    return {
      firebaseApp: app,
      auth: null,
      firestore: null,
      storage: null,
    };
  }

  try {
    // Dynamic imports to prevent SSR crashes (prototype errors)
    // We import them using require to ensure side-effects (registration) run synchronously
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');

    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);

    sdkCache = {
      firebaseApp: app,
      auth,
      firestore,
      storage,
    };
  } catch (error) {
    console.error("Firebase service initialization failed:", error);
    // Fallback: return app with null services to allow partial hydration
    return {
      firebaseApp: app,
      auth: null,
      firestore: null,
      storage: null,
    };
  }

  return sdkCache;
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
export * from './client-provider';
