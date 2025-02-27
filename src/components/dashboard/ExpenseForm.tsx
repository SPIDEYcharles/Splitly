import React, { useState, useEffect } from 'react';
import { Expense, User, Group } from '../../types';
import { splitEqually, splitByCustomAmount } from '../../utils/expenseUtils';
import { X } from 'lucide-react';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  users: User[];
  groups: Group[];
  currentUser: User;
  initialExpense?: Expense;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  onCancel,
  users,
  groups,
  currentUser,
  initialExpense,
}) => {
  const [title, setTitle] = useState(initialExpense?.title || '');
  const [amount, setAmount] = useState(initialExpense?.amount.toString() || '');
  const [paidBy, setPaidBy] = useState(initialExpense?.paidBy || currentUser.id);
  const [date, setDate] = useState(
    initialExpense?.date
      ? new Date(initialExpense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [groupId, setGroupId] = useState(initialExpense?.groupId || '');
  const [notes, setNotes] = useState(initialExpense?.notes || '');
  const [category, setCategory] = useState(initialExpense?.category || '');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>(
    initialExpense?.participants.every(
      (p) => p.amount === initialExpense.participants[0]?.amount
    )
      ? 'equal'
      : 'custom'
  );
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    initialExpense
      ? initialExpense.participants.map((p) => p.userId)
      : [currentUser.id]
  );
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: string }>(
    initialExpense
      ? Object.fromEntries(
          initialExpense.participants.map((p) => [p.userId, p.amount.toString()])
        )
      : {}
  );

  // Update participants when group changes
  useEffect(() => {
    if (groupId) {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        setSelectedParticipants(group.members);
      }
    }
  }, [groupId, groups]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount || !paidBy || !date) {
      return;
    }

    let participants;
    if (splitType === 'equal') {
      participants = splitEqually(parseFloat(amount), selectedParticipants);
    } else {
      // Convert custom amounts to percentages
      const totalCustomAmount = Object.values(customAmounts).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
      );
      
      participants = Object.entries(customAmounts).map(([userId, amountStr]) => ({
        userId,
        amount: parseFloat(amountStr) || 0,
      }));
    }

    const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      amount: parseFloat(amount),
      paidBy,
      date: new Date(date),
      groupId: groupId || undefined,
      notes: notes || undefined,
      category: category || undefined,
      participants,
    };

    onSubmit(expenseData);
  };

  const handleParticipantToggle = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter((id) => id !== userId));
      
      // Remove from custom amounts if present
      const newCustomAmounts = { ...customAmounts };
      delete newCustomAmounts[userId];
      setCustomAmounts(newCustomAmounts);
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
      
      // Add to custom amounts with default value if custom split
      if (splitType === 'custom') {
        setCustomAmounts({
          ...customAmounts,
          [userId]: '0',
        });
      }
    }
  };

  const handleCustomAmountChange = (userId: string, value: string) => {
    setCustomAmounts({
      ...customAmounts,
      [userId]: value,
    });
  };

  const categories = [
    'Food & Drink',
    'Groceries',
    'Housing',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Travel',
    'Other',
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="What was this expense for?"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700">
                Paid by
              </label>
              <select
                id="paidBy"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value={currentUser.id}>You</option>
                {users
                  .filter((user) => user.id !== currentUser.id)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-700">
                Group (optional)
              </label>
              <select
                id="group"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">No group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category (optional)
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Add any additional details..."
            />
          </div>

          <div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Split type</legend>
              <div className="mt-2 space-y-4">
                <div className="flex items-center">
                  <input
                    id="split-equal"
                    name="split-type"
                    type="radio"
                    checked={splitType === 'equal'}
                    onChange={() => setSplitType('equal')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label
                    htmlFor="split-equal"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Split equally
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="split-custom"
                    name="split-type"
                    type="radio"
                    checked={splitType === 'custom'}
                    onChange={() => setSplitType('custom')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label
                    htmlFor="split-custom"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Split by custom amounts
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split with
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={selectedParticipants.includes(user.id)}
                      onChange={() => handleParticipantToggle(user.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`user-${user.id}`}
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      {user.id === currentUser.id ? 'You' : user.displayName}
                    </label>
                  </div>
                  {splitType === 'custom' && selectedParticipants.includes(user.id) && (
                    <div className="relative rounded-md shadow-sm w-24">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={customAmounts[user.id] || '0'}
                        onChange={(e) =>
                          handleCustomAmountChange(user.id, e.target.value)
                        }
                        className="block w-full pl-7 pr-2 py-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {initialExpense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;