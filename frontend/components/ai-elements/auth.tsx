'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, UserCredential, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthUser extends User {
  username?: string;
}

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  signout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
};

// Create a context for the auth state
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signin: async (email, password) => { throw new Error("Not implemented"); },
  signup: async (email, password) => { throw new Error("Not implemented"); },
  signout: async () => { throw new Error("Not implemented"); },
  sendPasswordResetEmail: async (email) => { throw new Error("Not implemented"); },
});

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const getFirebaseAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'User not found. Please check your email or sign up.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email is already in use by another account.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/invalid-credential':
      return 'Invalid credential. Please check your email and password.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() } as AuthUser);
        } else {
          setUser(firebaseUser as AuthUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signin: (email: string, password: string) => signInWithEmailAndPassword(auth, email, password),
    signup: (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password),
    signout: () => signOut(auth),
    sendPasswordResetEmail: (email: string) => sendPasswordResetEmail(auth, email),
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};