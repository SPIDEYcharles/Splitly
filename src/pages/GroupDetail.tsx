import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGroupStore } from '../store/groupStore';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import { Expense, SortOption } from '../types';
import GroupDetailComponent from '../components/groups/GroupDetail';
import ExpenseForm from '../components/dashboard/ExpenseForm';
import { UserPlus, X } from 'lucide-react';

const GroupDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  const { currentGroup, fetchGroupById, addMemberToGroup, removeMemberFromGroup } = useGroupStore();
  const { expenses, fetchExpenses, addExpense, updateExpense, deleteExpense, sortOption, setSortOption } = useExpenseStore();
  const { users, fetchUsers, searchUsers } = useUserStore();
  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof users>([]);
  
  useEffect(() => {
    if (groupId && user) {
      fetchGroupById(groupId);
      fetchExpenses(user.id, groupId);
      fetchUsers();
    }
  }, [groupId, user, fetchGroupById, fetchExpenses, fetchUsers]);
  
  useEffect(() => {
    const searchForUsers = async () => {
      if (searchTerm.length >= 2) {
        const results = await searchUsers(searchTerm);
        // Filter out users who are already members
        const filteredResults = results.filter(
          (result) => !currentGroup?.members.includes(result.id)
        );
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    };
    
    searchForUsers();
  }, [searchTerm, currentGroup, searchUsers]);
  
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
    // Ensure the expense is associated with this group
    const updatedExpenseData = {
      ...expenseData,
      groupId,
    };
    
    if (editingExpense) {
      await updateExpense(editingExpense.id, updatedExpenseData);
    } else {
      await addExpense(updatedExpenseData);
    }
    
    setShowExpenseForm(false);
    setEditingExpense(null);
  };
  
  const handleAddMember = async (userId: string) => {
    if (groupId) {
      await addMemberToGroup(groupId, userId);
      setSearchTerm('');
      setSearchResults([]);
    }
  };
  
  const handleRemoveMember = async (userId: string) => {
    if (groupId && window.confirm('Are you sure you want to remove this member?')) {
      await removeMemberFromGroup(groupId, userId);
    }
  };
  
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };
  
  if (!user || !currentGroup) return null;
  
  return (
    <div>
      <GroupDetailComponent
        group={currentGroup}
        expenses={expenses}
        users={users}
        currentUser={user}
        onAddExpense={handleAddExpense}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}
        onAddMember={() => setShowAddMemberForm(true)}
        onRemoveMember={handleRemoveMember}
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
          users={users.filter(u => currentGroup.members.includes(u.id))}
          groups={[currentGroup]}
          currentUser={user}
          initialExpense={editingExpense || undefined}
        />
      )}
      
      {showAddMemberForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add Member to Group</h2>
              <button
                onClick={() => setShowAddMemberForm(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search Users
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Search by name or email"
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results</h3>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-gray-500 p-4 text-center">
                      {searchTerm.length < 2
                        ? 'Type at least 2 characters to search'
                        : 'No users found'}
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {searchResults.map((user) => (
                        <li key={user.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                {user.displayName.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {user.displayName}
                                </p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddMember(user.id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Add
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddMemberForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;