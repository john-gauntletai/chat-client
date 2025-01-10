import { useEffect, useRef, useState } from 'react';
import {
  useMessagesStore,
  useUsersStore,
  useSessionStore,
  useConversationsStore,
} from '../../store';
import data from '@emoji-mart/data';
import UserAvatar from '../UserAvatar/UserAvatar';
import MessageView from '../MessageView/MessageView';

interface Props {
  conversationId: string;
  onThreadSelect: (message: Message | null) => void;
  activeThread: Message | null;
}

const MessageList = ({
  conversationId,
  onThreadSelect,
  activeThread,
}: Props) => {
  const { messages, addReaction, fetchConversationMessages } =
    useMessagesStore();
  const { users } = useUsersStore();
  const { currentConversation } = useConversationsStore();
  const { session } = useSessionStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const creator = users.find((u) => u.id === currentConversation?.created_by);
  const otherUser =
    currentConversation && session && !currentConversation.is_channel
      ? users.find((u) =>
          currentConversation.conversation_members.some(
            (m) => m.user_id === u.id && m.user_id !== session.id
          )
        )
      : null;

  useEffect(() => {
    const loadMessages = async () => {
      try {
        await fetchConversationMessages(conversationId);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    loadMessages();
  }, [conversationId, fetchConversationMessages]);

  const conversationMessages = messages
    .filter(
      (msg) => msg.conversation_id === conversationId && !msg.parent_message_id
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
        setActiveMessage(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col-reverse flex-1 p-4 overflow-y-auto">
      <div ref={messagesEndRef} />

      <MessageView
        messages={conversationMessages}
        onReaction={handleEmojiClick}
        onThreadSelect={onThreadSelect}
        activeMessage={activeMessage}
        showEmojiPicker={showEmojiPicker}
        emojiPickerPosition={emojiPickerPosition}
        onEmojiPickerOpen={handleEmojiPickerOpen}
        onMessageHover={setActiveMessage}
        emojiPickerRef={emojiPickerRef}
      />

      {currentConversation?.is_channel ? (
        <div className="mt-16 mb-8">
          <h1 className="mb-2 text-4xl font-bold">
            # {currentConversation.name}
          </h1>
          <p className="text-base-content/60">
            {creator?.username || 'Unknown User'} created this channel on{' '}
            {new Date(currentConversation.created_at).toLocaleDateString(
              'en-US',
              { month: 'long', day: 'numeric', year: 'numeric' }
            )}
            . This is the beginning of the conversation.
          </p>
        </div>
      ) : (
        <div className="mt-16 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <UserAvatar user={otherUser} size="large" />
            <h1 className="text-4xl font-bold">{otherUser?.username}</h1>
          </div>
          <p className="text-base-content/60">
            This conversation is just between you and {otherUser?.username}.
            This is the beginning of your direct message history.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
