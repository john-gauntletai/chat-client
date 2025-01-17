import toast from 'react-hot-toast';
import { create } from 'zustand';

const SERVER_API_HOST = import.meta.env.VITE_SERVER_API_HOST;

export interface MessageReaction {
  emoji: string;
  users: string[]; // array of user IDs
}

export interface Attachment {
  url: string;
  type: string;
  name: string;
  size: number;
  s3Key: string;
}

export interface Message {
  id: string;
  content: string;
  conversation_id: string;
  created_at: string;
  created_by: string;
  reactions?: MessageReaction[];
  parent_message_id: string;
}

export interface AIMessage {
  content: string;
  conversation_id: string;
  parent_message_id?: string;
}

export interface User {
  id: string;
  username: string;
  imageUrl: string;
  email: string;
}

export interface Conversation {
  id: string;
  name?: string;
  is_public: boolean;
  is_channel: boolean;
  created_at: string;
  created_by: string;
  conversation_members: { user_id: string }[];
}

export interface UserSettings {
  full_self_chatting: Record<string, boolean>;
  user_id: string;
  created_at: string;
}

export interface CreateMessageParams {
  conversationId: string;
  content?: string;
  parentMessageId?: string;
  attachments?: Attachment[];
}

export const useSessionStore = create<{
  session: any;
  userSettings: UserSettings | null;
  fetch: () => Promise<void>;
  fetchUserSettings: () => Promise<void>;
}>((set) => ({
  session: null,
  userSettings: null,
  fetch: async () => {
    const response = await makeRequest(`${SERVER_API_HOST}/session`);
    set({ session: response.user });
  },
  fetchUserSettings: async () => {
    const response = await makeRequest(
      `${SERVER_API_HOST}/api/users/me/settings`
    );
    set({ userSettings: response.settings });
  },
  updateUserSettings: async (settings: UserSettings) => {
    const response = await makeRequest(
      `${SERVER_API_HOST}/api/users/me/settings`,
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      }
    );
    set({ userSettings: response.settings });
  },
}));

export const useUsersStore = create<{
  users: User[];
  userStatuses: Record<string, string>; // userId -> status
  fetch: () => Promise<void>;
  fetchStatuses: () => Promise<void>;
  updateStatus: (userId: string, status: string) => void;
}>((set, get) => ({
  users: [],
  userStatuses: {},
  fetch: async () => {
    const response = await makeRequest(`${SERVER_API_HOST}/api/users`);
    set({ users: response.users });
  },
  fetchStatuses: async () => {
    const response = await makeRequest(`${SERVER_API_HOST}/api/users/statuses`);
    const statusMap = response.statuses.reduce(
      (acc: Record<string, string>, curr: any) => {
        acc[curr.user_id] = curr.status;
        return acc;
      },
      {}
    );
    set({ userStatuses: statusMap });
  },
  addUser: (data: { user: User }) => {
    set({ users: [...get().users, data.user] });
  },
  updateStatus: (userId: string, status: string) => {
    set({ userStatuses: { ...get().userStatuses, [userId]: status } });
  },
}));

export const useConversationsStore = create<{
  conversations: Conversation[];
  currentConversation: Conversation | null;
  fetch: () => Promise<void>;
  fetchAvailableChannels: () => Promise<Conversation[]>;
  setCurrentConversation: (conversation: Conversation) => void;
  create: (
    name: string,
    is_channel?: boolean,
    is_public?: boolean
  ) => Promise<Conversation>;
  addConversation: (data: { conversation: Conversation }) => void;
  updateConversation: (data: { conversation: Conversation }) => void;
  joinConversation: (conversationId: string) => Promise<void>;
  leaveConversation: (conversationId: string) => Promise<void>;
}>((set, get) => ({
  conversations: [],
  currentConversation: null,
  fetch: async () => {
    const response = await makeRequest(
      `${SERVER_API_HOST}/api/users/me/conversations`
    );
    // Get conversation_id from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation_id');

    // Find conversation from URL param, or fallback to first conversation
    const initialConversation = conversationId
      ? response.conversations.find((c) => c.id.toString() === conversationId)
      : response.conversations[0];
    set({
      conversations: response.conversations,
      currentConversation: initialConversation ?? null,
    });
  },
  setCurrentConversation: (conversation) => {
    // Update URL query parameter
    const url = new URL(window.location.href);
    if (conversation) {
      url.searchParams.set('conversation_id', conversation.id);
    } else {
      url.searchParams.delete('conversation_id');
    }
    window.history.pushState({}, '', url);

    // Update store state
    set({ currentConversation: conversation });
  },
  create: async (
    name?: string,
    is_channel = true,
    is_public = true,
    members: string[] = []
  ) => {
    const response = await makeRequest(`${SERVER_API_HOST}/api/conversations`, {
      method: 'POST',
      body: JSON.stringify({ name, is_channel, is_public, members }),
    });
    return response.conversation;
  },
  addConversation: (data: { conversation: Conversation }) => {
    set({ conversations: [...get().conversations, data.conversation] });
  },
  updateConversation: (data: { conversation: Conversation }) => {
    set({
      conversations: get().conversations.map((c) =>
        c.id === data.conversation.id ? data.conversation : c
      ),
    });
  },
  fetchAvailableChannels: async () => {
    const response = await makeRequest(`${SERVER_API_HOST}/api/conversations`);
    const { conversations } = response;
    set({
      conversations,
    });
    return conversations;
  },
  joinConversation: async (conversationId: string) => {
    const response = await makeRequest(
      `${SERVER_API_HOST}/api/conversations/${conversationId}/join`,
      {
        method: 'POST',
      }
    );
    const { conversation } = response;

    set({
      conversations: get().conversations.map((c) =>
        c.id === conversation.id ? conversation : c
      ),
    });
  },
  leaveConversation: async (conversationId: string) => {
    await makeRequest(
      `${SERVER_API_HOST}/api/conversations/${conversationId}/leave`,
      {
        method: 'DELETE',
      }
    );

    // Remove conversation from state
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      currentConversation: null,
    }));
  },
}));

export const useMessagesStore = create<{
  messages: Message[];
  aiMessages: AIMessage[];
  fetch: () => Promise<void>;
  fetchConversationMessages: (conversationId: string) => Promise<void>;
  fetchAIMessage: (
    conversationId: string,
    parentMessageId?: string
  ) => Promise<void>;
  create: (createMessageParams: CreateMessageParams) => Promise<Message>;
  addMessage: (data: { message: Message }) => void;
  updateMessage: (data: { message: Message }) => void;
  removeAIMessage: (conversationId: string, parentMessageId?: string) => void;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
}>((set, get) => ({
  messages: [],
  aiMessages: [],
  fetch: async () => {
    const response = await makeRequest(`${SERVER_API_HOST}/api/messages`);
    set({ messages: response.messages });
  },
  fetchConversationMessages: async (conversationId: string) => {
    const response = await makeRequest(
      `${SERVER_API_HOST}/api/messages?conversationId=${conversationId}`
    );
    const { messages } = response;

    // Replace existing messages for this conversation
    const otherMessages = get().messages.filter(
      (msg) => msg.conversation_id !== conversationId
    );
    set({ messages: [...otherMessages, ...messages] });
  },
  fetchAIMessage: async (conversationId: string, parentMessageId?: string) => {
    try {
      const response = await makeRequest(`${SERVER_API_HOST}/api/messages/ai`, {
        method: 'POST',
        body: JSON.stringify({ conversationId, parentMessageId }),
      });
      if (!response.message) return;
      const existingMessageIndex = get().aiMessages.findIndex(
        (msg) =>
          msg.conversation_id === response.message.conversation_id &&
          ((!msg.parent_message_id && !response.message.parent_message_id) ||
            msg.parent_message_id === response.message.parent_message_id)
      );

      if (existingMessageIndex !== -1) {
        // Replace existing message
        const newMessages = [...get().aiMessages];
        newMessages[existingMessageIndex] = response.message;
        set({ aiMessages: newMessages });
      } else {
        // Add new message
        set({ aiMessages: [...get().aiMessages, response.message] });
      }
    } catch (error) {
      console.error('Error fetching AI message:', error);
    }
  },
  create: async (createMessageParams: CreateMessageParams) => {
    const response = await makeRequest(`${SERVER_API_HOST}/api/messages`, {
      method: 'POST',
      body: JSON.stringify(createMessageParams),
    });
    return response.message;
  },
  addMessage: (data: { message: Message }) => {
    const messageExists = get().messages.some(
      (msg) => msg.id === data.message.id
    );
    if (!messageExists) {
      set({ messages: [...get().messages, data.message] });
    }
  },
  updateMessage: (data: { message: Message }) => {
    const messages = get().messages.map((msg) =>
      msg.id === data.message.id ? data.message : msg
    );
    set({ messages });
  },
  removeAIMessage: (conversationId: string, parentMessageId?: string) => {
    set({
      aiMessages: get().aiMessages.filter(
        (msg) =>
          msg.conversation_id !== conversationId ||
          msg.parent_message_id !== parentMessageId
      ),
    });
  },
  addReaction: async (messageId: string, emoji: string) => {
    const response = await makeRequest(
      `${SERVER_API_HOST}/api/messages/${messageId}/reactions`,
      {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      }
    );

    const messages = get().messages.map((msg) =>
      msg.id === messageId ? response.message : msg
    );
    set({ messages });
  },
}));

export const makeRequest = async function (url: string, options?: RequestInit) {
  try {
    const token = await window.Clerk.session.getToken();
    if (!token) {
      return window.location.reload();
    }
    const fetchOptions = {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    };
    const response = await fetch(url, fetchOptions);
    if (response.status >= 400) {
      throw new Error(await response.text());
    }
    return response.json();
  } catch (error) {
    console.error('Error making request:', error);
    toast.error('Error making request', error.message);
  }
};
