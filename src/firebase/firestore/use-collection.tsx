'use client';

import { useState, useEffect, useRef } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: any;
}

/**
 * A safe hook for Firestore collections that dynamically imports SDK functions
 * to prevent SSR crashes.
 */
export function useCollection<T = any>(
  memoizedQuery: any,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!memoizedQuery || typeof window === 'undefined') {
      setData(null);
      setIsLoading(false);
      return;
    }

    const currentSubId = Math.random().toString(36).substring(7);
    subscriptionRef.current = currentSubId;

    setIsLoading(true);
    setError(null);

    let unsubscribe: () => void = () => {};

    // Dynamically import Firestore SDK to ensure it only runs in the browser
    import('firebase/firestore').then(({ onSnapshot }) => {
      if (subscriptionRef.current !== currentSubId) return;

      unsubscribe = onSnapshot(
        memoizedQuery,
        (snapshot) => {
          if (subscriptionRef.current !== currentSubId) return;

          const results: WithId<T>[] = snapshot.docs.map((doc) => ({
            ...(doc.data() as T),
            id: doc.id,
          }));
          
          setData(results);
          setError(null);
          setIsLoading(false);
        },
        (serverError) => {
          if (subscriptionRef.current !== currentSubId) return;

          const permissionError = new FirestorePermissionError({
            operation: 'list',
            path: memoizedQuery.path || 'query',
          });

          setError(permissionError);
          setData(null);
          setIsLoading(false);
          errorEmitter.emit('permission-error', permissionError);
        }
      );
    });

    return () => {
      subscriptionRef.current = null;
      unsubscribe();
    };
  }, [memoizedQuery]);

  return { data, isLoading, error };
}
