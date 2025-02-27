import React from 'react';
import { Group, User, Expense } from '../../types';
import { calculateBalances, calculateSimplifiedDebts } from '../../utils/expenseUtils';
import { Users, Plus, UserPlus, Trash2 } from 'lucide-react';
import ExpenseList from '../dashboard/ExpenseList';

interface GroupDetailProps {
  group: Group;
  expenses: Expense[];
  users: User[];
  currentUser: User;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onAddMember: () => void;
  onRemoveMember: (userId: string) => void;
  sortOption: { field: 'date' | 'amount' | 'title'; direction: 'asc' | 'desc' };
  onSortChange: (option: { field: 'date' | 'amount' | 'title'; direction: 'asc' | 'desc' }) => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({
  group,
  expenses,
  users,
  currentUser,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onAddMember,
  onRemoveMember,
  sortOption,
  onSortChange,
}) => {
  const groupMembers = users.filter((user) => group.members.includes(user.id));
  const isAdmin = group.createdBy === currentUser.id;
  
  // Calculate balances for each member
  const memberBalances = groupMembers.map((member) => {
    const memberExpenses = expenses.filter((expense) =>
      expense.participants.some((p) => p.userId === member.id)
    );
    const balance = calculateBalances(memberExpenses, member.id);
    return {
      user: member,
      balance,
    };
  });
  
  // Calculate simplified debts
  const debts = calculateSimplifiedDebts(expenses, groupMembers);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {groupMembers.length} members • Created on{' '}
              {new Date(group.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onAddMember}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add Member
            </button>
            <button
              onClick={onAddExpense}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Expense
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseList
            expenses={expenses}
            currentUser={currentUser}
            users={users}
            onEdit={onEditExpense}
            onDelete={onDeleteExpense}
            sortOption={sortOption}
            onSortChange={onSortChange}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Members</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {groupMembers.map((member) => (
                <li key={member.id} className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {member.id === currentUser.id ? 'You' : member.displayName}
                    </span>
                  </div>
                  {isAdmin && member.id !== currentUser.id && (
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Balances</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {memberBalances.map(({ user, balance }) => (
                <li key={user.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {user.id === currentUser.id ? 'You' : user.displayName}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        balance.netBalance >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {balance.netBalance >= 0 ? '+' : '-'}$
                      {Math.abs(balance.netBalance).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {debts.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Settlements</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {debts.map((debt, index) => (
                  <li key={index} className="p-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {debt.fromUser.id === currentUser.id
                          ? 'You'
                          : debt.fromUser.displayName}
                      </span>{' '}
                      owes{' '}
                      <span className="font-medium text-gray-900">
                        {debt.toUser.id === currentUser.id
                          ? 'you'
                          : debt.toUser.displayName}
                      </span>{' '}
                      <span className="font-medium text-indigo-600">
                        ${debt.amount.toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;