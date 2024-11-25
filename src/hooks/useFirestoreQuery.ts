import { useState, useEffect, useCallback } from 'react';
import { Query, onSnapshot, QuerySnapshot, FirestoreError } from 'firebase/firestore';

export function useFirestoreQuery<T>(query: Query, options = { retryCount: 3, retryDelay: 1000 }) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const handleError = useCallback((err: FirestoreError) => {
    console.error('Firestore query error:', err);
    setError(err);
    
    // Retry logic for specific error codes
    if (
      (err.code === 'unavailable' || err.code === 'failed-precondition') &&
      retryAttempt < options.retryCount
    ) {
      setTimeout(() => {
        setRetryAttempt(prev => prev + 1);
      }, options.retryDelay * Math.pow(2, retryAttempt)); // Exponential backoff
    } else {
      setLoading(false);
    }
  }, [retryAttempt, options.retryCount, options.retryDelay]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    const setupQuery = async () => {
      try {
        unsubscribe = onSnapshot(
          query,
          {
            next: (snapshot: QuerySnapshot) => {
              if (!mounted) return;
              try {
                const docs = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                })) as T[];
                setData(docs);
                setError(null);
                setLoading(false);
              } catch (err) {
                handleError(err as FirestoreError);
              }
            },
            error: handleError
          }
        );
      } catch (err) {
        if (mounted) {
          handleError(err as FirestoreError);
        }
      }
    };

    setupQuery();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [query, handleError, retryAttempt]);

  return { data, loading, error, retry: () => setRetryAttempt(prev => prev + 1) };
}