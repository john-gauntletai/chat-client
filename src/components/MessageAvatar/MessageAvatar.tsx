import { User } from '../../types';

interface Props {
  user: User | null | undefined;
}

const MessageAvatar = ({ user }: Props) => {
  if (!user) return null;

  return (
    <div className="avatar">
      {user.imageUrl ? (
        <div className="overflow-hidden rounded-md w-9">
          <img
            src={user.imageUrl}
            alt={user.username}
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center overflow-hidden rounded-md w-9 bg-neutral-focus text-neutral-content">
          <span className="text-xs">
            {user.username.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageAvatar;
