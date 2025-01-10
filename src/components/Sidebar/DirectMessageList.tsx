import { useState } from 'react';
import {
  useSessionStore,
  useUsersStore,
  useConversationsStore,
} from '../../store';
import UserAvatar from '../UserAvatar/UserAvatar';

const DirectMessageList = () => {
  const { users } = useUsersStore();
  const { session } = useSessionStore();
  const { conversations, currentConversation, setCurrentConversation, create } =
    useConversationsStore();

  const handleUserClick = async (userId: string) => {
    // Find existing DM conversation
    const existingConversation = conversations.find(
      (conv) =>
        !conv.is_channel &&
        conv.conversation_members.length === 2 &&
        conv.conversation_members.some((m) => m.user_id === session?.id) &&
        conv.conversation_members.some((m) => m.user_id === userId)
    );

    if (existingConversation) {
      setCurrentConversation(existingConversation);
      return;
    }

    // Create new DM conversation
    try {
      const clickedUser = users.find((u) => u.id === userId);
      if (!clickedUser) return;

      const newConversation = await create('', false, false, [userId]);
      setCurrentConversation(newConversation);
    } catch (error) {
      console.error('Failed to create DM conversation:', error);
    }
  };

  const isCurrentDMWithUser = (userId: string) => {
    if (!currentConversation || !session) return false;
    return (
      !currentConversation.is_channel &&
      currentConversation.conversation_members.length === 2 &&
      currentConversation.conversation_members.some(
        (m) => m.user_id === session.id
      ) &&
      currentConversation.conversation_members.some((m) => m.user_id === userId)
    );
  };

  return (
    <div className="p-4">
      <h2 className="mb-2 text-sm font-semibold">Direct Messages</h2>
      <ul className="menu menu-sm">
        {users
          .filter((user) => user.id !== session?.id)
          .map((user) => (
            <li key={user.id}>
              <a
                className={`flex items-center gap-2 ${
                  isCurrentDMWithUser(user.id) ? 'active' : ''
                }`}
                onClick={() => handleUserClick(user.id)}
              >
                <UserAvatar user={user} size="small" />
                {user.username}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default DirectMessageList;
