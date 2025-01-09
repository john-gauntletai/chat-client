import { useState } from 'react';
import { useMessagesStore, useConversationsStore } from '../../store';

const MessageInput = ({ conversationId }: { conversationId: string }) => {
  const [content, setContent] = useState('');
  const { create } = useMessagesStore();
  const { currentConversation } = useConversationsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await create(conversationId, content);
      setContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="p-4 border-t border-base-300">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message #${currentConversation?.name}`}
          className="flex-1 input input-bordered"
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
