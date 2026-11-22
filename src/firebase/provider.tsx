'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
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
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
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

// A WeakMap to track memoized Firestore references/queries without mutating the objects.
const memoizedRefs = new WeakMap<object, boolean>();

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
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
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: null });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth && storage);
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

/**
 * Hook to access the Firebase context. 
 * Enforces service availability only on the client side to prevent SSR crashes.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  // Only throw service availability errors on the client.
  // On the server, we expect these to be null as the SDKs are not initialized for SSR.
  if (typeof window !== 'undefined' && !context.areServicesAvailable) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp as FirebaseApp,
    firestore: context.firestore as Firestore,
    auth: context.auth as Auth,
    storage: context.storage as FirebaseStorage,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = (): Auth => useFirebase().auth;
export const useFirestore = (): Firestore => useFirebase().firestore;
export const useFirebaseApp = (): FirebaseApp => useFirebase().firebaseApp;
export const useStorage = (): FirebaseStorage => useFirebase().storage;

/**
 * Memoizes a Firestore reference or query. 
 * Use this to ensure stability for hooks like useCollection or useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps);
  useEffect(() => {
    if (memoized && typeof memoized === 'object') {
      memoizedRefs.set(memoized as object, true);
    }
  }, [memoized]);
  return memoized;
}

/**
 * Internal check to verify if a reference or query was properly memoized.
 */
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
