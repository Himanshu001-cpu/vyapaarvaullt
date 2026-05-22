import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { LoadingState, ErrorState } from '../components/feedback/States';

export function DashboardPage() {
  const { data, isLoading, error, loadDashboard } = useDashboardStore();

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={() => loadDashboard()} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border shadow-sm">
           <h3 className="text-sm font-medium text-muted-foreground mb-1">Monthly Revenue</h3>
           <p className="text-2xl font-bold">₹{data.monthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border shadow-sm">
           <h3 className="text-sm font-medium text-muted-foreground mb-1">Pending Receivables</h3>
           <p className="text-2xl font-bold text-green-600">₹{data.pendingReceivables.toLocaleString()}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border shadow-sm">
           <h3 className="text-sm font-medium text-muted-foreground mb-1">Pending Payables</h3>
           <p className="text-2xl font-bold text-red-600">₹{data.pendingPayables.toLocaleString()}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border shadow-sm">
           <h3 className="text-sm font-medium text-muted-foreground mb-1">Low Stock Items</h3>
           <p className="text-2xl font-bold">{data.lowStockCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-card border rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-4 border-b pb-2">Recent Invoices</h3>
            {data.recentInvoices.length === 0 ? <p className="text-sm text-muted-foreground">No recent invoices.</p> : (
              <ul className="divide-y text-sm">
                {data.recentInvoices.map((inv, i) => (
                  <li key={i} className="py-2 flex justify-between">
                     <span>{inv.invoice_number} ({inv.party_name})</span>
                     <span className="font-medium">₹{inv.total_amount}</span>
                  </li>
                ))}
              </ul>
            )}
         </div>

         <div className="bg-card border rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-4 border-b pb-2">Recent Transactions</h3>
            {data.recentTransactions.length === 0 ? <p className="text-sm text-muted-foreground">No recent transactions.</p> : (
              <ul className="divide-y text-sm">
                {data.recentTransactions.map((txn, i) => (
                  <li key={i} className="py-2 flex justify-between">
                     <span>{txn.party_name} - {new Date(txn.created_at).toLocaleDateString()}</span>
                     <span className={`font-medium ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                       {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                     </span>
                  </li>
                ))}
              </ul>
            )}
         </div>
      </div>
    </div>
  );
}
