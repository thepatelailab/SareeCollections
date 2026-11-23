'use client';

/**
 * @fileOverview Refined Firebase Client SDK Initialization.
 * Strictly guards against server-side execution to prevent "prototype" errors on Vercel/Node.js.
 */

import { firebaseConfig } from '@/firebase/config';

export interface FirebaseSdks {
  firebaseApp: any;
  auth: any;
  firestore: any;
  storage: any;
}

let sdkCache: FirebaseSdks | null = null;

export function initializeFirebase(): FirebaseSdks {
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
    const { initializeApp, getApps, getApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    sdkCache = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app),
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
