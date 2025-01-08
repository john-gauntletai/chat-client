import { useState } from 'react';
import { useChannelsStore } from '../../store';

const ChannelList = () => {
  const { channels, currentChannel, setCurrentChannel, create } =
    useChannelsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const handleCreate = async () => {
    if (!newChannelName.trim()) return;

    try {
      const newChannel = await create(newChannelName);
      setCurrentChannel(newChannel);
      setNewChannelName('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Channels</h2>
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>
      </div>
      <ul className="menu menu-sm">
        {channels.map((channel) => (
          <li key={channel.id}>
            <a
              className={`flex items-center gap-2 ${
                currentChannel?.id === channel.id ? 'active' : ''
              }`}
              onClick={() => setCurrentChannel(channel)}
            >
              <span className="text-opacity-60">#</span>
              {channel.name}
            </a>
          </li>
        ))}
      </ul>

      {/* Create Channel Modal */}
      <dialog className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-bold">Create New Channel</h3>
          <div className="form-control">
            <label className="label">
              <span className="label-text">New Channel Name</span>
            </label>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="input input-bordered"
              placeholder="general"
            />
          </div>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setIsModalOpen(false);
                setNewChannelName('');
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={!newChannelName.trim()}
            >
              Create
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsModalOpen(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default ChannelList;
