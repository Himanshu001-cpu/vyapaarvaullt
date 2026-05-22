import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { LoadingState } from '../components/feedback/States';
import { useToast } from '../hooks/use-toast';
import { useImportExportStore } from '../store/importExportStore';

export function SettingsPage() {
  const { settings, loadSettings, updateSettings, isLoading } = useSettingsStore();
  const { isImporting, importData } = useImportExportStore();
  const { toast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [ssdRoot, setSsdRoot] = useState('');
  const [importPath, setImportPath] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
       setBusinessName(settings.business_name || '');
       setSsdRoot(settings.ssdRoot || '');
    }
  }, [settings]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateSettings({ business_name: businessName, ssdRoot });
    if (success) {
      toast({ title: 'Settings Saved', description: 'General settings updated.' });
    }
  };

  const handleCreateBackup = async () => {
    try {
      const resp = await window.api.backup.create();
      if (resp.success) {
         toast({ title: 'Backup Created', description: `Saved to ${resp.data?.filePath}` });
      } else {
         toast({ title: 'Backup Failed', description: resp.error?.message || 'Error creating backup.' });
      }
    } catch(e) {
      toast({ title: 'Backup Failed', description: 'Unexpected error.' });
    }
  };

  const handleImport = async () => {
     if(!importPath) return;
     const success = await importData(importPath, 'customers', {});
     if (success) {
        toast({ title: 'Import Complete', description: 'Data successfully imported.' });
        setImportPath('');
     } else {
        toast({ title: 'Import Failed', description: 'Error importing data.' });
     }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
         <h3 className="text-xl font-semibold mb-4">General Configuration</h3>
         <form onSubmit={handleSaveGeneral} className="flex flex-col gap-4">
            <div>
               <label className="block text-sm font-medium mb-1">Business Name</label>
               <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full p-2 bg-input border rounded-md" />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Portable SSD Root Path (Read-only)</label>
               <input type="text" value={ssdRoot} disabled className="w-full p-2 bg-muted border rounded-md opacity-70" />
               <p className="text-xs text-muted-foreground mt-1">This path is auto-detected based on executable location.</p>
            </div>
            <button type="submit" className="self-end px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Save General Settings</button>
         </form>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
         <h3 className="text-xl font-semibold mb-4">Data Management</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border p-4 rounded-lg">
               <h4 className="font-medium mb-2">Manual Backup</h4>
               <p className="text-sm text-muted-foreground mb-4">Create a ZIP backup of the entire SQLite database to the backups folder.</p>
               <button onClick={handleCreateBackup} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm w-full">
                  Create Backup Now
               </button>
            </div>
            <div className="border p-4 rounded-lg">
               <h4 className="font-medium mb-2">Import Customers (Excel)</h4>
               <p className="text-sm text-muted-foreground mb-4">Provide absolute path to .xlsx file for import.</p>
               <div className="flex gap-2">
                  <input type="text" placeholder="/path/to/file.xlsx" value={importPath} onChange={e => setImportPath(e.target.value)} className="w-full p-2 bg-input border rounded-md text-sm" />
                  <button onClick={handleImport} disabled={isImporting || !importPath} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50">
                     Import
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
