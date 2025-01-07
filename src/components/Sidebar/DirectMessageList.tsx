import { useUsersStore } from '../../store';

const DirectMessageList = () => {
  const { users } = useUsersStore();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Direct Messages</h2>
        <button className="btn btn-ghost btn-xs">+</button>
      </div>
      <ul className="menu menu-sm">
        {users.map((user) => (
          <li key={user.id}>
            <a className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-base-300" />
              {user.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DirectMessageList;
