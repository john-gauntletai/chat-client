import Message from '../Message/Message';
import data from '@emoji-mart/data';

interface Props {
  messages: Message[];
  showThread?: boolean;
  showDateSeparators?: boolean;
  onReaction: (emoji: any, messageId: string) => void;
  onThreadSelect?: (message: Message) => void;
  activeMessage: string | null;
  showEmojiPicker: boolean;
  emojiPickerPosition: { top: number; left: number };
  onEmojiPickerOpen: (event: React.MouseEvent, messageId: string) => void;
  onMessageHover: (messageId: string | null) => void;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
}

const MessageView = ({
  messages,
  showThread = true,
  showDateSeparators = true,
  onReaction,
  onThreadSelect,
  activeMessage,
  showEmojiPicker,
  emojiPickerPosition,
  onEmojiPickerOpen,
  onMessageHover,
  emojiPickerRef,
}: Props) => {
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

  const messagesByDate = messages.reduce((acc, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, typeof messages>);

  return (
    <div className="space-y-6">
      {showDateSeparators ? (
        Object.entries(messagesByDate)
          .sort(
            ([dateA], [dateB]) =>
              new Date(dateA).getTime() - new Date(dateB).getTime()
          )
          .map(([date, dateMessages]) => (
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

              <div className="space-y-0">
                {dateMessages
                  .sort(
                    (a, b) =>
                      new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime()
                  )
                  .map((message) => (
                    <Message
                      key={message.id}
                      message={message}
                      showThread={showThread}
                      showDate={false}
                      onReaction={onReaction}
                      onThreadSelect={onThreadSelect}
                      isActive={activeMessage === message.id}
                      showEmojiPicker={showEmojiPicker}
                      onEmojiPickerOpen={onEmojiPickerOpen}
                      onMouseLeave={() => onMessageHover(null)}
                      emojiPickerRef={emojiPickerRef}
                      emojiPickerPosition={
                        activeMessage === message.id
                          ? emojiPickerPosition
                          : undefined
                      }
                    />
                  ))}
              </div>
            </div>
          ))
      ) : (
        <div className="space-y-0">
          {messages
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((message) => (
              <Message
                key={message.id}
                message={message}
                showThread={showThread}
                showDate={true}
                onReaction={onReaction}
                onThreadSelect={onThreadSelect}
                isActive={activeMessage === message.id}
                showEmojiPicker={showEmojiPicker}
                onEmojiPickerOpen={onEmojiPickerOpen}
                onMouseLeave={() => onMessageHover(null)}
                emojiPickerRef={emojiPickerRef}
                emojiPickerPosition={
                  activeMessage === message.id ? emojiPickerPosition : undefined
                }
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default MessageView;
