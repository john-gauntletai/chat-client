import { useState, useRef } from 'react';
import { useMessagesStore, useUsersStore } from '../../store';
import MessageInput from '../ChatArea/MessageInput';
import { XMarkIcon } from '@heroicons/react/24/outline';
import MessageView from '../MessageView/MessageView';

interface Props {
  parentMessage: Message;
  onClose: () => void;
}

const ThreadFlyout = ({ parentMessage, onClose }: Props) => {
  const { messages, addReaction } = useMessagesStore();
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const threadMessages = [
    parentMessage,
    ...messages.filter((msg) => msg.parent_message_id === parentMessage.id),
  ].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const handleEmojiClick = async (emoji: any, messageId: string) => {
    try {
      await addReaction(messageId, emoji.native);
      setShowEmojiPicker(false);
      setActiveMessage(null);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleEmojiPickerOpen = (
    event: React.MouseEvent,
    messageId: string
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pickerWidth = 352;
    const pickerHeight = 435;

    const left = Math.min(
      rect.left + window.scrollX,
      viewportWidth - pickerWidth - 10
    );
    const top = rect.bottom + window.scrollY + 5;

    const finalTop =
      top + pickerHeight > viewportHeight
        ? rect.top + window.scrollY - pickerHeight - 5
        : top;

    setEmojiPickerPosition({
      top: finalTop,
      left: Math.max(10, left),
    });
    setActiveMessage(messageId);
    setShowEmojiPicker(true);
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
        <div className="p-4">
          <MessageView
            messages={threadMessages}
            showThread={false}
            showDateSeparators={false}
            onReaction={handleEmojiClick}
            activeMessage={activeMessage}
            showEmojiPicker={showEmojiPicker}
            emojiPickerPosition={emojiPickerPosition}
            onEmojiPickerOpen={handleEmojiPickerOpen}
            onMessageHover={setActiveMessage}
            emojiPickerRef={emojiPickerRef}
          />
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
