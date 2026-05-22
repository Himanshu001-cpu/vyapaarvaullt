import { useState, useEffect } from 'react';
import { LoadingState, EmptyState } from '../components/feedback/States';
import { Archive } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function RecycleBinPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadDeletedItems = async () => {
    setIsLoading(true);
    // MVP implementation: just fetch deleted parties and products
    const [partiesResp, productsResp] = await Promise.all([
      window.api.party.list({ includeDeleted: true }),
      window.api.inventory.list({ includeDeleted: true })
    ]);

    const deletedItems: any[] = [];

    if (partiesResp.success && partiesResp.data) {
       partiesResp.data.data
         .filter((p: any) => p.deleted_at)
         .forEach((p: any) => deletedItems.push({ ...p, _module: 'party' }));
    }

    if (productsResp.success && productsResp.data) {
       productsResp.data.data
         .filter((p: any) => p.deleted_at)
         .forEach((p: any) => deletedItems.push({ ...p, _module: 'inventory' }));
    }

    setItems(deletedItems.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()));
    setIsLoading(false);
  };

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const handleRestore = async (item: any) => {
     let success = false;
     if (item._module === 'party') {
        const resp = await window.api.party.restore({ id: item.id });
        success = resp.success;
     } else if (item._module === 'inventory') {
        const resp = await window.api.inventory.restore({ id: item.id });
        success = resp.success;
     }

     if (success) {
        toast({ title: 'Item Restored', description: `${item.name} has been restored.` });
        loadDeletedItems();
     } else {
        toast({ title: 'Restore Failed', description: 'Failed to restore item.' });
     }
  };

  if (isLoading && items.length === 0) return <LoadingState />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Recycle Bin</h1>

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden mt-4">
        {items.length === 0 ? (
           <EmptyState message="Recycle bin is empty." icon={Archive} />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Deleted Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4 uppercase text-xs font-semibold">{item._module}</td>
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4">{new Date(item.deleted_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                     <button onClick={() => handleRestore(item)} className="text-primary hover:underline text-xs">Restore</button>
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
