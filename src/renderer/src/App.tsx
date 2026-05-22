import { useState, useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { ThemeProvider } from './components/theme-provider'
import { PinLockPage } from './pages/PinLockPage'
import { CustomersPage } from './pages/CustomersPage'
import { SuppliersPage } from './pages/SuppliersPage'
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
    switch (currentRoute) {
      case '#/parties':
      case '#/customers':
        return <CustomersPage />
      case '#/suppliers':
        return <SuppliersPage />
      default:
        return (
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h3 className="font-semibold leading-none tracking-tight">VyapaarVault Portable</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Phase 2 (Party Management) is integrated. Navigate to Customers or Suppliers to manage your contacts.
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
