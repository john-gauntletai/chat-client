import { useState } from 'react';
import { useUsersStore, useSessionStore, useMessagesStore } from '../../store';
import MessageAvatar from '../MessageAvatar/MessageAvatar';
import {
  FaceSmileIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  DocumentIcon,
  FilmIcon,
} from '@heroicons/react/24/outline';
import TooltipPortal from '../TooltipPortal/TooltipPortal';
import { Message as MessageType } from '../../types';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

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
  const { messages } = useMessagesStore();
  const { users } = useUsersStore();
  const { session } = useSessionStore();
  const user = users.find((u) => u.id === message.created_by);

  const replies = messages.filter(
    (msg) => msg.parent_message_id === message.id
  );
  const replyCount = replies.length;

  // Get unique repliers (up to 4)
  const repliers = replies
    .map((reply) => users.find((u) => u.id === reply.created_by))
    .filter((user): user is User => !!user)
    .filter(
      (user, index, self) => index === self.findIndex((u) => u.id === user.id)
    )
    .slice(0, 4);

  // Get last reply timestamp
  const lastReplyDate =
    replies.length > 0
      ? new Date(
          Math.max(...replies.map((r) => new Date(r.created_at).getTime()))
        )
      : null;

  const getLastReplyText = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (date.toDateString() === today.toDateString()) {
      return `today at ${time}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `yesterday at ${time}`;
    } else {
      return `${date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })} at ${time}`;
    }
  };

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

  const [selectedAttachment, setSelectedAttachment] = useState<
    MessageType['attachments'][0] | null
  >(null);

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const isImageFile = (type: string) => {
    return type.startsWith('image/');
  };

  const isVideoFile = (type: string) => {
    return type.startsWith('video/');
  };

  return (
    <div className="relative flex gap-2 px-4 py-1.5 group hover:bg-base-200/50">
      <div className="pt-0.5">
        <MessageAvatar user={user} />
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold">{user?.username || 'Unknown User'}</span>
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

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.attachments.map((attachment, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAttachment(attachment)}
                  className="flex items-center p-2 transition-colors border rounded-lg group/attachment hover:border-base-300 bg-base-100 border-base-200"
                >
                  {isImageFile(attachment.type) ? (
                    <div className="relative w-12 h-12 mr-3 overflow-hidden rounded">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : isVideoFile(attachment.type) ? (
                    <div className="relative w-12 h-12 mr-3 overflow-hidden rounded">
                      <div className="absolute inset-0 flex items-center justify-center bg-base-300">
                        <FilmIcon className="w-6 h-6 text-base-content/60" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 mr-3 rounded bg-base-200">
                      <DocumentIcon className="w-6 h-6 text-base-content/60" />
                    </div>
                  )}
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm truncate max-w-[180px]">
                      {attachment.name}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {getFileExtension(attachment.name)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Reactions and Thread */}
          <div className="flex flex-col gap-1 mt-1">
            {message.reactions?.length > 0 && (
              <div className="flex gap-1">
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
            {showThread && replyCount > 0 && (
              <button
                onClick={() => onThreadSelect?.(message)}
                className="flex items-center self-start gap-2 group/reply"
              >
                <div className="flex -space-x-1">
                  {repliers.map((replier) => (
                    <div
                      key={replier.id}
                      className="w-5 h-5 overflow-hidden border rounded-md border-base-100"
                    >
                      <img
                        src={replier.imageUrl}
                        alt={replier.username}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-primary group-hover/reply:text-primary/80">
                  {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                  {lastReplyDate && (
                    <span className="ml-1 font-normal text-base-content/60">
                      • Last reply {getLastReplyText(lastReplyDate)}
                    </span>
                  )}
                </span>
              </button>
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

      {selectedAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative max-w-4xl p-4 mx-4 rounded-lg bg-base-100">
            <button
              onClick={() => setSelectedAttachment(null)}
              className="absolute p-2 rounded-full -top-3 -right-3 bg-base-300 hover:bg-base-200"
            >
              <span className="text-lg">×</span>
            </button>

            {isImageFile(selectedAttachment.type) ? (
              <img
                src={selectedAttachment.url}
                alt={selectedAttachment.name}
                className="max-h-[80vh] rounded-lg"
              />
            ) : isVideoFile(selectedAttachment.type) ? (
              <video
                src={selectedAttachment.url}
                controls
                className="max-h-[80vh] rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center p-8">
                <DocumentIcon className="w-16 h-16 mb-4 text-base-content/60" />
                <span className="text-lg font-medium">
                  {selectedAttachment.name}
                </span>
                <a
                  href={selectedAttachment.url}
                  download
                  className="mt-4 btn btn-primary"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
