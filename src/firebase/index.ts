'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

interface FirebaseSdks {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

let sdkCache: FirebaseSdks | null = null;

/**
 * Initializes Firebase and returns the singleton instances of the SDKs.
 * Uses a module-level cache to ensure idempotency across the application lifecycle.
 */
export function initializeFirebase(): FirebaseSdks {
  if (sdkCache) {
    return sdkCache;
  }

  // Check if an app is already initialized (standard Firebase SDK check)
  if (getApps().length > 0) {
    const app = getApp();
    sdkCache = getSdks(app);
    return sdkCache;
  }

  let app: FirebaseApp;
  try {
    // Attempt automatic initialization (often used in Firebase App Hosting)
    app = initializeApp();
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Firebase automatic initialization failed, falling back to config object.', e);
    }
    app = initializeApp(firebaseConfig);
  }

  sdkCache = getSdks(app);
  return sdkCache;
}

/**
 * Helper to get SDK instances for a given FirebaseApp.
 */
export function getSdks(firebaseApp: FirebaseApp): FirebaseSdks {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
