import { useEffect, useRef, useState } from 'react';
import {
  useMessagesStore,
  useUsersStore,
  useSessionStore,
  useConversationsStore,
} from '../../store';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
  FaceSmileIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import TooltipPortal from '../TooltipPortal/TooltipPortal';
import MessageAvatar from '../MessageAvatar/MessageAvatar';
import UserAvatar from '../UserAvatar/UserAvatar';

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

  // Fetch messages when conversation changes
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
    .filter((msg) => msg.conversation_id === conversationId)
    .sort(
      (a, b) =>
        // Sort by creation time, oldest first
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year:
          date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const messagesByDate = conversationMessages.reduce((acc, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, typeof conversationMessages>);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Initial scroll to bottom without animation
  useEffect(() => {
    scrollToBottom(false);
  }, [conversationId]);

  // Scroll to bottom only when a new message is added
  useEffect(() => {
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    // Only scroll if the last message was created by the current user
    // or if it was created in the last second (new message)
    if (
      lastMessage &&
      (lastMessage.created_by === session?.user?.id ||
        Date.now() - new Date(lastMessage.created_at).getTime() < 1000)
    ) {
      scrollToBottom(true);
    }
  }, [conversationMessages, session?.user?.id]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleEmojiClick = async (emoji: any, messageId: string) => {
    try {
      await addReaction(messageId, emoji.native);
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
    <div className="flex flex-col-reverse flex-1 p-4 overflow-y-auto">
      <div ref={messagesEndRef} />

      {Object.entries(messagesByDate).map(([date, messages]) => (
        <div key={date}>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-base-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-sm bg-base-100 text-base-content/60">
                {formatDate(new Date(date))}
              </span>
            </div>
          </div>

          {messages
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((message) => {
              const user = users.find((u) => u.id === message.created_by);
              const initials = user?.username.slice(0, 2).toUpperCase() || 'UN';

              return (
                <div
                  key={message.id}
                  className={`relative px-4 py-2 -mx-4 group hover:bg-base-200/50 ${
                    showEmojiPicker && activeMessage !== message.id
                      ? 'pointer-events-none'
                      : ''
                  }`}
                  onMouseLeave={() => {
                    if (!showEmojiPicker) setActiveMessage(null);
                  }}
                >
                  <div className="flex items-start gap-2">
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
                      <div className="relative">
                        <div>{message.content}</div>
                        {message.reactions?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {message.reactions.map((reaction, index) => {
                              const reactedUsers = reaction.users
                                .map(
                                  (id) =>
                                    users.find((u) => u.id === id)?.username
                                )
                                .filter(Boolean) as string[];

                              let tooltipText = '';
                              if (reactedUsers.length <= 3) {
                                if (reactedUsers.length === 2) {
                                  tooltipText = `**${reactedUsers[0]}** and **${reactedUsers[1]}** reacted with ${reaction.emoji}`;
                                } else {
                                  tooltipText = `**${reactedUsers.join(
                                    '**, **'
                                  )}** reacted with ${reaction.emoji}`;
                                }
                              } else {
                                tooltipText = `**${reactedUsers
                                  .slice(0, 2)
                                  .join('**, **')}**, and ${
                                  reactedUsers.length - 2
                                } others reacted with ${reaction.emoji}`;
                              }

                              return (
                                <TooltipPortal
                                  key={index}
                                  text={tooltipText}
                                  previewEmoji={reaction.emoji}
                                  maxWidth={200}
                                  className="flex items-center gap-1 bg-base-300/70 rounded-full px-2 py-0.5 text-sm hover:border-base-content/20 border border-transparent cursor-pointer"
                                >
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEmojiClick(
                                        { native: reaction.emoji },
                                        message.id
                                      );
                                    }}
                                    className="flex items-center gap-1.5"
                                  >
                                    <span className="text-base">
                                      {reaction.emoji}
                                    </span>
                                    <span className="text-xs">
                                      {reaction.users.length}
                                    </span>
                                  </div>
                                </TooltipPortal>
                              );
                            })}
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
                      {['👍', '🎉', '😂'].map((emoji) => (
                        <TooltipPortal
                          key={emoji}
                          text={`React with ${emoji}`}
                          className="flex items-center p-1.5 rounded hover:bg-base-200"
                        >
                          <button
                            onClick={() => {
                              handleEmojiClick({ native: emoji }, message.id);
                              setActiveMessage(message.id);
                            }}
                          >
                            <span className="text-base">{emoji}</span>
                          </button>
                        </TooltipPortal>
                      ))}
                      <TooltipPortal
                        text="See more emojis"
                        className="flex items-center gap-1 p-1.5 rounded hover:bg-base-200"
                      >
                        <button
                          onClick={(event) => {
                            const rect =
                              event.currentTarget.getBoundingClientRect();
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
                          className="flex items-center gap-1"
                        >
                          <FaceSmileIcon className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">React</span>
                        </button>
                      </TooltipPortal>
                      <TooltipPortal
                        text="Reply in thread"
                        className="flex items-center gap-1 p-1.5 rounded hover:bg-base-200"
                      >
                        <button
                          className="flex items-center gap-1"
                          onClick={() => onThreadSelect(message)}
                        >
                          <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Reply</span>
                        </button>
                      </TooltipPortal>
                      <TooltipPortal
                        text="More actions"
                        className="p-1.5 rounded hover:bg-base-200"
                        arrowPosition="bottom-right"
                      >
                        <button className="flex items-center">
                          <EllipsisHorizontalIcon className="w-3.5 h-3.5" />
                        </button>
                      </TooltipPortal>
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
                          onEmojiSelect={(emoji) =>
                            handleEmojiClick(emoji, message.id)
                          }
                          previewPosition="bottom"
                          skinTonePosition="preview"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ))}

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
