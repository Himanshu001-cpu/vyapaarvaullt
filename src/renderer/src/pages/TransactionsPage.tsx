import { useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { LoadingState, ErrorState, EmptyState } from '../components/feedback/States';
import { CreditCard } from 'lucide-react';

export function TransactionsPage() {
  const { transactions, isLoading, error, loadTransactions } = useTransactionStore();

  useEffect(() => {
    loadTransactions();
  }, []);

  if (isLoading && transactions.length === 0) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={() => loadTransactions()} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        {transactions.length === 0 ? (
           <EmptyState message="No transactions found." icon={CreditCard} />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Party</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4">{new Date(txn.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{txn.party_name || `ID: ${txn.party_id}`}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${txn.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {txn.type.toUpperCase()}
                     </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">₹{txn.amount}</td>
                  <td className="px-6 py-4 text-muted-foreground">{txn.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
