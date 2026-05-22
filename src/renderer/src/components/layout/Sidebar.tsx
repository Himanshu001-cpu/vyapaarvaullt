import { Home, Users, UserSquare2, Package, FileText, CreditCard, BarChart2, Settings, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const onHashChange = () => setCurrentHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '#/' },
    { icon: Users, label: 'Customers', href: '#/customers' },
    { icon: UserSquare2, label: 'Suppliers', href: '#/suppliers' },
    { icon: Package, label: 'Inventory', href: '#/inventory' },
    { icon: FileText, label: 'Invoices', href: '#/invoices' },
    { icon: CreditCard, label: 'Transactions', href: '#/transactions' },
    { icon: BarChart2, label: 'Reports', href: '#/reports' },
    { icon: Settings, label: 'Settings', href: '#/settings' },
    { icon: Archive, label: 'Recycle Bin', href: '#/recycle-bin' },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center border-b px-4 font-bold text-primary truncate">
        {isOpen ? "VyapaarVault" : "VV"}
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = currentHash === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                !isOpen && "justify-center px-0"
              )}
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
