import { UserButton } from "@clerk/nextjs";
import { Moon, Sun, Users } from "lucide-react";
import { useTheme } from "@/app/ThemeProvider";

interface MenuBarProps {
  onUserMenuClick: () => void;
}

export default function MenuBar({ onUserMenuClick }: MenuBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-e border-e-[#DBDDE1] bg-white p-3">
      <UserButton afterSignOutUrl="/" />
      <div className="flex gap-6">
        <span title="show users">
          <Users className="cursor-pointer" onClick={onUserMenuClick} />
        </span>
        <ThemeToggleButton />
      </div>
    </div>
  );
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  if (theme === "dark") {
    return (
      <span title="Enable light theme">
        <Moon className="cursor-pointer" onClick={() => setTheme("light")} />
      </span>
    );
  }

  return (
    <span title="Enable dark theme">
      <Sun className="cursor-pointer" onClick={() => setTheme("dark")} />
    </span>
  );
}
