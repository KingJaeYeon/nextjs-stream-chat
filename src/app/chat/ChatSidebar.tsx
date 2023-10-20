import MenuBar from "@/app/chat/MenuBar";
import { ChannelList, ChannelPreviewMessenger } from "stream-chat-react";
import { UserResource } from "@clerk/types";
import { ChannelPreviewUIComponentProps } from "stream-chat-react/dist/components/ChannelPreview/ChannelPreview";
import { useCallback, useEffect, useState } from "react";
import UserMenu from "@/app/chat/UserMenu";

interface ChatSidebarProps {
  user: UserResource;
  show: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ user, show, onClose }: ChatSidebarProps) {
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);

  useEffect(() => {
    if (!show) setUsersMenuOpen(false);
  }, [show]);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => {
      return (
        <ChannelPreviewMessenger
          {...props}
          onSelect={() => {
            props.setActiveChannel?.(props.channel, props.watchers);
            onClose();
          }}
        />
      );
    },
    [onClose]
  );

  return (
    <div
      className={`relative w-full flex-col md:max-w-[360px] ${
        show ? "flex" : "hidden"
      }`}
    >
      {usersMenuOpen && (
        <UserMenu
          loggedInUser={user}
          onClose={() => setUsersMenuOpen(false)}
          onChannelSelect={() => {
            setUsersMenuOpen(false);
            onClose();
          }}
        />
      )}
      <MenuBar onUserMenuClick={() => setUsersMenuOpen(true)} />
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [user.id] },
        }}
        sort={{ last_message_at: -1 }}
        options={{ state: true, presence: true, limit: 10 }}
        showChannelSearch
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: { members: { $in: [user.id] } },
            },
          },
        }}
        Preview={ChannelPreviewCustom}
      />
    </div>
  );
}
