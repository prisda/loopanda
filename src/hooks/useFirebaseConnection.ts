import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

export function useFirebaseConnection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleOnline = async () => {
      try {
        await enableNetwork(db);
        setIsOnline(true);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error enabling network:', err);
      }
    };

    const handleOffline = async () => {
      try {
        await disableNetwork(db);
        setIsOnline(false);
        setIsConnected(false);
      } catch (err) {
        setError(err as Error);
        console.error('Error disabling network:', err);
      }
    };

    // Initial connection
    if (navigator.onLine) {
      handleOnline();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isConnected, error };
}