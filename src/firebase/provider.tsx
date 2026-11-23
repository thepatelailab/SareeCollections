'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth, User } from 'firebase/auth';
import type { FirebaseStorage } from 'firebase/storage';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

const memoizedRefs = new WeakMap<object, boolean>();

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    // Only run authentication listeners in the browser
    if (!auth || typeof window === 'undefined') {
      setUserAuthState({ user: null, isUserLoading: false, userError: null });
      return;
    }

    try {
      // Dynamic require ensures side-effects run before we use the auth instance
      const { onAuthStateChanged } = require('firebase/auth');
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser: User | null) => {
          setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
        },
        (error: any) => {
          setUserAuthState({ user: null, isUserLoading: false, userError: error });
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Auth state listener failed to initialize:", e);
      setUserAuthState({ user: null, isUserLoading: false, userError: null });
    }
  }, [auth]);

  const contextValue = useMemo((): FirebaseContextState => {
    const isBrowser = typeof window !== 'undefined';
    // areServicesAvailable is primarily used for developer debugging and feature-gating
    const servicesAvailable = isBrowser && !!(firebaseApp && firestore && auth && storage);
    
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp,
      firestore,
      auth,
      storage,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, storage, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

export const useAuth = (): Auth | null => useFirebase().auth;
export const useFirestore = (): Firestore | null => useFirebase().firestore;
export const useFirebaseApp = (): FirebaseApp | null => useFirebase().firebaseApp;
export const useStorage = (): FirebaseStorage | null => useFirebase().storage;

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps);
  useEffect(() => {
    if (memoized && typeof memoized === 'object') {
      memoizedRefs.set(memoized as object, true);
    }
  }, [memoized]);
  return memoized;
}

export function isMemoized(obj: any): boolean {
  return !!(obj && typeof obj === 'object' && memoizedRefs.has(obj));
}

export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
  if (!context) {
    return { user: null, isUserLoading: true, userError: null };
  }
  return { user: context.user, isUserLoading: context.isUserLoading, userError: context.userError };
};
