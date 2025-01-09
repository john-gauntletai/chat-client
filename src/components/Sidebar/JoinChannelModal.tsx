import { useState, useEffect } from 'react';
import { useConversationsStore, useSessionStore } from '../../store';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Conversation } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const JoinChannelModal = ({ isOpen, onClose }: Props) => {
  const {
    joinConversation,
    setCurrentConversation,
    fetchAvailableChannels,
    conversations,
  } = useConversationsStore();
  const { session } = useSessionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch channels when modal opens
  useEffect(() => {
    const loadChannels = async () => {
      if (isOpen) {
        setIsLoading(true);
        try {
          await fetchAvailableChannels();
        } catch (error) {
          console.error('Failed to fetch available channels:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadChannels();
  }, [isOpen, fetchAvailableChannels]);

  const isUserMemberOfChannel = (channel: Conversation) => {
    return channel.conversation_members.find(
      (obj: { user_id: string }) => obj.user_id === session?.id
    );
  };

  const handleJoinChannel = async (channel: Conversation) => {
    try {
      await joinConversation(channel.id);
      setCurrentConversation(channel);
      onClose();
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  const filteredChannels = conversations
    .filter((channel) => channel.is_channel)
    .filter((channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="p-0 modal-box h-[32rem]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 border-b bg-base-100 border-base-300">
          <div className="flex items-center justify-between p-4">
            <h3 className="text-lg font-bold">Available Channels</h3>
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={onClose}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 pb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-base-content/60" />
              <input
                type="text"
                placeholder="Search channels"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 input input-bordered"
              />
            </div>
          </div>
        </div>

        {/* Channel List */}
        <div className="overflow-y-auto h-[calc(32rem-8.5rem)]">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <span className="loading loading-spinner"></span>
              </div>
            ) : filteredChannels.length === 0 ? (
              <p className="text-sm text-base-content/60">
                {searchQuery
                  ? 'No channels match your search'
                  : 'No channels available to join'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredChannels.map((channel) => {
                  const isMember = isUserMemberOfChannel(channel);
                  const memberCount = channel.conversation_members.length;
                  return (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-base-200"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base-content/60">#</span>
                          <span>{channel.name}</span>
                        </div>
                        <span className="text-xs text-base-content/60">
                          {memberCount}{' '}
                          {memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                      <button
                        className={`btn btn-sm ${
                          isMember ? 'btn-disabled' : 'btn-primary'
                        }`}
                        onClick={() => {
                          if (!isMember) {
                            handleJoinChannel(channel);
                          }
                        }}
                        disabled={isMember}
                      >
                        {isMember ? 'Joined' : 'Join'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default JoinChannelModal;
