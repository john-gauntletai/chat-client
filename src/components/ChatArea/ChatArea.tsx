import { useState, useRef, useEffect } from 'react';
import { useConversationsStore } from '../../store';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TooltipPortal from '../TooltipPortal/TooltipPortal';

const ChatArea = () => {
  const { currentConversation, setCurrentConversation, leaveConversation } =
    useConversationsStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div
      className={`relative z-10 flex flex-col flex-1 ${
        showMenu ? 'pointer-events-none' : ''
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-base-300">
        <h2 className="text-xl font-semibold">
          {currentConversation.is_channel && '#'} {currentConversation.name}
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
              {currentConversation.is_channel && (
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-base-200 text-error-content"
                  onClick={handleLeaveChannel}
                >
                  Leave Channel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <MessageList conversationId={currentConversation.id} />
      <MessageInput conversationId={currentConversation.id} />
    </div>
  );
};

export default ChatArea;
