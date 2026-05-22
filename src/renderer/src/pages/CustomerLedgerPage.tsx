import { useEffect } from 'react';
import { usePartyStore } from '../store/partyStore';
import { useTransactionStore } from '../store/transactionStore';
import { LoadingState } from '../components/feedback/States';

export function CustomerLedgerPage({ partyId }: { partyId: number }) {
  const { parties, loadParties } = usePartyStore();
  const { transactions, loadTransactions } = useTransactionStore();

  const party = parties.find(p => p.id === partyId);

  useEffect(() => {
    loadParties();
    loadTransactions({ partyId });
  }, [partyId]);

  if (!party) return <LoadingState />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">{party.name}</h1>
           <p className="text-muted-foreground">Ledger & Transaction History</p>
        </div>
        <div className="text-right">
           <p className="text-sm text-muted-foreground">Current Balance</p>
           <p className={`text-2xl font-bold ${party.balance && party.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
              ₹{party.balance || 0}
           </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden mt-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4">{new Date(txn.created_at).toLocaleDateString()}</td>
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
      </div>
    </div>
  );
}
