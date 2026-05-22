import { useEffect, useState } from 'react';
import { LoadingState } from '../components/feedback/States';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    const response = await window.api.audit.list();
    if (response.success && response.data) {
      setLogs(response.data);
    }
    setIsLoading(false);
  };

  if (isLoading && logs.length === 0) return <LoadingState />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
      <p className="text-muted-foreground text-sm">Read-only view of all critical system events.</p>

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
         <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Entity Type</th>
                <th className="px-6 py-3">Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium uppercase text-xs">{log.action}</td>
                  <td className="px-6 py-4">{log.entity_type}</td>
                  <td className="px-6 py-4">{log.entity_id}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No logs found</td></tr>}
            </tbody>
          </table>
      </div>
    </div>
  );
}
