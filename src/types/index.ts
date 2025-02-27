export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin?: boolean;
  createdAt: Date;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // userId of the person who paid
  date: Date;
  groupId?: string; // optional if expense is not part of a group
  participants: {
    userId: string;
    amount: number;
  }[];
  notes?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  members: string[]; // array of userIds
  createdBy: string; // userId of the creator
  createdAt: Date;
  updatedAt: Date;
}

export interface Settlement {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: Date;
  groupId?: string;
  status: 'pending' | 'completed';
}

export interface ExpenseSummary {
  totalSpent: number;
  totalOwed: number;
  totalOwedToYou: number;
  netBalance: number;
}

export interface SortOption {
  field: 'date' | 'amount' | 'title';
  direction: 'asc' | 'desc';
}