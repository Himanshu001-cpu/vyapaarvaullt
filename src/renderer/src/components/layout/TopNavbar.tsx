import { Menu, Moon, Sun, Search } from 'lucide-react';
import { useTheme } from '../theme-provider';
import { useSearchStore } from '../../store/searchStore';

interface TopNavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function TopNavbar({ isSidebarOpen, setIsSidebarOpen }: TopNavbarProps) {
  const { theme, setTheme } = useTheme();
  const { setModalOpen } = useSearchStore();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        <button
          onClick={() => setModalOpen(true)}
          className="hidden md:flex items-center text-sm text-muted-foreground bg-muted hover:bg-accent hover:text-accent-foreground border px-3 py-1.5 rounded-md w-64 justify-between transition-colors"
        >
          <span className="flex items-center gap-2"><Search className="h-4 w-4" /> Search...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

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
