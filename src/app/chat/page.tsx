import { UserButton } from "@clerk/nextjs";

export default function ChatPage() {
  return (
    <div>
      this is chat
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
