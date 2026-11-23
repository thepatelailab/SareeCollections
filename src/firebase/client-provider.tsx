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
    // Only initialize in the browser to prevent "prototype" errors on Vercel
    const initialized = initializeFirebase();
    setServices(initialized);
  }, []);

  // Critical: Do not render children until services are ready on the client.
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
