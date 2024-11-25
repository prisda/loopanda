import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { collection, getDocs, limit, query } from 'firebase/firestore';

interface FirestoreContextType {
  isOnline: boolean;
  isConnected: boolean;
  error: Error | null;
  retry: () => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType>({
  isOnline: true,
  isConnected: false,
  error: null,
  retry: async () => {}
});

export function FirestoreProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    try {
      // Try to fetch a single public document to verify connection
      const testQuery = query(collection(db, 'users'), limit(1));
      await getDocs(testQuery);
      setIsConnected(true);
      setError(null);
    } catch (err: any) {
      console.error('Firebase connection error:', err);
      setError(new Error(err.message || 'Failed to connect to Firebase'));
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection check
    checkConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retry = async () => {
    setIsChecking(true);
    await checkConnection();
  };

  if (isChecking) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorAlert 
          message={`Failed to connect to Firebase: ${error.message}. Please check your connection and try again.`}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <FirestoreContext.Provider value={{ 
      isOnline, 
      isConnected, 
      error, 
      retry 
    }}>
      {children}
    </FirestoreContext.Provider>
  );
}

export const useFirestore = () => useContext(FirestoreContext);