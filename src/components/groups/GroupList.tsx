import React from 'react';
import { Link } from 'react-router-dom';
import { Group, User } from '../../types';
import { Users, Plus } from 'lucide-react';

interface GroupListProps {
  groups: Group[];
  users: User[];
  onCreateGroup: () => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, users, onCreateGroup }) => {
  const getUserNames = (userIds: string[]) => {
    return userIds
      .map(id => {
        const user = users.find(u => u.id === id);
        return user ? user.displayName : 'Unknown User';
      })
      .join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Groups</h2>
        <button
          onClick={onCreateGroup}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No groups yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create a group to start splitting expenses with friends.
          </p>
          <button
            onClick={onCreateGroup}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`/group/${group.id}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                  <div className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {group.members.length} members
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  Members: {getUserNames(group.members)}
                </p>
                <div className="mt-4 flex justify-end">
                  <span className="text-sm text-indigo-600 font-medium">View details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupList;