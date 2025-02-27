import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'id'>;
          set({ 
            user: { 
              id: firebaseUser.uid, 
              ...userData,
              createdAt: userData.createdAt?.toDate() || new Date()
            }, 
            loading: false 
          });
        } else {
          set({ user: null, loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    });
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  },
  
  signUp: async (email, password, displayName) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName,
        photoURL: null,
        isAdmin: false,
        createdAt: serverTimestamp()
      });
      
      const userData = {
        id: userCredential.user.uid,
        email,
        displayName,
        isAdmin: false,
        createdAt: new Date()
      };
      
      set({ user: userData, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, 'id'>;
        set({ 
          user: { 
            id: userCredential.user.uid, 
            ...userData,
            createdAt: userData.createdAt?.toDate() || new Date()
          }, 
          loading: false 
        });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await firebaseSignOut(auth);
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  clearError: () => set({ error: null })
}));