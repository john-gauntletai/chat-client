import { useUsersStore, useSessionStore } from '../../store';

const DirectMessageList = () => {
  const { users } = useUsersStore();
  const { session } = useSessionStore();

  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === session?.id) return 1;
    if (b.id === session?.id) return -1;
    return a.username.localeCompare(b.username); // alphabetical for others
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Direct Messages</h2>
        <button className="btn btn-ghost btn-xs">+</button>
      </div>
      <ul className="menu menu-sm">
        {sortedUsers.map((user) => {
          const initials = user.username.slice(0, 2).toUpperCase();
          const isCurrentUser = user.id === session?.id;

          return (
            <li key={user.id}>
              <a className="flex items-center gap-2">
                <div className="avatar">
                  {user.imageUrl ? (
                    <div className="w-6 rounded-full">
                      <img src={user.imageUrl} alt={user.username} />
                    </div>
                  ) : (
                    <div className="w-6 rounded-full bg-neutral text-neutral-content">
                      <span className="text-xs">{initials}</span>
                    </div>
                  )}
                </div>
                <span>
                  {user.username}
                  {isCurrentUser && (
                    <span className="ml-1 text-base-content/60">(you)</span>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DirectMessageList;
