'use client';

import { useState, useEffect, useRef } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: any;
}

/**
 * A safe hook for Firestore documents that dynamically imports SDK functions
 * to prevent SSR crashes.
 */
export function useDoc<T = any>(
  memoizedDocRef: any,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!memoizedDocRef || typeof window === 'undefined') {
      setData(null);
      setIsLoading(false);
      return;
    }

    const currentSubId = Math.random().toString(36).substring(7);
    subscriptionRef.current = currentSubId;

    setIsLoading(true);
    setError(null);

    let unsubscribe: () => void = () => {};

    import('firebase/firestore').then(({ onSnapshot }) => {
      if (subscriptionRef.current !== currentSubId) return;

      unsubscribe = onSnapshot(
        memoizedDocRef,
        (snapshot) => {
          if (subscriptionRef.current !== currentSubId) return;

          if (snapshot.exists()) {
            setData({ ...(snapshot.data() as T), id: snapshot.id });
          } else {
            setData(null);
          }
          setError(null);
          setIsLoading(false);
        },
        (serverError) => {
          if (subscriptionRef.current !== currentSubId) return;

          const contextualError = new FirestorePermissionError({
            operation: 'get',
            path: memoizedDocRef.path || 'document',
          });

          setError(contextualError);
          setData(null);
          setIsLoading(false);
          errorEmitter.emit('permission-error', contextualError);
        }
      );
    });

    return () => {
      subscriptionRef.current = null;
      unsubscribe();
    };
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
