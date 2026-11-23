'use client';

import { useState, useEffect, useRef } from 'react';
import type {
  DocumentReference,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { isMemoized } from '@/firebase/provider';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Uses dynamic imports to prevent SSR crashes.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!memoizedDocRef || typeof window === 'undefined') {
      setData(null);
      setIsLoading(false);
      setError(null);
      subscriptionRef.current = null;
      return;
    }

    if (process.env.NODE_ENV !== 'production' && !isMemoized(memoizedDocRef)) {
      console.warn('useDoc: memoizedDocRef was not properly memoized.');
    }

    const currentSubId = Math.random().toString(36).substring(7);
    subscriptionRef.current = currentSubId;

    setIsLoading(true);
    setError(null);

    // Dynamic import to prevent SSR "prototype" error
    const { onSnapshot } = require('firebase/firestore');

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: any) => {
        if (subscriptionRef.current !== currentSubId) return;

        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (serverError: FirestoreError) => {
        if (subscriptionRef.current !== currentSubId) return;

        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => {
      subscriptionRef.current = null;
      unsubscribe();
    };
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
