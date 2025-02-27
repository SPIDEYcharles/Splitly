import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGroupStore } from '../store/groupStore';
import { useUserStore } from '../store/userStore';
import GroupList from '../components/groups/GroupList';
import GroupForm from '../components/groups/GroupForm';

const Groups: React.FC = () => {
  const { user } = useAuthStore();
  const { groups, fetchGroups, createGroup } = useGroupStore();
  const { users, fetchUsers } = useUserStore();
  
  const [showGroupForm, setShowGroupForm] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchGroups(user.id);
      fetchUsers();
    }
  }, [user, fetchGroups, fetchUsers]);
  
  const handleCreateGroup = async (name: string, members: string[]) => {
    if (user) {
      await createGroup(name, members, user.id);
      setShowGroupForm(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <div>
      <GroupList
        groups={groups}
        users={users}
        onCreateGroup={() => setShowGroupForm(true)}
      />
      
      {showGroupForm && (
        <GroupForm
          onSubmit={handleCreateGroup}
          onCancel={() => setShowGroupForm(false)}
          users={users}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default Groups;