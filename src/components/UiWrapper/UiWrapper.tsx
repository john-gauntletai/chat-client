import { useEffect } from 'react';
import {
  useSessionStore,
  useUsersStore,
  useChannelsStore,
  useMessagesStore,
} from '../../store';
import Sidebar from '../Sidebar/Sidebar';
import ChatArea from '../ChatArea/ChatArea';

const UiWrapper = () => {
  const { fetch: fetchSession } = useSessionStore();
  const { fetch: fetchUsers } = useUsersStore();
  const { fetch: fetchChannels } = useChannelsStore();
  const { fetch: fetchMessages } = useMessagesStore();
  useEffect(() => {
    fetchSession();
    fetchUsers();
    fetchChannels();
    fetchMessages();
  }, []);

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar />
      <ChatArea />
    </div>
  );
};

export default UiWrapper;
