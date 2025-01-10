import { useEffect } from 'react';
import { useMessagesStore, useUsersStore } from '../../store';
import MessageAvatar from '../MessageAvatar/MessageAvatar';
import MessageInput from '../ChatArea/MessageInput';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  parentMessage: any;
  onClose: () => void;
}

const ThreadFlyout = ({ parentMessage, onClose }: Props) => {
  const { messages } = useMessagesStore();
  const { users } = useUsersStore();

  const threadMessages = [
    parentMessage,
    ...messages.filter((msg) => msg.parent_message_id === parentMessage.id),
  ].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col w-96 border-l border-base-300 bg-base-100 shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between p-4 border-b border-base-300">
        <h2 className="text-lg font-semibold">Thread</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-base-200">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {threadMessages.map((message) => {
            const user = users.find((u) => u.id === message.created_by);

            return (
              <div key={message.id} className="flex items-start gap-2">
                <div className="pt-1">
                  <MessageAvatar user={user} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold">
                      {user?.username || 'Unknown User'}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {formatTimestamp(message.created_at)}
                    </span>
                  </div>
                  <div>{message.content}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-base-300">
        <MessageInput
          conversationId={parentMessage.conversation_id}
          parentMessageId={parentMessage.id}
        />
      </div>
    </div>
  );
};

export default ThreadFlyout;
