import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

interface UseUserDataReturn {
  userData: User | null;
  loading: boolean;
  error: Error | null;
  updateUserData: (data: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export function useUserData(): UseUserDataReturn {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getUserData = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('User document not found');
      }

      return userSnap.data() as User;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const updateUserData = async (data: Partial<User>) => {
    if (!authUser?.uid) {
      throw new Error('No authenticated user');
    }

    try {
      const userRef = doc(db, 'users', authUser.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      const updatedData = await getUserData(authUser.uid);
      setUserData(updatedData);
    } catch (error) {
      console.error('Error updating user data:', error);
      setError(error instanceof Error ? error : new Error('Failed to update user data'));
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (!authUser?.uid) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getUserData(authUser.uid);
      setUserData(data);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setError(error instanceof Error ? error : new Error('Failed to refresh user data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, [authUser?.uid]);

  return {
    userData,
    loading,
    error,
    updateUserData,
    refreshUserData
  };
}