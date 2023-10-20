"use client";
import { Chat, LoadingIndicator } from "stream-chat-react";
import useInitializeChatClient from "@/app/chat/useInitializeChatClient";
import { useUser } from "@clerk/nextjs";
import ChatSidebar from "@/app/chat/ChatSidebar";
import ChatChannel from "@/app/chat/ChatChannel";
import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import useWindowSize from "@/hooks/useWindowSize";
import { mdBreakpoint } from "@/utils/tailwind";

export default function ChatPage() {
  const chatClient = useInitializeChatClient();
  const { user } = useUser();

  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
  const windowSize = useWindowSize();
  const isLargeScreen = windowSize.width >= mdBreakpoint;

  useEffect(() => {
    if (windowSize.width >= mdBreakpoint) setChatSidebarOpen(false);
  }, [windowSize.width]);

  const handleSidebarOnClose = useCallback(() => {
    setChatSidebarOpen(false);
  }, []);

  if (!chatClient || !user) {
    return (
      <div className="flex h-screen items-center justify-center ">
        <LoadingIndicator size={40} />
      </div>
    );
  }

  return (
    <div className="bg-gary-100 x1:px-20 x1:py-8 h-screen">
      <div className="m-auto h-full min-w-[350px] max-w-[1600px] shadow-sm">
        <Chat client={chatClient}>
          <div className="flex justify-center border-b border-b-[#DBDDE1] p-3 md:hidden">
            <button onClick={() => setChatSidebarOpen((x) => !x)}>
              {!chatSidebarOpen ? (
                <span className="flex items-center gap-1">
                  <Menu />
                </span>
              ) : (
                <X />
              )}
            </button>
          </div>
          <div className="flex h-full flex-row">
            <ChatSidebar
              user={user}
              show={isLargeScreen || chatSidebarOpen}
              onClose={handleSidebarOnClose}
            />
            <ChatChannel
              show={isLargeScreen || !chatSidebarOpen}
              hideChannelOnThread={!isLargeScreen}
            />
          </div>
        </Chat>
      </div>
    </div>
  );
}
