import { useUsersStore, useSessionStore } from '../../store';
import MessageAvatar from '../MessageAvatar/MessageAvatar';
import {
  FaceSmileIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import TooltipPortal from '../TooltipPortal/TooltipPortal';
import { Message as MessageType } from '../../types';

interface Props {
  message: MessageType;
  showThread?: boolean;
  showDate?: boolean;
  onReaction: (emoji: any, messageId: string) => void;
  onThreadSelect?: (message: MessageType) => void;
  isActive: boolean;
  showEmojiPicker: boolean;
  onEmojiPickerOpen: (event: React.MouseEvent, messageId: string) => void;
  onMouseLeave: () => void;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  emojiPickerPosition?: { top: number; left: number };
}

const Message = ({
  message,
  showThread = true,
  showDate = false,
  onReaction,
  onThreadSelect,
  isActive,
  showEmojiPicker,
  onEmojiPickerOpen,
  onMouseLeave,
  emojiPickerRef,
  emojiPickerPosition,
}: Props) => {
  const { users } = useUsersStore();
  const { session } = useSessionStore();
  const user = users.find((u) => u.id === message.created_by);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year:
          date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <div
      className={`relative px-4 py-2 -mx-4 group hover:bg-base-200/50 ${
        showEmojiPicker && !isActive ? 'pointer-events-none' : ''
      }`}
      onMouseLeave={onMouseLeave}
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
              {showDate
                ? `${getMessageDate(message.created_at)} at ${formatTimestamp(
                    message.created_at
                  )}`
                : formatTimestamp(message.created_at)}
            </span>
          </div>
          <div className="relative">
            <div>{message.content}</div>
            {message.reactions?.length > 0 && (
              <div className="flex gap-1 mt-1">
                {message.reactions.map((reaction, index) => {
                  const reactedUsers = reaction.users
                    .map((id) => users.find((u) => u.id === id)?.username)
                    .filter(Boolean) as string[];

                  let tooltipText = '';
                  if (reactedUsers.length <= 3) {
                    tooltipText =
                      reactedUsers.length === 2
                        ? `**${reactedUsers[0]}** and **${reactedUsers[1]}** reacted with ${reaction.emoji}`
                        : `**${reactedUsers.join('**, **')}** reacted with ${
                            reaction.emoji
                          }`;
                  } else {
                    tooltipText = `**${reactedUsers
                      .slice(0, 2)
                      .join('**, **')}**, and ${
                      reactedUsers.length - 2
                    } others reacted with ${reaction.emoji}`;
                  }

                  const hasReacted = reaction.users.includes(session?.id);

                  return (
                    <TooltipPortal
                      key={index}
                      text={tooltipText}
                      previewEmoji={reaction.emoji}
                      maxWidth={200}
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-sm cursor-pointer ${
                        hasReacted
                          ? 'bg-primary/10 hover:bg-primary/20 border border-primary/30'
                          : 'bg-base-300/70 hover:border-base-content/20 border border-transparent'
                      }`}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onReaction({ native: reaction.emoji }, message.id);
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <span className="text-base">{reaction.emoji}</span>
                        <span
                          className={`text-xs ${
                            hasReacted ? 'text-primary' : ''
                          }`}
                        >
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
        className={`absolute -top-3 right-2 transition-opacity duration-200 ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className="flex items-center gap-0.5 bg-base-100 rounded-lg shadow-lg border border-base-300 p-[2px]">
          {['👍', '🎉', '😂'].map((emoji) => (
            <TooltipPortal
              key={emoji}
              text={`React with ${emoji}`}
              className="flex items-center p-1.5 rounded hover:bg-base-200"
            >
              <button onClick={() => onReaction({ native: emoji }, message.id)}>
                <span className="text-base">{emoji}</span>
              </button>
            </TooltipPortal>
          ))}
          <TooltipPortal
            text="See more emojis"
            className="flex items-center gap-1 p-1.5 rounded hover:bg-base-200"
          >
            <button
              onClick={(event) => onEmojiPickerOpen(event, message.id)}
              className="flex items-center gap-1"
            >
              <FaceSmileIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">React</span>
            </button>
          </TooltipPortal>
          {showThread && onThreadSelect && (
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
          )}
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

      {showEmojiPicker && isActive && emojiPickerPosition && (
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
              onEmojiSelect={(emoji) => onReaction(emoji, message.id)}
              previewPosition="bottom"
              skinTonePosition="preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
