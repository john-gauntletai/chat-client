import { useChannelsStore } from '../../store';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatArea = () => {
  const { currentChannel } = useChannelsStore();

  if (!currentChannel) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-base-content/60">
          Select a channel to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="p-4 border-b border-base-300">
        <h2 className="text-xl font-semibold"># {currentChannel.name}</h2>
      </div>
      <MessageList channelId={currentChannel.id} />
      <MessageInput channelId={currentChannel.id} />
    </div>
  );
};

export default ChatArea;
