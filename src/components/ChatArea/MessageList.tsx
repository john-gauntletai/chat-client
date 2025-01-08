import { useEffect, useRef, useState } from 'react';
import { useMessagesStore, useUsersStore, useSessionStore } from '../../store';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
  FaceSmileIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

const MessageList = ({ channelId }: { channelId: string }) => {
  const { messages, addReaction } = useMessagesStore();
  const { users } = useUsersStore();
  const { session } = useSessionStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const channelMessages = messages
    .filter((msg) => msg.channel_id === channelId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Initial scroll to bottom without animation
  useEffect(() => {
    scrollToBottom(false);
  }, [channelId]);

  // Scroll to bottom only when a new message is added
  useEffect(() => {
    const lastMessage = channelMessages[channelMessages.length - 1];
    // Only scroll if the last message was created by the current user
    // or if it was created in the last second (new message)
    if (
      lastMessage &&
      (lastMessage.created_by === session?.user?.id ||
        Date.now() - new Date(lastMessage.created_at).getTime() < 1000)
    ) {
      scrollToBottom(true);
    }
  }, [channelMessages, session?.user?.id]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleEmojiClick = async (emoji: any) => {
    if (!activeMessage) return;

    try {
      await addReaction(activeMessage, emoji.native);
      setShowEmojiPicker(false);
      setActiveMessage(null);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  // Add click outside handler
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
    <div className="flex-1 p-4 overflow-y-auto">
      {channelMessages.map((message) => {
        const user = users.find((u) => u.id === message.created_by);
        const initials = user?.username.slice(0, 2).toUpperCase() || 'UN';

        return (
          <div
            key={message.id}
            className={`relative p-2 mb-4 rounded-lg group hover:bg-base-200 ${
              showEmojiPicker && activeMessage !== message.id
                ? 'pointer-events-none'
                : ''
            }`}
            onMouseLeave={() => {
              if (!showEmojiPicker) setActiveMessage(null);
            }}
          >
            <div className="flex items-start gap-2">
              <div className="avatar">
                {user?.imageUrl ? (
                  <div className="w-8 rounded-full">
                    <img src={user.imageUrl} alt={user.username} />
                  </div>
                ) : (
                  <div className="w-8 rounded-full bg-neutral text-neutral-content">
                    <span className="text-xs">{initials}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">
                    {user?.username || 'Unknown User'}
                  </span>
                  <span className="text-xs text-base-content/60">
                    {formatTimestamp(message.created_at)}
                  </span>
                </div>
                <div className="relative">
                  <div>{message.content}</div>
                  {message.reactions?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {message.reactions.map((reaction, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-base-200 rounded-full px-2 py-0.5 text-sm"
                          title={reaction.users
                            .map(
                              (id) => users.find((u) => u.id === id)?.username
                            )
                            .filter(Boolean)
                            .join(', ')}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-xs">
                            {reaction.users.length}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              className={`absolute -top-9 right-2 transition-opacity duration-200 ${
                activeMessage === message.id
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-0.5 bg-base-100 rounded-lg shadow-lg border border-base-300 p-[2px]">
                {['✅', '🙌', '😂'].map((emoji) => (
                  <button
                    key={emoji}
                    className="tooltip tooltip-top before:text-xs before:content-[attr(data-tip)] before:!duration-100 flex items-center p-1.5 rounded hover:bg-base-200"
                    data-tip={`React with ${emoji}`}
                    onClick={() => {
                      handleEmojiClick({ native: emoji });
                      setActiveMessage(message.id);
                    }}
                  >
                    <span className="text-xs font-medium">{emoji}</span>
                  </button>
                ))}
                <button
                  className="tooltip tooltip-top before:text-xs before:content-[attr(data-tip)] before:!duration-100 flex items-center gap-1 p-1.5 rounded hover:bg-base-200"
                  data-tip="Choose from all emojis"
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const pickerWidth = 352; // Default width of emoji-mart picker
                    const pickerHeight = 435; // Default height of emoji-mart picker

                    // Calculate position ensuring picker stays in viewport
                    const left = Math.min(
                      rect.left + window.scrollX,
                      viewportWidth - pickerWidth - 10
                    );
                    const top = rect.bottom + window.scrollY + 5;

                    // If it would go below viewport, show it above the button instead
                    const finalTop =
                      top + pickerHeight > viewportHeight
                        ? rect.top + window.scrollY - pickerHeight - 5
                        : top;

                    setEmojiPickerPosition({
                      top: finalTop,
                      left: Math.max(10, left), // Ensure it's not pushed off the left edge
                    });
                    setActiveMessage(message.id);
                    setShowEmojiPicker(true);
                  }}
                >
                  <FaceSmileIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">React</span>
                </button>
                <button
                  className="tooltip tooltip-top before:text-xs before:content-[attr(data-tip)] before:!duration-100 flex items-center gap-1 p-1.5 hover:bg-base-200"
                  data-tip="Reply to this message"
                >
                  <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Reply</span>
                </button>
                <button
                  className="tooltip tooltip-top before:text-xs before:content-[attr(data-tip)] before:!duration-100 flex items-center gap-1 p-1.5 rounded hover:bg-base-200"
                  data-tip="More actions"
                >
                  <EllipsisHorizontalIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {showEmojiPicker && activeMessage === message.id && (
              <div
                className="fixed z-10"
                style={{
                  top: `${emojiPickerPosition.top}px`,
                  left: `${emojiPickerPosition.left}px`,
                }}
                ref={emojiPickerRef}
              >
                <div className="relative overflow-hidden border-2 rounded-lg border-base-300">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiClick}
                    previewPosition="bottom"
                    skinTonePosition="preview"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
