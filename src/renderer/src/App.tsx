import { InvoiceDetailPage } from './pages/InvoiceDetailPage';
import { useState, useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { ThemeProvider } from './components/theme-provider'
import { PinLockPage } from './pages/PinLockPage'
import { DashboardPage } from './pages/DashboardPage'
import { CustomersPage } from './pages/CustomersPage'
import { SuppliersPage } from './pages/SuppliersPage'
import { InventoryPage } from './pages/InventoryPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { InvoiceListPage } from './pages/InvoiceListPage'
import { InvoiceCreatePage } from './pages/InvoiceCreatePage'
import { CustomerLedgerPage } from './pages/CustomerLedgerPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { RecycleBinPage } from './pages/RecycleBinPage'
import { Toaster } from './components/feedback/Toaster'
import { SearchModal } from './components/search/SearchModal'
import { SSDReconnectModal } from './components/modals/SSDReconnectModal';

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [isStorageDisconnected, setIsStorageDisconnected] = useState(false)
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/')

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/')
    }
    window.addEventListener('hashchange', handleHashChange)
    const removeListener = window.api.onStorageStatus((status: any) => {
      setIsStorageDisconnected(status.disconnected);
    });
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      removeListener();
    }
  }, [])

  if (!unlocked) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="vyapaarvault-ui-theme">
        <PinLockPage onUnlock={() => setUnlocked(true)} />
      </ThemeProvider>
    )
  }

  const renderPage = () => {
    if (currentRoute.startsWith('#/invoice/')) {
        const id = parseInt(currentRoute.split('/')[2], 10);
        return <InvoiceDetailPage invoiceId={id} />;
    }

    if (currentRoute.startsWith('#/party/')) {
        const id = parseInt(currentRoute.split('/')[2], 10);
        return <CustomerLedgerPage partyId={id} />;
    }

    switch (currentRoute) {
      case '#/':
        return <DashboardPage />
      case '#/parties':
      case '#/customers':
        return <CustomersPage />
      case '#/suppliers':
        return <SuppliersPage />
      case '#/inventory':
        return <InventoryPage />
      case '#/transactions':
        return <TransactionsPage />
      case '#/invoices':
        return <InvoiceListPage />
      case '#/invoices/new':
        return <InvoiceCreatePage />
      case '#/reports':
        return <ReportsPage />
      case '#/settings':
        return <SettingsPage />
      case '#/audit-logs':
        return <AuditLogsPage />
      case '#/recycle-bin':
        return <RecycleBinPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vyapaarvault-ui-theme">
      <AppLayout>
        {renderPage()}
        <Toaster />
        <SearchModal />
        {isStorageDisconnected && <SSDReconnectModal />}
      </AppLayout>
    </ThemeProvider>
  )
}
