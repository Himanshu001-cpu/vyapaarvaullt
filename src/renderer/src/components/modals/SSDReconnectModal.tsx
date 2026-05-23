import { HardDrive } from 'lucide-react';

export function SSDReconnectModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <HardDrive className="h-8 w-8 animate-pulse" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Storage Device Disconnected</h2>
        <p className="mb-6 text-muted-foreground text-sm leading-relaxed">
          The Vault storage device has been disconnected. To prevent data corruption, database access has been temporarily suspended. Please plug the device back in to resume.
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted py-2 px-3 rounded-lg border">
            <span className="h-2 w-2 rounded-full bg-destructive animate-ping"></span>
            Waiting for storage device connection...
          </div>
        </div>
      </div>
    </div>
  );
}
