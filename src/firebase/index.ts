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
 * Uses a module-level cache and standard SDK checks to ensure idempotency.
 */
export function initializeFirebase(): FirebaseSdks {
  // 1. Check local module cache
  if (sdkCache) {
    return sdkCache;
  }

  // 2. Check if an app is already initialized via global Firebase registry
  const existingApps = getApps();
  if (existingApps.length > 0) {
    const app = existingApps[0];
    sdkCache = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
    return sdkCache;
  }

  // 3. Initialize new app instance
  let app: FirebaseApp;
  try {
    // Attempt automatic initialization (App Hosting / Google Environment)
    app = initializeApp();
  } catch (e) {
    // Fallback to manual config
    app = initializeApp(firebaseConfig);
  }

  sdkCache = {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };

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
