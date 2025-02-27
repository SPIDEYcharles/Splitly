import React, { useState } from 'react';
import { User } from '../../types';
import { UserPlus, Search, X } from 'lucide-react';

interface FriendListProps {
  users: User[];
  currentUser: User;
  onAddFriend: (email: string) => void;
}

const FriendList: React.FC<FriendListProps> = ({ users, currentUser, onAddFriend }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [email, setEmail] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUser.id &&
      (user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onAddFriend(email);
      setEmail('');
      setShowAddFriend(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Friends</h2>
        <button
          onClick={() => setShowAddFriend(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search friends..."
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No friends found matching "{searchTerm}"</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAddFriend && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add Friend</h2>
              <button
                onClick={() => setShowAddFriend(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddFriend} className="p-6 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Friend's Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter email address"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter your friend's email address to add them to your friends list.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddFriend(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendList;