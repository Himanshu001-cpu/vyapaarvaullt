import { useState, useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { ThemeProvider } from './components/theme-provider'
import { PinLockPage } from './pages/PinLockPage'
import { CustomersPage } from './pages/CustomersPage'
import { SuppliersPage } from './pages/SuppliersPage'
import { InventoryPage } from './pages/InventoryPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { InvoiceListPage } from './pages/InvoiceListPage'
import { InvoiceCreatePage } from './pages/InvoiceCreatePage'
import { CustomerLedgerPage } from './pages/CustomerLedgerPage'
import { Toaster } from './components/feedback/Toaster'

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/')

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (!unlocked) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="vyapaarvault-ui-theme">
        <PinLockPage onUnlock={() => setUnlocked(true)} />
      </ThemeProvider>
    )
  }

  const renderPage = () => {
    if (currentRoute.startsWith('#/party/')) {
        const id = parseInt(currentRoute.split('/')[2], 10);
        return <CustomerLedgerPage partyId={id} />;
    }

    switch (currentRoute) {
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
      default:
        return (
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="font-semibold leading-none tracking-tight">VyapaarVault Portable</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Phase 4 (Transactions & Invoices) is integrated. Navigate the sidebar to test full invoice creation and ledger workflows.
                </p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vyapaarvault-ui-theme">
      <AppLayout>
        {renderPage()}
        <Toaster />
      </AppLayout>
    </ThemeProvider>
  )
}
