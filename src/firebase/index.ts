'use client';

/**
 * @fileOverview Firebase Client SDK Initialization.
 * This file is strictly for client-side use. 
 * Imports of service SDKs are kept local to the initialization function 
 * where possible to prevent SSR prototype crashes.
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
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      app = initializeApp(firebaseConfig);
    }
  }

  // CRITICAL: Only initialize services on the client to avoid SSR crashes
  // We use dynamic require here to ensure these libraries are only loaded in the browser context
  if (typeof window !== 'undefined') {
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');

    sdkCache = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app),
    };
  } else {
    sdkCache = {
      firebaseApp: app,
      auth: null,
      firestore: null,
      storage: null,
    };
  }

  return sdkCache;
}

// Export providers and hooks directly to avoid massive barrel imports in server components
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
