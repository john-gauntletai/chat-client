import { useState } from 'react';
import {
  useMessagesStore,
  useConversationsStore,
  useUsersStore,
  useSessionStore,
} from '../../store';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Props {
  conversationId: string;
  parentMessageId?: string;
  isThread?: boolean;
}

const MessageInput = ({
  conversationId,
  parentMessageId,
  isThread = false,
}: Props) => {
  const { create } = useMessagesStore();
  const { currentConversation } = useConversationsStore();
  const { users } = useUsersStore();
  const { session } = useSessionStore();
  const [content, setContent] = useState('');

  const getPlaceholder = () => {
    if (isThread) {
      return 'Reply...';
    }

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
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-4 border-t border-base-300"
    >
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={getPlaceholder()}
        className="flex-1 input input-bordered"
      />
      <button
        type="submit"
        disabled={!content.trim()}
        className="h-12 px-4 transition-colors duration-200 rounded-md bg-primary/10 hover:bg-primary/20 disabled:bg-base-200 disabled:hover:bg-base-200"
      >
        <PaperAirplaneIcon
          className="w-5 h-5 transition-colors duration-200 text-primary disabled:text-base-content/30"
          style={{ transform: 'rotate(-45deg)' }}
        />
      </button>
    </form>
  );
};

export default MessageInput;
