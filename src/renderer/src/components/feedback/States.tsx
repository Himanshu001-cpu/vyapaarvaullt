import { AlertCircle, Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground h-full min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-destructive h-full min-h-[200px]">
      <AlertCircle className="h-8 w-8 mb-4" />
      <p className="text-center font-medium mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message, icon: Icon }: { message: string, icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground h-full min-h-[200px]">
      {Icon && <Icon className="h-12 w-12 mb-4 opacity-50" />}
      <p className="text-center">{message}</p>
    </div>
  );
}
