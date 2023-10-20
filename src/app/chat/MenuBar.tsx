import { UserButton } from "@clerk/nextjs";

export default function MenuBar() {
  return (
    <div>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
