import { create } from 'zustand';
import { 
  collection, 
  query, 
  getDocs, 
  getDoc,
  doc,
  where,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '../types';

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchUsersByIds: (userIds: string[]) => Promise<void>;
  fetchUserById: (userId: string) => Promise<User | null>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  searchUsers: (searchTerm: string) => Promise<User[]>;
  clearUsers: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });
      
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          isAdmin: data.isAdmin || false,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      set({ users: usersData, loading: false });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchUsersByIds: async (userIds) => {
    try {
      set({ loading: true, error: null });
      
      const usersData: User[] = [];
      
      // Firebase doesn't support array-contains with multiple values,
      // so we need to fetch each user individually
      for (const userId of userIds) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          usersData.push({
            id: userDoc.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            isAdmin: data.isAdmin || false,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        }
      }
      
      set({ users: usersData, loading: false });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchUserById: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const user: User = {
          id: userDoc.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          isAdmin: data.isAdmin || false,
          createdAt: data.createdAt?.toDate() || new Date()
        };
        
        set({ loading: false });
        return user;
      }
      
      set({ loading: false });
      return null;
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },
  
  updateUser: async (userId, userData) => {
    try {
      set({ loading: true, error: null });
      
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, userData);
      
      // Update the user in the state
      const { users } = get();
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      );
      
      set({ users: updatedUsers, loading: false });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  deleteUser: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'users', userId));
      
      // Remove the user from the state
      const { users } = get();
      set({ 
        users: users.filter(user => user.id !== userId),
        loading: false 
      });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  searchUsers: async (searchTerm) => {
    try {
      set({ loading: true, error: null });
      
      // Firebase doesn't support case-insensitive search directly,
      // so we'll fetch all users and filter them client-side
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          isAdmin: data.isAdmin || false,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      // Filter users based on the search term
      const filteredUsers = usersData.filter(user => 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      set({ loading: false });
      return filteredUsers;
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return [];
    }
  },
  
  clearUsers: () => set({ users: [] })
}));