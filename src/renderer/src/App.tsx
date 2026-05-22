import { AppLayout } from './components/layout/AppLayout'
import { ThemeProvider } from './components/theme-provider'

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vyapaarvault-ui-theme">
      <AppLayout>
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="font-semibold leading-none tracking-tight">VyapaarVault Portable</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Phase 0 setup is now complete with all basic layout components, full database schema, and directory creation mechanisms.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    </ThemeProvider>
  )
}
