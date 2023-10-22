import {
  Avatar,
  useChatContext,
  LoadingChannels as LoadingUsers,
} from 'stream-chat-react';
import { useEffect, useState } from 'react';
import { UserResource } from '@clerk/types';
import { Channel, UserResponse } from 'stream-chat';
import { ArrowLeft } from 'lucide-react';
import LoadingButton from '@/components/LoadingButton';
import useDebounce from '@/hooks/useDebounce';

interface UsersMenuProps {
  loggedInUser: UserResource;
  onClose: () => void;
  onChannelSelect: () => void;
}

export default function UserMenu({
  loggedInUser,
  onClose,
  onChannelSelect,
}: UsersMenuProps) {
  const { client, setActiveChannel } = useChatContext();

  const [users, setUsers] = useState<(UserResponse & { image?: string })[]>();

  const [searchInput, setSearchInput] = useState('');
  const searchInputDebounced = useDebounce(searchInput);

  const [moreUsersLoading, setMoreUsersLoading] = useState(false);

  const [endOfPaginationReached, setEndOfPaginationReached] =
    useState<boolean>();

  const pageSize = 10;

  useEffect(() => {
    async function loadInitialUsers() {
      setUsers(undefined);
      setEndOfPaginationReached(undefined);
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const response = await client.queryUsers(
          {
            id: { $ne: loggedInUser.id },
            ...(searchInputDebounced
              ? {
                  $or: [
                    { name: { $autocomplete: searchInputDebounced } },
                    { id: { $autocomplete: searchInputDebounced } },
                  ],
                }
              : {}),
          },
          { id: 1 },
          { limit: pageSize + 1 }
        );
        setUsers(response.users.slice(0, pageSize));
        setEndOfPaginationReached(response.users.length <= pageSize);
      } catch (e) {
        console.log(e);
        alert('Error loading users ');
      }
    }
    loadInitialUsers();
  }, [client, loggedInUser.id, searchInputDebounced]);

  async function loadMoreUsers() {
    setMoreUsersLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const lastUserId = users?.[users?.length - 1].id;
      if (!lastUserId) return;

      const response = await client.queryUsers(
        {
          $and: [
            { id: { $ne: loggedInUser.id } },
            { id: { $gt: lastUserId } },
            searchInputDebounced
              ? {
                  $or: [
                    { name: { $autocomplete: searchInputDebounced } },
                    { id: { $autocomplete: searchInputDebounced } },
                  ],
                }
              : {},
          ],
        },
        { id: 1 },
        { limit: pageSize + 1 }
      );
      setUsers([...users, ...response.users.slice(0, pageSize)]);
      setEndOfPaginationReached(response.users.length <= pageSize);
    } catch (error) {
      console.log(error);
      alert('Error loading users ');
    } finally {
      setMoreUsersLoading(false);
    }
  }

  function handleChannelSelected(channel: Channel) {
    setActiveChannel(channel);
    onChannelSelect();
  }

  async function startChatWithUser(userId: string) {
    try {
      const channel = client.channel('messaging', {
        members: [userId, loggedInUser.id],
      });
      await channel.create();
      handleChannelSelected(channel);
    } catch (e) {
      console.log(e);
      alert('Error creating channel');
    }
  }

  return (
    <div className="str-chat absolute z-10 h-full w-full border-e border-e-[#DBDDE1] bg-white">
      <div className="flex flex-col p-3">
        <div className="mb-3 flex items-center gap-3 text-lg font-bold">
          <ArrowLeft onClick={onClose} className="cursor-pointer" />
        </div>
        <input
          type="search"
          placeholder="Search"
          className="rounded-full border border-gray-300 px-4 py-2"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <div>
        {users?.map((user) => (
          <UserResult
            user={user}
            onUserClick={startChatWithUser}
            key={user.id}
          />
        ))}
        <div className="px-3">
          {!users && !searchInputDebounced && <LoadingUsers />}
          {!users && searchInputDebounced && 'Searching...'}
          {users?.length === 0 && <div>No users found</div>}
        </div>
        {!endOfPaginationReached && (
          <LoadingButton
            onClick={loadMoreUsers}
            className="m-auto mb-3 w-[80%]"
            loading={moreUsersLoading}
          >
            Load more users
          </LoadingButton>
        )}
      </div>
    </div>
  );
}

interface UserResultProps {
  user: UserResponse & { image?: string };
  onUserClick: (userId: string) => void;
}

function UserResult({ user, onUserClick }: UserResultProps) {
  return (
    <button
      className="mb-3 flex w-full items-center gap-2 p-2 hover:bg-[#e9eaed]"
      onClick={() => onUserClick(user.id)}
    >
      <span>
        <Avatar image={user.image} name={user.name || user.id} size={40} />
      </span>
      <span className="overflow-hidden text-ellipsis whitespace-normal">
        {user.name || user.id}
      </span>
      {user.online && <span className="text-xs text-green-500">Online</span>}
    </button>
  );
}
