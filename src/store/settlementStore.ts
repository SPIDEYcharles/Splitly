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
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Settlement } from '../types';

interface SettlementState {
  settlements: Settlement[];
  loading: boolean;
  error: string | null;
  addSettlement: (settlement: Omit<Settlement, 'id' | 'status'>) => Promise<void>;
  updateSettlementStatus: (id: string, status: 'pending' | 'completed') => Promise<void>;
  deleteSettlement: (id: string) => Promise<void>;
  fetchSettlements: (userId: string) => Promise<void>;
  fetchSettlementsForGroup: (groupId: string) => Promise<void>;
  clearSettlements: () => void;
}

export const useSettlementStore = create<SettlementState>((set, get) => ({
  settlements: [],
  loading: false,
  error: null,
  
  addSettlement: async (settlement) => {
    try {
      set({ loading: true, error: null });
      
      const settlementData = {
        ...settlement,
        date: Timestamp.fromDate(settlement.date),
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'settlements'), settlementData);
      
      const newSettlement: Settlement = {
        id: docRef.id,
        fromUserId: settlement.fromUserId,
        toUserId: settlement.toUserId,
        amount: settlement.amount,
        date: settlement.date,
        groupId: settlement.groupId,
        status: 'pending'
      };
      
      set(state => ({ 
        settlements: [...state.settlements, newSettlement],
        loading: false 
      }));
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  updateSettlementStatus: async (id, status) => {
    try {
      set({ loading: true, error: null });
      
      const settlementRef = doc(db, 'settlements', id);
      await updateDoc(settlementRef, {
        status,
        updatedAt: serverTimestamp()
      });
      
      // Update the settlement in the state
      const { settlements } = get();
      const updatedSettlements = settlements.map(settlement => 
        settlement.id === id 
          ? { ...settlement, status } 
          : settlement
      );
      
      set({ settlements: updatedSettlements, loading: false });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  deleteSettlement: async (id) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'settlements', id));
      
      // Remove the settlement from the state
      const { settlements } = get();
      set({ 
        settlements: settlements.filter(settlement => settlement.id !== id),
        loading: false 
      });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchSettlements: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      // Fetch settlements where the user is either the sender or receiver
      const q1 = query(
        collection(db, 'settlements'),
        where('fromUserId', '==', userId)
      );
      
      const q2 = query(
        collection(db, 'settlements'),
        where('toUserId', '==', userId)
      );
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);
      
      const settlementsData: Settlement[] = [];
      
      // Process settlements where user is the sender
      snapshot1.forEach((doc) => {
        const data = doc.data();
        settlementsData.push({
          id: doc.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          amount: data.amount,
          date: data.date.toDate(),
          groupId: data.groupId,
          status: data.status
        });
      });
      
      // Process settlements where user is the receiver
      snapshot2.forEach((doc) => {
        const data = doc.data();
        settlementsData.push({
          id: doc.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          amount: data.amount,
          date: data.date.toDate(),
          groupId: data.groupId,
          status: data.status
        });
      });
      
      set({ settlements: settlementsData, loading: false });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchSettlementsForGroup: async (groupId) => {
    try {
      set({ loading: true, error: null });
      
      const q = query(
        collection(db, 'settlements'),
        where('groupId', '==', groupId)
      );
      
      const querySnapshot = await getDocs(q);
      const settlementsData: Settlement[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        settlementsData.push({
          id: doc.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          amount: data.amount,
          date: data.date.toDate(),
          groupId: data.groupId,
          status: data.status
        });
      });
      
      set({ settlements: settlementsData, loading: false });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  clearSettlements: () => set({ settlements: [] })
}));