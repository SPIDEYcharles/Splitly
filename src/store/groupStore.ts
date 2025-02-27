import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Group } from '../types';

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;
  createGroup: (name: string, members: string[], createdBy: string) => Promise<void>;
  updateGroup: (id: string, data: Partial<Omit<Group, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  fetchGroups: (userId: string) => Promise<void>;
  fetchGroupById: (groupId: string) => Promise<void>;
  addMemberToGroup: (groupId: string, userId: string) => Promise<void>;
  removeMemberFromGroup: (groupId: string, userId: string) => Promise<void>;
  setCurrentGroup: (group: Group | null) => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
  
  createGroup: async (name, members, createdBy) => {
    try {
      set({ loading: true, error: null });
      
      const groupData = {
        name,
        members: [createdBy, ...members],
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'groups'), groupData);
      
      const newGroup: Group = {
        id: docRef.id,
        name,
        members: [createdBy, ...members],
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      set(state => ({ 
        groups: [...state.groups, newGroup],
        loading: false 
      }));
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  updateGroup: async (id, data) => {
    try {
      set({ loading: true, error: null });
      
      const groupRef = doc(db, 'groups', id);
      await updateDoc(groupRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      // Update the group in the state
      const { groups } = get();
      const updatedGroups = groups.map(group => 
        group.id === id 
          ? { ...group, ...data, updatedAt: new Date() } 
          : group
      );
      
      set({ 
        groups: updatedGroups,
        currentGroup: get().currentGroup?.id === id 
          ? { ...get().currentGroup, ...data, updatedAt: new Date() } 
          : get().currentGroup,
        loading: false 
      });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  deleteGroup: async (id) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'groups', id));
      
      // Remove the group from the state
      const { groups, currentGroup } = get();
      set({ 
        groups: groups.filter(group => group.id !== id),
        currentGroup: currentGroup?.id === id ? null : currentGroup,
        loading: false 
      });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchGroups: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      const q = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const groupsData: Group[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        groupsData.push({
          id: doc.id,
          name: data.name,
          members: data.members,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });
      
      set({ groups: groupsData, loading: false });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchGroupById: async (groupId) => {
    try {
      set({ loading: true, error: null });
      
      const groupDoc = await getDocs(doc(db, 'groups', groupId));
      
      if (groupDoc.exists()) {
        const data = groupDoc.data();
        const group: Group = {
          id: groupDoc.id,
          name: data.name,
          members: data.members,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        };
        
        set({ currentGroup: group, loading: false });
      } else {
        set({ error: 'Group not found', loading: false });
      }
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  addMemberToGroup: async (groupId, userId) => {
    try {
      set({ loading: true, error: null });
      
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      
      // Update the group in the state
      const { groups, currentGroup } = get();
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            members: [...group.members, userId],
            updatedAt: new Date()
          };
        }
        return group;
      });
      
      set({ 
        groups: updatedGroups,
        currentGroup: currentGroup?.id === groupId 
          ? { 
              ...currentGroup, 
              members: [...currentGroup.members, userId],
              updatedAt: new Date() 
            } 
          : currentGroup,
        loading: false 
      });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  removeMemberFromGroup: async (groupId, userId) => {
    try {
      set({ loading: true, error: null });
      
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      
      // Update the group in the state
      const { groups, currentGroup } = get();
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.filter(id => id !== userId),
            updatedAt: new Date()
          };
        }
        return group;
      });
      
      set({ 
        groups: updatedGroups,
        currentGroup: currentGroup?.id === groupId 
          ? { 
              ...currentGroup, 
              members: currentGroup.members.filter(id => id !== userId),
              updatedAt: new Date() 
            } 
          : currentGroup,
        loading: false 
      });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  setCurrentGroup: (group) => set({ currentGroup: group })
}));