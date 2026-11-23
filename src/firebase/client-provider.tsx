'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase, FirebaseSdks } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * A Provider that handles async Firebase initialization and prevents 
 * children from rendering until the SDK is ready in the browser.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [sdks, setSdks] = useState<FirebaseSdks | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Initialize Firebase only once in the browser
    initializeFirebase().then(setSdks);
  }, []);

  // Prevent SSR evaluation of Firebase-dependent children
  if (!isMounted || !sdks) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-headline text-xl lowercase opacity-40">
          preparing heritage services...
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={sdks.firebaseApp}
      auth={sdks.auth}
      firestore={sdks.firestore}
      storage={sdks.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
