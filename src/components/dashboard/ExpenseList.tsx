import React from 'react';
import { format } from 'date-fns';
import { Expense, SortOption, User } from '../../types';
import { Edit, Trash2, DollarSign } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  currentUser: User;
  users: User[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  currentUser,
  users,
  onEdit,
  onDelete,
  sortOption,
  onSortChange,
}) => {
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.displayName : 'Unknown User';
  };

  const handleSortChange = (field: 'date' | 'amount' | 'title') => {
    if (sortOption.field === field) {
      // Toggle direction if same field
      onSortChange({
        field,
        direction: sortOption.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // Default to descending for new field
      onSortChange({ field, direction: 'desc' });
    }
  };

  const getSortIcon = (field: 'date' | 'amount' | 'title') => {
    if (sortOption.field !== field) return null;
    return sortOption.direction === 'asc' ? '↑' : '↓';
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No expenses yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Add your first expense to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
        <div className="flex space-x-4 text-sm">
          <button
            onClick={() => handleSortChange('date')}
            className={`flex items-center ${
              sortOption.field === 'date' ? 'text-indigo-600 font-medium' : 'text-gray-500'
            }`}
          >
            Date {getSortIcon('date')}
          </button>
          <button
            onClick={() => handleSortChange('amount')}
            className={`flex items-center ${
              sortOption.field === 'amount' ? 'text-indigo-600 font-medium' : 'text-gray-500'
            }`}
          >
            Amount {getSortIcon('amount')}
          </button>
          <button
            onClick={() => handleSortChange('title')}
            className={`flex items-center ${
              sortOption.field === 'title' ? 'text-indigo-600 font-medium' : 'text-gray-500'
            }`}
          >
            Description {getSortIcon('title')}
          </button>
        </div>
      </div>
      <ul className="divide-y divide-gray-200">
        {expenses.map((expense) => {
          const isPayer = expense.paidBy === currentUser.id;
          const userParticipation = expense.participants.find(
            (p) => p.userId === currentUser.id
          );
          const userAmount = userParticipation ? userParticipation.amount : 0;

          return (
            <li key={expense.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{expense.title}</span>
                    {expense.category && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                        {expense.category}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span>
                      {format(expense.date, 'MMM d, yyyy')} • Paid by{' '}
                      <span className={isPayer ? 'font-medium text-indigo-600' : ''}>
                        {isPayer ? 'you' : getUserName(expense.paidBy)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <div className="font-medium text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </div>
                    {!isPayer && (
                      <div className="text-sm text-red-600">
                        You owe ${userAmount.toFixed(2)}
                      </div>
                    )}
                    {isPayer && expense.amount > userAmount && (
                      <div className="text-sm text-green-600">
                        You get back ${(expense.amount - userAmount).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-1 rounded-full text-gray-400 hover:text-indigo-600 focus:outline-none"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-1 rounded-full text-gray-400 hover:text-red-600 focus:outline-none"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ExpenseList;