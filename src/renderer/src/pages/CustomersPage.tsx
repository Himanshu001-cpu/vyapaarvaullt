import { useEffect, useState } from 'react';
import { usePartyStore } from '../store/partyStore';
import { LoadingState, ErrorState, EmptyState } from '../components/feedback/States';
import { Users } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function CustomersPage() {
  const { parties, isLoading, error, loadParties, createParty } = usePartyStore();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadParties('customer');
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const success = await createParty({ name: newName, type: 'customer' });
    if (success) {
      toast({ title: 'Customer Created', description: `${newName} has been added.` });
      setNewName('');
      setIsCreating(false);
      loadParties('customer');
    }
  };

  if (isLoading && parties.length === 0) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={() => loadParties('customer')} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
        >
          Add Customer
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 bg-card border rounded-md flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full p-2 bg-input border rounded-md"
              autoFocus
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Save</button>
          <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm">Cancel</button>
        </form>
      )}

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        {parties.length === 0 ? (
           <EmptyState message="No customers found. Add your first customer above." icon={Users} />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((party) => (
                <tr key={party.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{party.name}</td>
                  <td className="px-6 py-4">{party.phone || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <a href={`#/party/${party.id}`} className="text-primary hover:underline">View Ledger</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
