'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase, FirebaseSdks } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseSdks | null>(null);

  useEffect(() => {
    // Initialize only in the browser to prevent prototype errors on Vercel
    const initialized = initializeFirebase();
    setServices(initialized);
  }, []);

  // Critical: Do not render children until services are ready.
  // This prevents the "useFirebase must be used within a FirebaseProvider" error
  // which happens if a child (like AppProvider) calls the context too early.
  if (!services || !services.firebaseApp) {
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
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
      storage={services.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
