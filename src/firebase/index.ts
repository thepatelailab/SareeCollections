'use client';

/**
 * @fileOverview Firebase Client SDK Initialization barrel file.
 * Safe for both SSR and client-side execution.
 */

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
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
  // Guard for SSR: Return app instance but no services
  if (typeof window === 'undefined') {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
      storage: null,
    };
  }

  if (sdkCache) return sdkCache;

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    // Use require to ensure these are only loaded in the browser
    // and that side-effects (registration) run before we call getters
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
    
    return sdkCache;
  } catch (error) {
    console.error("Firebase service initialization failed:", error);
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
      storage: null,
    };
  }
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
export * from './client-provider';
