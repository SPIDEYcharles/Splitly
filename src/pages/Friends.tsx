import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import FriendList from '../components/friends/FriendList';

const Friends: React.FC = () => {
  const { user } = useAuthStore();
  const { users, fetchUsers } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);
  
  const handleAddFriend = async (email: string) => {
    // In a real app, you would send an invitation to the user
    // For this demo, we'll just show a success message
    setError(null);
    
    // Check if the user exists
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!userExists) {
      setError(`No user found with email ${email}`);
      return;
    }
    
    alert(`Friend request sent to ${email}`);
  };
  
  if (!user) return null;
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <FriendList
        users={users}
        currentUser={user}
        onAddFriend={handleAddFriend}
      />
    </div>
  );
};

export default Friends;