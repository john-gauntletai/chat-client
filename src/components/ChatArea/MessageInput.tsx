import { useState } from 'react';
import {
  useMessagesStore,
  useConversationsStore,
  useUsersStore,
  useSessionStore,
} from '../../store';

interface Props {
  conversationId: string;
  parentMessageId?: string;
}

const MessageInput = ({ conversationId, parentMessageId }: Props) => {
  const { create } = useMessagesStore();
  const { currentConversation } = useConversationsStore();
  const { users } = useUsersStore();
  const { session } = useSessionStore();
  const [content, setContent] = useState('');

  const getPlaceholder = () => {
    if (!currentConversation || !session) return 'Type a message...';

    if (currentConversation.is_channel) {
      return `Message #${currentConversation.name}`;
    }

    const otherUser = users.find((u) =>
      currentConversation.conversation_members.some(
        (m) => m.user_id === u.id && m.user_id !== session.id
      )
    );

    return `Message ${otherUser?.username}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const message = await create(conversationId, content, parentMessageId);
      setContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-base-300">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={getPlaceholder()}
        className="w-full input input-bordered"
      />
    </form>
  );
};

export default MessageInput;
