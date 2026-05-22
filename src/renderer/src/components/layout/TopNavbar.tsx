import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme-provider';

interface TopNavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function TopNavbar({ isSidebarOpen, setIsSidebarOpen }: TopNavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle Theme</span>
        </button>
      </div>
    </header>
  );
}
