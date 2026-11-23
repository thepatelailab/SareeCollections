'use client';

import { useState, useEffect, useRef } from 'react';
import {
  onSnapshot,
  type Query,
  type DocumentData,
  type FirestoreError,
  type CollectionReference,
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

export function useCollection<T = any>(
  memoizedTargetRefOrQuery: (CollectionReference<DocumentData> | Query<DocumentData>) | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery || typeof window === 'undefined') {
      setData(null);
      setIsLoading(false);
      setError(null);
      subscriptionRef.current = null;
      return;
    }

    if (process.env.NODE_ENV !== 'production' && !isMemoized(memoizedTargetRefOrQuery)) {
      console.warn('useCollection: memoizedTargetRefOrQuery was not properly memoized.');
    }

    const currentSubId = Math.random().toString(36).substring(7);
    subscriptionRef.current = currentSubId;

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
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

        const path = (memoizedTargetRefOrQuery as any).path || 'query';
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
