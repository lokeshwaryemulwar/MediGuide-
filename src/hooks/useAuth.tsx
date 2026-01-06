import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db, googleProvider } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface UserData {
  name: string;
  email: string;
  mobile?: string;
  age?: string;
  gender?: string;
  isLoggedIn: boolean;
  uid: string;
}

interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Omit<UserData, 'email' | 'isLoggedIn' | 'uid'>) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const MIN_LOADING_TIME = 5000; // 5 seconds minimum loading time

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUser({ ...userDoc.data() as UserData, isLoggedIn: true, uid: firebaseUser.uid });
            } else {
              // Handle case where user exists in Auth but not Firestore (e.g. first Google login)
              const newUserData: UserData = {
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                isLoggedIn: true,
                uid: firebaseUser.uid
              };
              setUser(newUserData);
            }
          } catch (error) {
            console.error('Error fetching user data from Firestore:', error);
            // Even if Firestore fails, we can still log the user in with basic info
            const fallbackUserData: UserData = {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              isLoggedIn: true,
              uid: firebaseUser.uid
            };
            setUser(fallbackUserData);
            toast.error('Could not load full profile, using basic info');
          }
        } else {
          setUser(null);
        }
      } finally {
        // Ensure minimum loading time of 5 seconds for smooth UX
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Immediately fetch and set user data to trigger redirect
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data() as UserData, isLoggedIn: true, uid: firebaseUser.uid });
        } else {
          const userData: UserData = {
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            isLoggedIn: true,
            uid: firebaseUser.uid
          };
          setUser(userData);
        }
      } catch (firestoreError) {
        console.error('Error fetching user data:', firestoreError);
        // Set basic user data as fallback
        const fallbackUserData: UserData = {
          name: firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          isLoggedIn: true,
          uid: firebaseUser.uid
        };
        setUser(fallbackUserData);
      }

      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };

  const signup = async (email: string, password: string, additionalData: Omit<UserData, 'email' | 'isLoggedIn' | 'uid'>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      const userData: UserData = {
        ...additionalData,
        email,
        isLoggedIn: true,
        uid: firebaseUser.uid
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setUser(userData);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Signup error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const googleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const userData: UserData = {
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          isLoggedIn: true,
          uid: firebaseUser.uid
        };
        await setDoc(userDocRef, userData);
        setUser(userData);
      } else {
        setUser({ ...userDoc.data() as UserData, isLoggedIn: true, uid: firebaseUser.uid });
      }
      toast.success('Logged in with Google!');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, googleSignIn, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
