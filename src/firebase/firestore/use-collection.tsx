'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { isMemoized } from '@/firebase/provider';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery: (CollectionReference<DocumentData> | Query<DocumentData>) | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  // Track the current subscription to prevent race conditions during unmount/remount
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      subscriptionRef.current = null;
      return;
    }

    // Verification check for developer experience
    if (process.env.NODE_ENV !== 'production' && !isMemoized(memoizedTargetRefOrQuery)) {
      console.warn('useCollection: memoizedTargetRefOrQuery was not properly memoized. This can trigger SDK assertion errors (ca9).');
    }

    const currentSubId = Math.random().toString(36).substring(7);
    subscriptionRef.current = currentSubId;

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        // Only update state if this is still the active subscription
        if (subscriptionRef.current !== currentSubId) return;

        const results: WithId<T>[] = snapshot.docs.map(doc => ({
          ...(doc.data() as T),
          id: doc.id,
        }));
        
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      async (serverError: FirestoreError) => {
        if (subscriptionRef.current !== currentSubId) return;

        // Attempt to extract a useful path for the error reporter
        const path = (memoizedTargetRefOrQuery as any).path || 
                     (memoizedTargetRefOrQuery as any)._query?.path?.segments?.join('/') || 
                     'query';

        const permissionError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        setError(permissionError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => {
      subscriptionRef.current = null;
      unsubscribe();
    };
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}