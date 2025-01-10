import { useState, useRef, useEffect } from 'react';
import { useConversationsStore } from '../../store';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TooltipPortal from '../TooltipPortal/TooltipPortal';
import { useUsersStore } from '../../store';
import { useSessionStore } from '../../store';
import UserAvatar from '../UserAvatar/UserAvatar';
import ThreadFlyout from '../ThreadFlyout/ThreadFlyout';

const ChatArea = () => {
  const { currentConversation, setCurrentConversation, leaveConversation } =
    useConversationsStore();
  const { users } = useUsersStore();
  const { session } = useSessionStore();
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

  const getConversationHeader = () => {
    if (!currentConversation || !session) return null;

    if (currentConversation.is_channel) {
      return (
        <h2 className="text-xl font-semibold"># {currentConversation.name}</h2>
      );
    }

    const otherUser = users.find((u) =>
      currentConversation.conversation_members.some(
        (m) => m.user_id === u.id && m.user_id !== session.id
      )
    );

    return (
      <div className="flex items-center gap-2">
        <UserAvatar user={otherUser} size="medium" />
        <h2 className="text-xl font-semibold">{otherUser?.username}</h2>
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

  return (
    <div className="flex flex-1 h-screen">
      <div
        className={`flex flex-col flex-1 ${
          activeThread ? 'w-[calc(100%-24rem)]' : 'w-full'
        } transition-all duration-200`}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-base-300">
          {getConversationHeader()}
          {currentConversation.is_channel && (
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
          )}
        </div>

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
