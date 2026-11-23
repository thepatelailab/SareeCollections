
'use client';

import { firebaseConfig } from '@/firebase/config';

/**
 * @fileOverview Safe Firebase initialization for Next.js 15.
 * This pattern ensures that Firebase service SDKs are ONLY loaded in the browser.
 * Loading them on the server causes a "TypeError: ... prototype of undefined" crash.
 */

export interface FirebaseSdks {
  firebaseApp: any;
  auth: any;
  firestore: any;
  storage: any;
}

let sdkCache: FirebaseSdks | null = null;

/**
 * Initializes Firebase dynamically on the client side only.
 */
export async function initializeFirebase(): Promise<FirebaseSdks | null> {
  if (typeof window === 'undefined') return null;
  if (sdkCache) return sdkCache;

  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    sdkCache = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app),
    };
    
    return sdkCache;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return null;
  }
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
export * from './client-provider';
