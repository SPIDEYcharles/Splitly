import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useExpenseStore } from '../store/expenseStore';
import { useGroupStore } from '../store/groupStore';
import { useUserStore } from '../store/userStore';
import { calculateBalances } from '../utils/expenseUtils';
import { Expense, SortOption } from '../types';
import { Plus } from 'lucide-react';

import BalanceSummary from '../components/dashboard/BalanceSummary';
import ExpenseList from '../components/dashboard/ExpenseList';
import ExpenseForm from '../components/dashboard/ExpenseForm';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { expenses, fetchExpenses, addExpense, updateExpense, deleteExpense, sortOption, setSortOption } = useExpenseStore();
  const { groups, fetchGroups } = useGroupStore();
  const { users, fetchUsers } = useUserStore();
  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchExpenses(user.id);
      fetchGroups(user.id);
      fetchUsers();
    }
  }, [user, fetchExpenses, fetchGroups, fetchUsers]);
  
  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };
  
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };
  
  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expenseId);
    }
  };
  
  const handleExpenseSubmit = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseData);
    } else {
      await addExpense(expenseData);
    }
    setShowExpenseForm(false);
    setEditingExpense(null);
  };
  
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };
  
  if (!user) return null;
  
  const summary = calculateBalances(expenses, user.id);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleAddExpense}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </button>
      </div>
      
      <BalanceSummary summary={summary} />
      
      <ExpenseList
        expenses={expenses}
        currentUser={user}
        users={users}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        sortOption={sortOption}
        onSortChange={handleSortChange}
      />
      
      {showExpenseForm && (
        <ExpenseForm
          onSubmit={handleExpenseSubmit}
          onCancel={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          users={users}
          groups={groups}
          currentUser={user}
          initialExpense={editingExpense || undefined}
        />
      )}
    </div>
  );
};

export default Dashboard;