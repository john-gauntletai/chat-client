import { useMessagesStore, useUsersStore } from '../../store';

const MessageList = ({ channelId }: { channelId: string }) => {
  const { messages } = useMessagesStore();
  const { users } = useUsersStore();
  const channelMessages = messages
    .filter((msg) => msg.channel_id === channelId)
    .sort(
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
    <div className="flex-1 p-4 overflow-y-auto">
      {channelMessages.map((message) => {
        const user = users.find((u) => u.id === message.created_by);
        const initials = user?.username.slice(0, 2).toUpperCase() || 'UN';

        return (
          <div key={message.id} className="mb-4">
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
                <div>{message.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
