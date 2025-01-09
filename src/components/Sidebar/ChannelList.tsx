import { useState } from 'react';
import { useConversationsStore } from '../../store';
import JoinChannelModal from './JoinChannelModal';
import { useSessionStore } from '../../store';

const ChannelList = () => {
  const { conversations, currentConversation, setCurrentConversation, create } =
    useConversationsStore();
  const { session } = useSessionStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');

  const userChannels = conversations
    .filter(
      (conv) =>
        conv.is_channel &&
        conv.conversation_members.some(
          (member) => member.user_id === session?.id
        )
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const handleCreate = async () => {
    if (!newConversationName.trim()) return;

    try {
      const newConversation = await create(newConversationName);
      setCurrentConversation(newConversation);
      setNewConversationName('');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Channels</h2>
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setIsCreateModalOpen(true)}
        >
          +
        </button>
      </div>
      <ul className="menu menu-sm">
        {userChannels.map((conversation) => (
          <li key={conversation.id}>
            <a
              className={`flex items-center gap-2 ${
                currentConversation?.id === conversation.id ? 'active' : ''
              }`}
              onClick={() => setCurrentConversation(conversation)}
            >
              <span className="text-opacity-60">#</span>
              {conversation.name}
            </a>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setIsJoinModalOpen(true)}
        className="flex items-center w-full gap-2 px-2 py-1 mt-2 text-sm rounded text-base-content/60 hover:text-base-content hover:bg-base-200"
      >
        <span className="text-xs">+</span>
        Join a Channel
      </button>

      {/* Create Channel Modal */}
      <dialog className={`modal ${isCreateModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-bold">Create New Channel</h3>
          <div className="form-control">
            <label className="label">
              <span className="label-text">New Channel Name</span>
            </label>
            <input
              type="text"
              value={newConversationName}
              onChange={(e) => setNewConversationName(e.target.value)}
              className="input input-bordered"
              placeholder="general"
            />
          </div>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewConversationName('');
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={!newConversationName.trim()}
            >
              Create
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsCreateModalOpen(false)}>close</button>
        </form>
      </dialog>

      <JoinChannelModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
};

export default ChannelList;
