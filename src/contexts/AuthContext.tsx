import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: "AIzaSyDHV6PgQHtWxmm0RkGXxkHQ_HoHX5mz9Yk",
  authDomain: "dhvani-app.firebaseapp.com",
  projectId: "dhvani-app",
  storageBucket: "dhvani-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};

// Initialize Firebase
let app;
let auth;
let provider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
} catch (error) {
  console.error('Firebase initialization error:', error);
}

interface AuthContextType {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // In development, set a mock user immediately
    if (process.env.NODE_ENV === 'development') {
      setUser({
        uid: 'dev-user-123',
        email: 'dev@example.com',
        displayName: 'Development User',
      } as User);
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Handle auth state changes
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
        setInitialized(true);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Handle redirect result
  useEffect(() => {
    if (!initialized || !auth) return;

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setError('Failed to complete sign-in. Please try again.');
      }
    };

    handleRedirectResult();
  }, [initialized]);

  const signIn = async () => {
    try {
      setError(null);
      setLoading(true);

      if (process.env.NODE_ENV === 'development') {
        setUser({
          uid: 'dev-user-123',
          email: 'dev@example.com',
          displayName: 'Development User',
        } as User);
        setLoading(false);
        return;
      }

      if (auth && provider) {
        await signInWithRedirect(auth, provider);
      } else {
        throw new Error('Firebase auth not initialized');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);

      if (process.env.NODE_ENV === 'development') {
        setUser(null);
        setLoading(false);
        return;
      }

      if (auth) {
        await firebaseSignOut(auth);
        setUser(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    signIn,
    signOut,
    loading,
    error
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}