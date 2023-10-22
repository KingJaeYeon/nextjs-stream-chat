import {
  Avatar,
  useChatContext,
  LoadingChannels as LoadingUsers,
} from "stream-chat-react";
import { useEffect, useState } from "react";
import { UserResource } from "@clerk/types";
import { Channel, UserResponse } from "stream-chat";
import { ArrowLeft } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";

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

  const [users, setUsers] = useState<UserResponse[]>();

  const [moreUsersLoading, setMoreUsersLoading] = useState(false);

  const [endOfPaginationReached, setEndOfPaginationReached] =
    useState<boolean>(false);

  const pageSize = 10;

  useEffect(() => {
    async function loadInitialUsers() {
      try {
        const response = await client.queryUsers(
          {
            id: { $ne: loggedInUser.id },
          },
          { id: 1 },
          { limit: pageSize + 1 }
        );
        setUsers(response.users.slice(0, pageSize));
        setEndOfPaginationReached(response.users.length <= pageSize);
      } catch (e) {
        console.log(e);
        alert("Error loading users ");
      }
    }
    loadInitialUsers();
  }, [client, loggedInUser.id]);

  async function loadMoreUsers() {
    setMoreUsersLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const lastUserId = users?.[users?.length - 1].id;
      if (!lastUserId) return;

      const response = await client.queryUsers(
        {
          $and: [{ id: { $ne: loggedInUser.id } }, { id: { $gt: lastUserId } }],
        },
        { id: 1 },
        { limit: pageSize + 1 }
      );
      setUsers([...users, ...response.users.slice(0, pageSize)]);
      setEndOfPaginationReached(response.users.length <= pageSize);
    } catch (error) {
      console.log(error);
      alert("Error loading users ");
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
      const channel = client.channel("messaging", {
        members: [userId, loggedInUser.id],
      });
      await channel.create();
      handleChannelSelected(channel);
    } catch (e) {
      console.log(e);
      alert("Error creating channel");
    }
  }

  return (
    <div className="str-chat absolute z-10 h-full w-full border-e border-e-[#DBDDE1] bg-white">
      <div className="flex items-center gap-3 p-3 text-lg font-bold">
        <ArrowLeft onClick={onClose} className="cursor-pointer" />
      </div>
      <div>
        {!users && <LoadingUsers />}
        {users?.map((user) => (
          <UserResult
            user={user}
            onUserClick={startChatWithUser}
            key={user.id}
          />
        ))}
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
