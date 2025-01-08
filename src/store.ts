import { create } from 'zustand'
import { chatChannel } from './services/pusher'

const SERVER_API_HOST = import.meta.env.VITE_SERVER_API_HOST;

interface Message {
  id: string;
  content: string;
  channel_id: string;
  created_at: string;
  created_by: string;
}

interface Channel {
  id: string;
  name: string;
}

interface User {
  id: string;
  username: string;
  imageUrl: string;
  email: string;
}

export const useSessionStore = create((set) => ({
  session: null,
  fetch: async () => {
    const response = await makeRequest(`${SERVER_API_HOST}/session`);
    const json = await response.json();
    set({ session: json.user });
  },
}))

export const useUsersStore = create<{
  users: User[];
  fetch: () => Promise<void>;
}>((set, get) => ({
  users: [],        
  fetch: async () => {
    const response = await makeRequest(`${SERVER_API_HOST}/api/users`);
    const json = await response.json();
    set({ users: json.users});
  },
  addUser: (data: { user: User }) => {
    set({ users: [...get().users, data.user] });
  }
}))

export const useChannelsStore = create<{
  channels: Channel[];
  currentChannel: Channel | null;
  fetch: () => Promise<void>;
  setCurrentChannel: (channel: Channel) => void;
  create: (name: string) => Promise<Channel>;
  addChannel: (data: { channel: Channel }) => void;
}>((set, get) => ({
  channels: [],
  currentChannel: null,
  fetch: async () => {
    const response = await makeRequest(`${SERVER_API_HOST}/api/channels`);
    const json = await response.json();
    set({ 
      channels: json.channels,
      currentChannel: json.channels[0] ?? null 
    });
  },
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  create: async (name: string) => {
    const response = await makeRequest(
      `${SERVER_API_HOST}/api/channels`,
      {
        method: 'POST',
        body: JSON.stringify({ name })
      }
    );
    const json = await response.json();
    return json.channel;
  },
  addChannel: (data: { channel: Channel }) => {
    set({ channels: [...get().channels, data.channel] });
  }
}))

export const useMessagesStore = create<{
  messages: Message[];
  fetch: () => Promise<void>;
  create: (channelId: string, content: string) => Promise<Message>;
  addMessage: (data: { message: Message }) => void;
}>((set, get) => ({
  messages: [],
  fetch: async () => {
    const response = await makeRequest(`${SERVER_API_HOST}/api/messages`);
    const json = await response.json();
    set({ messages: json.messages });
  },
  create: async (channelId: string, content: string) => {
    const response = await makeRequest(
      `${SERVER_API_HOST}/api/messages`, 
      {
        method: 'POST',
        body: JSON.stringify({ channelId, content })
      }
    );
    const json = await response.json();
    return json.message;
  },
  addMessage: (data: { message: Message }) => {
    const messageExists = get().messages.some(msg => msg.id === data.message.id);
    if (!messageExists) {
      set({ messages: [...get().messages, data.message] });
    }
  }
}))

async function makeRequest(url: string, options?: RequestInit) {
    const token = await window.Clerk.session.getToken();
    if (!token) {
       return window.location.reload();
    }
    const fetchOptions = {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options?.headers
        }
    };
  return fetch(url, fetchOptions);
}