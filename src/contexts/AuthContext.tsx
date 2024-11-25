import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';
import { isLightColor } from '../utils/color';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const auth = getAuth();

  const createUserDocument = async (firebaseUser: FirebaseUser, displayName?: string): Promise<User> => {
    if (!firebaseUser?.uid || !firebaseUser?.email) {
      throw new Error('Invalid user data: missing uid or email');
    }

    const userRef = doc(db, 'users', firebaseUser.uid);
    
    try {
      const userSnap = await getDoc(userRef);
      const now = serverTimestamp();

      if (!userSnap.exists()) {
        // Create new user
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: displayName || firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || null,
          isAdmin: false,
          projects: {},
          createdAt: now,
          updatedAt: now,
          lastLogin: now
        };

        await setDoc(userRef, userData);
        return userData;
      }

      // Update existing user
      const existingData = userSnap.data() as User;
      const updatedData = {
        ...existingData,
        lastLogin: now,
        updatedAt: now
      };

      await setDoc(userRef, updatedData, { merge: true });
      return updatedData;
    } catch (error) {
      console.error('Error creating/fetching user document:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await createUserDocument(firebaseUser);
          setUser(userData);

          // Get user's current project and apply brand color
          if (userData.currentProjectId) {
            const projectRef = doc(db, 'projects', userData.currentProjectId);
            const projectSnap = await getDoc(projectRef);
            if (projectSnap.exists()) {
              const projectData = projectSnap.data();
              if (projectData.settings?.brandColor) {
                document.documentElement.style.setProperty('--brand-color', projectData.settings.brandColor);
                document.documentElement.style.setProperty(
                  '--brand-text-color',
                  isLightColor(projectData.settings.brandColor) ? '#000000' : '#FFFFFF'
                );
              }
            }
          }
        } else {
          setUser(null);
          // Reset to default brand color
          document.documentElement.style.setProperty('--brand-color', '#3B82F6');
          document.documentElement.style.setProperty('--brand-text-color', '#FFFFFF');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError(error instanceof Error ? error : new Error('Authentication error'));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const userData = await createUserDocument(firebaseUser);
      setUser(userData);
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error : new Error('Sign in failed'));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(firebaseUser, { displayName });
      const userData = await createUserDocument(firebaseUser, displayName);
      setUser(userData);
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error instanceof Error ? error : new Error('Sign up failed'));
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      const userData = await createUserDocument(firebaseUser);
      setUser(userData);
    } catch (error) {
      console.error('Google sign in error:', error);
      setError(error instanceof Error ? error : new Error('Google sign in failed'));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error instanceof Error ? error : new Error('Sign out failed'));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signOut
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};