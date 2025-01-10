import { User } from '../../types';
import { useUsersStore } from '../../store';

type Size = 'small' | 'medium' | 'large';

interface Props {
  user: User | null | undefined;
  size?: Size;
}

const sizeClasses = {
  small: {
    container: 'w-6',
    text: 'text-xs',
    status: 'w-2.5 h-2.5 -right-0.5 -bottom-0.5',
    clip: 'rounded-md',
    clipPath: `path("M 0 0 L 24 0 L 24 16 A 8 8 0 0 1 16 24 L 0 24 Z")`,
  },
  medium: {
    container: 'w-8',
    text: 'text-sm',
    status: 'w-3 h-3 -right-0.5 -bottom-0.5',
    clip: 'rounded-md',
    clipPath: `path("M 0 0 L 32 0 L 32 22 A 10 10 0 0 1 22 32 L 0 32 Z")`,
  },
  large: {
    container: 'w-20',
    text: 'text-2xl',
    status: 'w-5 h-5 -right-1 -bottom-1',
    clip: 'rounded-md',
    clipPath: `path("M 0 0 L 80 0 L 80 60 A 20 20 0 0 1 60 80 L 0 80 Z")`,
  },
};

const UserAvatar = ({ user, size = 'small' }: Props) => {
  const { userStatuses } = useUsersStore();
  if (!user) return null;

  const { container, text, status, clip, clipPath } = sizeClasses[size];
  const isOnline = userStatuses[user.id] === 'online';

  return (
    <div className="relative avatar">
      {user.imageUrl ? (
        <div className={`${container} ${clip} overflow-hidden`}>
          <img
            src={user.imageUrl}
            alt={user.username}
            className="object-cover w-full h-full"
            style={{ clipPath }}
          />
        </div>
      ) : (
        <div
          className={`${container} ${clip} bg-neutral-focus text-neutral-content overflow-hidden flex items-center justify-center`}
        >
          <span className={text}>
            {user.username.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      <div
        className={`absolute ${status} rounded-full ${
          isOnline
            ? 'bg-success border-2 border-base-100'
            : 'bg-base-100 border border-base-content/40'
        }`}
      />
    </div>
  );
};

export default UserAvatar;
