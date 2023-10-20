"use client";
import { StreamChat } from "stream-chat";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

const userId = "user_2X0U1dDmMRvMnjFCB9SEXgb1Q0n";

const chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

chatClient.connectUser(
  {
    id: userId,
    name: "재연 박",
  },
  //process.env.STREAM_SECRET  + userId => this is the token
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl8yWDBVMWREbU1Sdk1uakZDQjlTRVhnYjFRMG4ifQ.psuC_A9LY0xZIwmudovPBOM6HrH3XOZqNPBCBrFmJ80"
);

const channel = chatClient.channel("messaging", "channel_1", {
  name: "Channel #1",
  members: [userId],
});

export default function ChatPage() {
  return (
    <div>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}
