import { useEffect, useState } from 'react';
import { useInvoiceStore, Invoice } from '../store/invoiceStore';
import { LoadingState, ErrorState } from '../components/feedback/States';
import { Download } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function InvoiceDetailPage({ invoiceId }: { invoiceId: number }) {
  const { getInvoice, voidInvoice, isLoading, error } = useInvoiceStore();
  const [data, setData] = useState<{ invoice: Invoice, items: any[], party: any } | null>(null);
  const { toast } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    loadData();
  }, [invoiceId]);

  const loadData = async () => {
     const result = await getInvoice(invoiceId);
     if (result) setData(result as any);
  };

  const handleVoid = async () => {
     if(confirm("Are you sure you want to void this invoice? This action cannot be undone.")) {
         const success = await voidInvoice(invoiceId, "Manual Void");
         if (success) {
             toast({ title: 'Invoice Voided', description: 'Stock and balances have been reverted.' });
             loadData();
         }
     }
  };

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
       const resp = await window.api.invoice.generatePdf({ id: invoiceId });
       if (resp.success) {
         toast({ title: 'PDF Generated', description: `Saved to ${resp.data?.filePath}` });
       } else {
         toast({ title: 'PDF Failed', description: 'Failed to generate PDF' });
       }
    } catch(e) {
       toast({ title: 'PDF Failed', description: 'Unexpected error' });
    }
    setGeneratingPdf(false);
  };

  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={loadData} />;
  if (!data) return null;

  const { invoice, items, party } = data;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Invoice {invoice.invoice_number}</h1>
           <p className="text-muted-foreground">{new Date(invoice.created_at).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
           <button
             onClick={handleGeneratePdf}
             disabled={generatingPdf}
             className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm flex items-center gap-2"
           >
             <Download className="w-4 h-4" /> {generatingPdf ? 'Generating...' : 'Print PDF'}
           </button>
           {invoice.status === 'completed' && (
             <button onClick={handleVoid} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm">
               Void Invoice
             </button>
           )}
        </div>
      </div>

      <div className="bg-card border p-6 rounded-xl shadow-sm flex flex-col gap-6">
         {invoice.status === 'voided' && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md font-bold text-center border border-red-200">
               THIS INVOICE HAS BEEN VOIDED
            </div>
         )}

         <div className="flex justify-between border-b pb-4">
            <div>
               <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider mb-2">Billed To</h3>
               <p className="font-bold text-lg">{party.name}</p>
               <p>{party.phone}</p>
               <p>{party.address}</p>
            </div>
         </div>

         <table className="w-full text-sm text-left">
            <thead className="bg-muted border-y text-muted-foreground">
               <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Total</th>
               </tr>
            </thead>
            <tbody className="divide-y">
               {items.map((item: any, idx: number) => (
                  <tr key={idx}>
                     <td className="px-4 py-3">{item.product_name_snapshot}</td>
                     <td className="px-4 py-3">{item.quantity} {item.unit_snapshot}</td>
                     <td className="px-4 py-3 text-right">₹{item.selling_price_snapshot}</td>
                     <td className="px-4 py-3 text-right font-medium">₹{item.total}</td>
                  </tr>
               ))}
            </tbody>
         </table>

         <div className="flex justify-end pt-4 border-t">
            <div className="w-64 flex flex-col gap-2">
               <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{invoice.subtotal}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>- ₹{invoice.discount}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-muted-foreground">Extra Charges</span>
                  <span>+ ₹{invoice.extra_charges}</span>
               </div>
               <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{invoice.total_amount}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
