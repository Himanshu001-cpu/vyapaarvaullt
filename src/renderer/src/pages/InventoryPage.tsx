import { useEffect, useState } from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import { LoadingState, ErrorState, EmptyState } from '../components/feedback/States';
import { Package, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { CategoryManager } from '../components/inventory/CategoryManager';
import { UnitManager } from '../components/inventory/UnitManager';
import { UnitConversionEditor } from '../components/inventory/UnitConversionEditor';

interface BaseLookup { id: number; name: string; }

export function InventoryPage() {
  const { products, isLoading, error, loadProducts, createProduct, adjustStock, deleteProduct } = useInventoryStore();
  const { toast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [showMetadataManagers, setShowMetadataManagers] = useState(false);

  const [newName, setNewName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [baseUnitId, setBaseUnitId] = useState<number | ''>('');

  const [categories, setCategories] = useState<BaseLookup[]>([]);
  const [units, setUnits] = useState<BaseLookup[]>([]);

  useEffect(() => {
    loadProducts();
    loadLookups();
  }, []);

  const loadLookups = async () => {
    const [catResp, unitResp] = await Promise.all([
      window.api.category.list(),
      window.api.unit.list()
    ]);
    if (catResp.success) setCategories(catResp.data as BaseLookup[]);
    if (unitResp.success) setUnits(unitResp.data as BaseLookup[]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !baseUnitId) return;

    const success = await createProduct({
      name: newName,
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      category_id: categoryId ? Number(categoryId) : null,
      base_unit_id: Number(baseUnitId)
    });

    if (success) {
      toast({ title: 'Product Created', description: `${newName} has been added to inventory.` });
      setNewName('');
      setPurchasePrice(0);
      setSellingPrice(0);
      setCategoryId('');
      setBaseUnitId('');
      setIsCreating(false);
      loadProducts();
    }
  };

  const handleAdjustStock = async (id: number, change: number) => {
     const success = await adjustStock(id, change, "Manual adjustment");
     if (success) {
         toast({ title: 'Stock Adjusted', description: `Stock adjusted by ${change}.` });
     }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const success = await deleteProduct(id);
      if (success) {
        toast({ title: 'Product Deleted', description: `${name} has been moved to the Recycle Bin.` });
        loadProducts();
      } else {
        toast({ title: 'Delete Failed', description: 'Failed to delete product.' });
      }
    }
  };

  if (isLoading && products.length === 0) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={() => loadProducts()} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowMetadataManagers(!showMetadataManagers); loadLookups(); }}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:opacity-90"
          >
            {showMetadataManagers ? 'Hide Metadata Managers' : 'Manage Categories & Units'}
          </button>
          <button
            onClick={() => { setIsCreating(true); loadLookups(); }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
          >
            Add Product
          </button>
        </div>
      </div>

      {showMetadataManagers && (
        <div className="grid grid-cols-2 gap-4">
          <CategoryManager />
          <UnitManager />
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 bg-card border rounded-md grid grid-cols-4 gap-4 items-end">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full p-2 bg-input border rounded-md"
              autoFocus
              required
            />
          </div>
          <div>
             <label className="block text-sm font-medium mb-1">Category</label>
             <select value={categoryId} onChange={e => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))} className="w-full p-2 bg-input border rounded-md">
               <option value="">None</option>
               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium mb-1">Base Unit</label>
             <select value={baseUnitId} onChange={e => setBaseUnitId(e.target.value === "" ? "" : Number(e.target.value))} className="w-full p-2 bg-input border rounded-md" required>
               <option value="">Select Unit</option>
               {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
             </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Price</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={e => setPurchasePrice(Number(e.target.value))}
              className="w-full p-2 bg-input border rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selling Price</label>
            <input
              type="number"
              value={sellingPrice}
              onChange={e => setSellingPrice(Number(e.target.value))}
              className="w-full p-2 bg-input border rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          <div className="col-span-2 flex justify-end gap-2 mt-2">
             <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm">Cancel</button>
             <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Save Product</button>
          </div>
        </form>
      )}

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        {products.length === 0 ? (
           <EmptyState message="No products in inventory. Add your first product." icon={Package} />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">
                     {product.name}
                     {selectedProductId === product.id && <UnitConversionEditor productId={product.id} />}
                  </td>
                  <td className="px-6 py-4">{product.category_name || '-'}</td>
                  <td className="px-6 py-4">
                     <span className={`font-semibold ${product.current_quantity <= (product.low_stock_threshold || 0) ? 'text-destructive' : ''}`}>
                       {product.current_quantity} {product.base_unit_name}
                     </span>
                  </td>
                  <td className="px-6 py-4">₹{product.selling_price}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 mb-2">
                      <button onClick={() => handleAdjustStock(product.id, 1)} className="px-2 py-1 bg-secondary rounded text-xs">+</button>
                      <button onClick={() => handleAdjustStock(product.id, -1)} className="px-2 py-1 bg-secondary rounded text-xs">-</button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="px-2 py-1 bg-destructive/10 text-destructive rounded text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedProductId(selectedProductId === product.id ? null : product.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      {selectedProductId === product.id ? 'Hide Conversions' : 'Manage Conversions'}
                    </button>
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
