'use client';

/**
 * @fileOverview Firebase Client SDK Initialization barrel file.
 * This file is strictly for client-side use but safe for SSR evaluation.
 */

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
export * from './client-provider';

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

  // CRITICAL: Only initialize services on the client to avoid SSR crashes (prototype error)
  if (typeof window !== 'undefined') {
    // Dynamic requires to ensure these modules are not evaluated on the server
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
