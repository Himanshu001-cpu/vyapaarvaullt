import { useImportExportStore } from '../store/importExportStore';
import { useToast } from '../hooks/use-toast';
import { BarChart2 } from 'lucide-react';

export function ReportsPage() {
  const { exportData, isExporting } = useImportExportStore();
  const { toast } = useToast();

  const handleExport = async (type: string) => {
    const success = await exportData(type);
    if (success) {
      toast({ title: 'Export Successful', description: 'Report saved to exports folder.' });
    } else {
      toast({ title: 'Export Failed', description: 'Failed to generate report.' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <BarChart2 /> Reports
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-card border p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg mb-2">Daily Sales Report</h3>
            <p className="text-sm text-muted-foreground mb-4">Export all completed invoices for the current day to Excel.</p>
            <button
              disabled={isExporting}
              onClick={() => handleExport('dailySales')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50"
            >
              Export Excel
            </button>
         </div>

         <div className="bg-card border p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg mb-2">Monthly Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">Export a summary of all transactions and invoices for the current month.</p>
            <button
              disabled={isExporting}
              onClick={() => handleExport('monthlySummary')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50"
            >
              Export Excel
            </button>
         </div>

         <div className="bg-card border p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg mb-2">Pending Balance Report</h3>
            <p className="text-sm text-muted-foreground mb-4">Export a list of all customers and suppliers with non-zero balances.</p>
            <button
              disabled={isExporting}
              onClick={() => handleExport('pendingBalance')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50"
            >
              Export Excel
            </button>
         </div>
      </div>
    </div>
  );
}
