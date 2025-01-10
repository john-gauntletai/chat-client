import { UserButton } from '@clerk/clerk-react';
import ChannelList from './ChannelList';
import DirectMessageList from './DirectMessageList';

const Sidebar = () => {
  return (
    <div className="flex flex-col w-64 h-full bg-base-200">
      <div className="p-4 border-b border-base-300">
        <h1 className="text-xl font-bold">Initech AI</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChannelList />
        <DirectMessageList />
      </div>
      <div className="p-4 border-t border-base-300">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Sidebar;
