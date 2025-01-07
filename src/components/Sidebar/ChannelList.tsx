import { useChannelsStore } from '../../store';

const ChannelList = () => {
  const { channels, currentChannel, setCurrentChannel } = useChannelsStore();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Channels</h2>
        <button className="btn btn-ghost btn-xs">+</button>
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
    </div>
  );
};

export default ChannelList;
