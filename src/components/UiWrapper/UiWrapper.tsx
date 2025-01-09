import { useEffect } from 'react';
import {
  useSessionStore,
  useUsersStore,
  useConversationsStore,
  useMessagesStore,
} from '../../store';
import { globalChannel, pusher } from '../../services/pusher';
import Sidebar from '../Sidebar/Sidebar';
import ChatArea from '../ChatArea/ChatArea';

const UiWrapper = () => {
  const { session, fetch: fetchSession } = useSessionStore();
  const { fetch: fetchUsers, addUser } = useUsersStore();
  const {
    conversations,
    fetch: fetchConversations,
    addConversation,
    updateConversation,
  } = useConversationsStore();
  const {
    messages,
    fetch: fetchMessages,
    addMessage,
    updateMessage,
  } = useMessagesStore();

  useEffect(() => {
    fetchSession();
    fetchUsers();
    fetchConversations();

    globalChannel.bind('user:created', (user) => {
      addUser(user);
    });

    // Cleanup
    return () => {
      globalChannel.unbind('user:created');
    };
  }, []);

  useEffect(() => {
    if (session) {
      const subscription = pusher.subscribe(`user-${session.id}`);
      subscription.bind('conversation:created', (data) => {
        addConversation(data);
      });
    }
    return () => {
      if (session) {
        const subscription = pusher.subscribe(`user-${session.id}`);
        if (subscription) {
          subscription.unbind('conversation:created');
        }
      }
    };
  }, [session]);

  useEffect(() => {
    const myConversations = conversations.filter((conversation) => {
      return conversation.conversation_members.find(
        (member) => member.user_id === session?.id
      );
    });

    myConversations.forEach((conversation) => {
      const conversationName = `conversation-${conversation.id}`;
      const subscription = pusher.subscribe(conversationName);

      subscription.bind('conversation:updated', (data) => {
        updateConversation(data);
      });

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

    // Cleanup subscriptions when conversations change
    return () => {
      myConversations.forEach((conversation) => {
        const conversationName = `conversation-${conversation.id}`;
        pusher.unsubscribe(conversationName);

        // Clean up event bindings
        const subscription = pusher.subscribe(conversationName);
        if (subscription) {
          subscription.unbind('conversation:updated');
          subscription.unbind('message:created');
          subscription.unbind('message:updated');
          subscription.unbind('user-typing');
        }
      });
    };
  }, [conversations, session]);

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar />
      <ChatArea />
    </div>
  );
};

export default UiWrapper;
