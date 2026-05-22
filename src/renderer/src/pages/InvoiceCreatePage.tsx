import { useState, useEffect } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { usePartyStore } from '../store/partyStore';
import { useInventoryStore } from '../store/inventoryStore';
import { useToast } from '../hooks/use-toast';

export function InvoiceCreatePage() {
  const { createInvoice, isLoading } = useInvoiceStore();
  const { parties, loadParties } = usePartyStore();
  const { products, loadProducts } = useInventoryStore();
  const { toast } = useToast();

  const [selectedParty, setSelectedParty] = useState<number | ''>('');
  const [items, setItems] = useState<{productId: number, quantity: number, price: number}[]>([]);
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  useEffect(() => {
    loadParties('customer');
    loadProducts();
  }, []);

  const addItem = (productId: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    setItems([...items, { productId, quantity: 1, price: prod.selling_price }]);
  };

  const updateItemQty = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = qty;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const total = subtotal - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParty || items.length === 0) return;

    const payload = {
      partyId: Number(selectedParty),
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity, sellingPrice: i.price })),
      discount,
      amountPaid
    };

    const result = await createInvoice(payload);
    if (result.success) {
      toast({ title: 'Invoice Created', description: 'Invoice has been successfully recorded.' });
      window.location.hash = '#/invoices';
    }
  };

  return (
    <div className="flex gap-6 max-w-6xl mx-auto">
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>

        <div className="bg-card border rounded-xl p-4">
          <label className="block text-sm font-medium mb-1">Select Customer</label>
          <select
            value={selectedParty}
            onChange={e => setSelectedParty(Number(e.target.value))}
            className="w-full p-2 bg-input border rounded-md"
            required
          >
            <option value="">-- Choose Customer --</option>
            {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <label className="block text-sm font-medium mb-2">Add Products</label>
          <div className="flex flex-wrap gap-2 mb-4">
             {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => addItem(p.id)}
                  className="px-3 py-1 border rounded-md bg-secondary text-secondary-foreground text-sm hover:opacity-80"
                >
                  {p.name} (₹{p.selling_price})
                </button>
             ))}
          </div>

          <table className="w-full text-sm mt-4">
             <thead className="bg-muted">
                <tr>
                   <th className="p-2 text-left">Product</th>
                   <th className="p-2 w-24">Qty</th>
                   <th className="p-2 text-right">Price</th>
                   <th className="p-2 text-right">Total</th>
                   <th className="p-2 w-10"></th>
                </tr>
             </thead>
             <tbody>
                {items.map((item, idx) => {
                   const p = products.find(x => x.id === item.productId);
                   return (
                     <tr key={idx} className="border-b">
                        <td className="p-2">{p?.name}</td>
                        <td className="p-2">
                          <input type="number" min="1" value={item.quantity} onChange={e => updateItemQty(idx, Number(e.target.value))} className="w-full p-1 border rounded" />
                        </td>
                        <td className="p-2 text-right">₹{item.price}</td>
                        <td className="p-2 text-right font-medium">₹{item.quantity * item.price}</td>
                        <td className="p-2 text-center text-destructive cursor-pointer hover:bg-destructive/10" onClick={() => removeItem(idx)}>X</td>
                     </tr>
                   )
                })}
                {items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No items added yet.</td></tr>}
             </tbody>
          </table>
        </div>
      </div>

      <div className="w-80 flex flex-col gap-4">
         <div className="bg-card border rounded-xl p-4 sticky top-4">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Summary</h3>
            <div className="flex justify-between mb-2"><span>Subtotal:</span> <span>₹{subtotal}</span></div>
            <div className="flex justify-between items-center mb-2">
               <span>Discount:</span>
               <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-20 p-1 border rounded text-right" />
            </div>
            <div className="flex justify-between font-bold text-xl mt-4 pt-2 border-t">
               <span>Total:</span> <span>₹{total}</span>
            </div>

            <div className="mt-6">
               <label className="block text-sm font-medium mb-1">Amount Paid Now</label>
               <input type="number" value={amountPaid} onChange={e => setAmountPaid(Number(e.target.value))} className="w-full p-2 bg-input border rounded-md" />
               <p className="text-xs text-muted-foreground mt-1 text-right">Pending: ₹{total - amountPaid}</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !selectedParty || items.length === 0}
              className="w-full py-3 mt-6 bg-primary text-primary-foreground font-bold rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Complete Invoice'}
            </button>
         </div>
      </div>
    </div>
  );
}
