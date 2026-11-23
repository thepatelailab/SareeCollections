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

    // Dynamically require service SDKs to ensure side-effects (registration) 
    // run before we call the getters. This prevents the "Component not registered" error.
    const authModule = require('firebase/auth');
    const firestoreModule = require('firebase/firestore');
    const storageModule = require('firebase/storage');

    sdkCache = {
      firebaseApp: app,
      auth: authModule.getAuth(app),
      firestore: firestoreModule.getFirestore(app),
      storage: storageModule.getStorage(app),
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
