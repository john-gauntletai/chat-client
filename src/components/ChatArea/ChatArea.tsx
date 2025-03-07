import { useState, useRef, useEffect } from 'react';
import {
  Message,
  useConversationsStore,
  useSessionStore,
  useUsersStore,
  makeRequest,
} from '../../store';
import { EllipsisVerticalIcon, BeakerIcon } from '@heroicons/react/24/outline';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserAvatar from '../UserAvatar/UserAvatar';
import ThreadFlyout from '../ThreadFlyout/ThreadFlyout';

const ChatArea = () => {
  const { currentConversation, setCurrentConversation, leaveConversation } =
    useConversationsStore();
  const { users } = useUsersStore();
  const { session, userSettings, updateUserSettings } = useSessionStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeThread, setActiveThread] = useState<Message | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSelfChatting = async () => {
    if (!currentConversation) return;
    const newSettings = {
      ...userSettings,
      full_self_chatting: {
        ...userSettings?.full_self_chatting,
        [currentConversation.id]:
          !userSettings?.full_self_chatting?.[currentConversation.id],
      },
    };

    await updateUserSettings(newSettings);
  };

  const getConversationHeader = () => {
    if (!currentConversation || !session) return null;

    if (currentConversation.is_channel) {
      return (
        <div className="flex items-center justify-between px-4 py-2 border-b border-base-300">
          <h2 className="text-xl font-semibold">
            # {currentConversation.name}
          </h2>
          <div className="relative pointer-events-auto" ref={menuRef}>
            <button
              className="p-1 rounded hover:bg-base-200"
              onClick={() => setShowMenu(!showMenu)}
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 w-48 mt-2 overflow-hidden border rounded-lg shadow-lg bg-base-100 border-base-300">
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-base-200 text-error-content"
                  onClick={handleLeaveChannel}
                >
                  Leave Channel
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    const otherUser = users.find((u) =>
      currentConversation.conversation_members.some(
        (m) => m.user_id === u.id && m.user_id !== session.id
      )
    );

    return (
      <div className="flex items-center justify-between px-4 py-2 border-b border-base-300">
        <div className="flex items-center gap-2">
          <UserAvatar user={otherUser} size="medium" />
          <h2 className="text-xl font-semibold">{otherUser?.username}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={sendTestMessage}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors rounded-md bg-base-200 hover:bg-base-300"
          >
            <BeakerIcon className="w-4 h-4" />
            Receive a Test Message
          </button>
          <label className="gap-2 cursor-pointer label">
            <span
              className={`flex items-center gap-1 text-sm font-bold transition-animation duration-300 ${
                userSettings?.full_self_chatting?.[currentConversation.id]
                  ? 'text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text bg-[length:200%_100%] animate-gradient'
                  : 'text-base-content/40 hover:text-base-content/60'
              }`}
            >
              Full Self Chatting
              <span className="text-xs">
                {userSettings?.full_self_chatting?.[currentConversation.id]
                  ? '🚀'
                  : '🛸'}
              </span>
            </span>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={
                !!userSettings?.full_self_chatting?.[currentConversation.id]
              }
              onChange={toggleSelfChatting}
            />
          </label>
        </div>
      </div>
    );
  };

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-base-content/60">
          Select a conversation to start chatting
        </p>
      </div>
    );
  }

  const handleLeaveChannel = async () => {
    try {
      await leaveConversation(currentConversation.id);
      setCurrentConversation(null);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  };

  const sendTestMessage = async () => {
    if (!currentConversation || !session) return;

    const otherUser = users.find((u) =>
      currentConversation.conversation_members.some(
        (m) => m.user_id === u.id && m.user_id !== session.id
      )
    );

    if (!otherUser) return;

    await makeRequest(
      `${import.meta.env.VITE_SERVER_API_HOST}/api/messages/test`,
      {
        method: 'POST',
        body: JSON.stringify({
          conversationId: currentConversation.id,
          userId: otherUser.id,
          content: 'hey, hows it going?',
        }),
      }
    );
  };

  return (
    <div className="flex flex-1 h-screen">
      <div
        className={`flex flex-col flex-1 ${
          activeThread ? 'w-[calc(100%-24rem)]' : 'w-full'
        } transition-all duration-200`}
      >
        {getConversationHeader()}
        <MessageList
          conversationId={currentConversation.id}
          onThreadSelect={setActiveThread}
          activeThread={activeThread}
        />
        <MessageInput conversationId={currentConversation.id} />
      </div>

      {activeThread && (
        <ThreadFlyout
          parentMessage={activeThread}
          onClose={() => setActiveThread(null)}
        />
      )}
    </div>
  );
};

export default ChatArea;
