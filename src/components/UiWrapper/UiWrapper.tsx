import { useEffect } from 'react';
import {
  useSessionStore,
  useUsersStore,
  useChannelsStore,
  useMessagesStore,
} from '../../store';
import { globalChannel, pusher } from '../../services/pusher';
import Sidebar from '../Sidebar/Sidebar';
import ChatArea from '../ChatArea/ChatArea';

const UiWrapper = () => {
  const { fetch: fetchSession } = useSessionStore();
  const { fetch: fetchUsers, addUser } = useUsersStore();
  const { channels, fetch: fetchChannels, addChannel } = useChannelsStore();
  const {
    messages,
    fetch: fetchMessages,
    addMessage,
    updateMessage,
  } = useMessagesStore();

  useEffect(() => {
    fetchSession();
    fetchUsers();
    fetchMessages();
    fetchChannels();

    globalChannel.bind('channel:created', (channel: Channel) => {
      addChannel(channel);
    });

    globalChannel.bind('user:created', (user) => {
      addUser(user);
    });

    // Cleanup
    return () => {
      globalChannel.unbind('channel:created');
      globalChannel.unbind('user:created');
    };
  }, []);

  useEffect(() => {
    // Subscribe to each channel
    channels.forEach((channel) => {
      const channelName = `channel-${channel.id}`;
      const subscription = pusher.subscribe(channelName);

      subscription.bind('message:created', (data) => {
        addMessage(data);
      });

      // Add this handler for message updates
      subscription.bind('message:updated', (data) => {
        updateMessage(data);
      });

      // Optional: handle other events
      subscription.bind('user-typing', (data) => {
        // Handle typing indicator
      });
    });

    // Cleanup subscriptions when channels change
    return () => {
      channels.forEach((channel) => {
        const channelName = `channel-${channel.id}`;
        pusher.unsubscribe(channelName);

        // Clean up event bindings
        const subscription = pusher.channel(channelName);
        if (subscription) {
          subscription.unbind('message:created');
          subscription.unbind('message:updated');
          subscription.unbind('user-typing');
        }
      });
    };
  }, [channels]);

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar />
      <ChatArea />
    </div>
  );
};

export default UiWrapper;
