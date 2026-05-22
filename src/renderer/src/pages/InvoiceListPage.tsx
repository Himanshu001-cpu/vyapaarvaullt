import { useEffect, useState } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { LoadingState, ErrorState, EmptyState } from '../components/feedback/States';
import { FileText, Download } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function InvoiceListPage() {
  const { invoices, isLoading, error, loadInvoices, voidInvoice } = useInvoiceStore();
  const { toast } = useToast();
  const [generatingPdf, setGeneratingPdf] = useState<number | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleVoid = async (id: number) => {
     if(confirm("Are you sure you want to void this invoice? This action cannot be undone.")) {
         const success = await voidInvoice(id, "Manual Void");
         if (success) {
             toast({ title: 'Invoice Voided', description: 'Stock and balances have been reverted.' });
         }
     }
  };

  const handleGeneratePdf = async (id: number) => {
    setGeneratingPdf(id);
    try {
       const resp = await window.api.invoice.generatePdf({ id });
       if (resp.success) {
         toast({ title: 'PDF Generated', description: `Saved to ${resp.data?.filePath}` });
       } else {
         toast({ title: 'PDF Failed', description: 'Failed to generate PDF' });
       }
    } catch(e) {
       toast({ title: 'PDF Failed', description: 'Unexpected error' });
    }
    setGeneratingPdf(null);
  };

  if (isLoading && invoices.length === 0) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={() => loadInvoices()} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <a
          href="#/invoices/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
        >
          Create Invoice
        </a>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        {invoices.length === 0 ? (
           <EmptyState message="No invoices found." icon={FileText} />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Party</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className={`border-b last:border-0 hover:bg-muted/50 ${inv.status === 'voided' ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 font-medium"><a href={`#/invoice/${inv.id}`} className="text-primary hover:underline">{inv.invoice_number}</a></td>
                  <td className="px-6 py-4">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{inv.party_name}</td>
                  <td className="px-6 py-4 font-semibold">₹{inv.total_amount}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${inv.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {inv.status.toUpperCase()}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                     <button
                       onClick={() => handleGeneratePdf(inv.id)}
                       disabled={generatingPdf === inv.id}
                       className="text-xs text-primary hover:underline flex items-center gap-1"
                     >
                       <Download className="w-3 h-3" />
                       {generatingPdf === inv.id ? 'Generating...' : 'PDF'}
                     </button>
                     {inv.status === 'completed' && (
                         <button onClick={() => handleVoid(inv.id)} className="text-xs text-destructive hover:underline">
                           Void
                         </button>
                     )}
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
