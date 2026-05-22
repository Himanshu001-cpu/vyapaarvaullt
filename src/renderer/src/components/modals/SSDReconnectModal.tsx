import { Database, AlertTriangle } from 'lucide-react';

export function SSDReconnectModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 animate-pulse" />

        <div className="flex flex-col items-center text-center">
          {/* Animated Outer Pulse Ring */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 mb-6">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/20 opacity-75 duration-1000" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-amber-500 shadow-lg shadow-red-500/20">
              <Database className="h-8 w-8 text-white animate-pulse" />
            </div>
            {/* Tiny Alert Badge */}
            <div className="absolute -bottom-1 -right-1 rounded-full bg-background border p-1 shadow-md">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Storage Disconnected
          </h2>

          {/* Subheading */}
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            The external portable SSD or USB drive containing the <strong className="text-foreground">VyapaarVault</strong> database has been unplugged or is unreachable.
          </p>

          {/* Connection Guide Box */}
          <div className="w-full rounded-xl bg-muted/50 border border-muted p-4 mb-6 text-left">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              How to resolve:
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Re-insert the USB/SSD drive into your system.</li>
              <li>Ensure the connection is secure and mount the drive if required.</li>
              <li>Keep this window open; the app will automatically reconnect.</li>
            </ul>
          </div>

          {/* Real-time status tracker */}
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground bg-muted/30 px-4 py-2.5 rounded-full border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-medium animate-pulse">
              Waiting for storage device reconnect...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
