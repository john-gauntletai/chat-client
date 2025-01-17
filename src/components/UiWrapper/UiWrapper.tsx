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
import { playAudio } from '../../services/elevenlabs';

const UiWrapper = () => {
  const {
    session,
    fetch: fetchSession,
    userSettings,
    fetchUserSettings,
  } = useSessionStore();
  const {
    fetch: fetchUsers,
    addUser,
    fetchStatuses,
    updateStatus,
  } = useUsersStore();
  const {
    conversations,
    currentConversation,
    fetch: fetchConversations,
    addConversation,
    updateConversation,
  } = useConversationsStore();
  const {
    messages,
    fetch: fetchMessages,
    fetchAIMessage,
    addMessage,
    updateMessage,
  } = useMessagesStore();

  useEffect(() => {
    fetchSession();
    fetchUserSettings();
    fetchUsers();
    fetchConversations();
    fetchStatuses();

    globalChannel.bind('user:created', (user) => {
      addUser(user);
    });

    // Listen for status changes
    const presenceChannel = pusher.subscribe('presence');
    presenceChannel.bind(
      'user:status_changed',
      (data: { user_id: string; status: string }) => {
        updateStatus(data.user_id, data.status);
      }
    );

    // Cleanup
    return () => {
      globalChannel.unbind('user:created');
      presenceChannel.unbind('user:status_changed');
      pusher.unsubscribe('presence');
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

      subscription.bind('message:created', async (data) => {
        addMessage(data);
        const isSameConversation =
          data.message.conversation_id === Number(currentConversation?.id);
        const isFullSelfChatting =
          userSettings?.full_self_chatting?.[data.message.conversation_id];
        const isNotChannel = !currentConversation?.is_channel;
        const isNotSelf = data.message.created_by !== session?.id;

        if (
          isSameConversation &&
          isFullSelfChatting &&
          isNotChannel &&
          isNotSelf
        ) {
          // Play audio for the incoming message
          await playAudio(data.message.content, data.message.created_by);

          // Also fetch AI response
          fetchAIMessage(
            data.message.conversation_id,
            data.message.parent_message_id
          );
        }
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
  }, [conversations, session, currentConversation, userSettings]);

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar />
      <ChatArea />
    </div>
  );
};

export default UiWrapper;
