import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Expense, SortOption } from '../types';
import { format, subMonths } from 'date-fns';

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  sortOption: SortOption;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  fetchExpenses: (userId: string, groupId?: string) => Promise<void>;
  fetchExpensesForLastMonth: (userId: string) => Promise<void>;
  setSortOption: (option: SortOption) => void;
  clearExpenses: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,
  error: null,
  sortOption: { field: 'date', direction: 'desc' },
  
  addExpense: async (expense) => {
    try {
      set({ loading: true, error: null });
      
      await addDoc(collection(db, 'expenses'), {
        ...expense,
        date: Timestamp.fromDate(expense.date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Refresh expenses
      await get().fetchExpenses(expense.paidBy, expense.groupId);
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  updateExpense: async (id, expenseData) => {
    try {
      set({ loading: true, error: null });
      
      const expenseRef = doc(db, 'expenses', id);
      const updateData: any = {
        ...expenseData,
        updatedAt: serverTimestamp()
      };
      
      // Convert Date objects to Firestore Timestamps
      if (expenseData.date) {
        updateData.date = Timestamp.fromDate(expenseData.date);
      }
      
      await updateDoc(expenseRef, updateData);
      
      // Get the current expenses
      const { expenses } = get();
      
      // Find the expense to update
      const expenseIndex = expenses.findIndex(e => e.id === id);
      if (expenseIndex !== -1) {
        // Create a new array with the updated expense
        const updatedExpenses = [...expenses];
        updatedExpenses[expenseIndex] = {
          ...updatedExpenses[expenseIndex],
          ...expenseData,
          updatedAt: new Date()
        };
        
        set({ expenses: updatedExpenses, loading: false });
      }
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  deleteExpense: async (id) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'expenses', id));
      
      // Remove the expense from the state
      const { expenses } = get();
      set({ 
        expenses: expenses.filter(expense => expense.id !== id),
        loading: false 
      });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchExpenses: async (userId, groupId) => {
    try {
      set({ loading: true, error: null });
      
      let q;
      
      if (groupId) {
        // Fetch expenses for a specific group
        q = query(
          collection(db, 'expenses'),
          where('groupId', '==', groupId),
          orderBy('date', 'desc')
        );
      } else {
        // Fetch all expenses where the user is a participant
        q = query(
          collection(db, 'expenses'),
          where('participants', 'array-contains', { userId }),
          orderBy('date', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const expensesData: Expense[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        expensesData.push({
          id: doc.id,
          title: data.title,
          amount: data.amount,
          paidBy: data.paidBy,
          date: data.date.toDate(),
          groupId: data.groupId,
          participants: data.participants,
          notes: data.notes,
          category: data.category,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });
      
      // Sort expenses based on the current sort option
      const { sortOption } = get();
      const sortedExpenses = sortExpenses(expensesData, sortOption);
      
      set({ expenses: sortedExpenses, loading: false });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchExpensesForLastMonth: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      const oneMonthAgo = subMonths(new Date(), 1);
      
      const q = query(
        collection(db, 'expenses'),
        where('participants', 'array-contains', { userId }),
        where('date', '>=', Timestamp.fromDate(oneMonthAgo)),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const expensesData: Expense[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        expensesData.push({
          id: doc.id,
          title: data.title,
          amount: data.amount,
          paidBy: data.paidBy,
          date: data.date.toDate(),
          groupId: data.groupId,
          participants: data.participants,
          notes: data.notes,
          category: data.category,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });
      
      // Sort expenses based on the current sort option
      const { sortOption } = get();
      const sortedExpenses = sortExpenses(expensesData, sortOption);
      
      set({ expenses: sortedExpenses, loading: false });
      
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  setSortOption: (option) => {
    set({ sortOption: option });
    
    // Re-sort the current expenses
    const { expenses } = get();
    const sortedExpenses = sortExpenses(expenses, option);
    set({ expenses: sortedExpenses });
  },
  
  clearExpenses: () => set({ expenses: [] })
}));

// Helper function to sort expenses
function sortExpenses(expenses: Expense[], sortOption: SortOption): Expense[] {
  return [...expenses].sort((a, b) => {
    if (sortOption.field === 'date') {
      return sortOption.direction === 'asc' 
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime();
    } else if (sortOption.field === 'amount') {
      return sortOption.direction === 'asc'
        ? a.amount - b.amount
        : b.amount - a.amount;
    } else if (sortOption.field === 'title') {
      return sortOption.direction === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    return 0;
  });
}