import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoadingState } from '../components/feedback/States';

export function PinLockPage({ onUnlock }: { onUnlock: () => void }) {
  const { isPinSet, checkPinSet, setupPin, login, isLoading, error } = useAuthStore();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    checkPinSet();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4 || pin.length > 6) return;
    if (pin !== confirmPin) return;

    const success = await setupPin(pin);
    if (success) {
      onUnlock();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4 || pin.length > 6) return;

    const success = await login(pin);
    if (success) {
      onUnlock();
    } else {
      setPin(''); // clear on error
    }
  };

  if (isLoading && isPinSet === null) {
    return <LoadingState message="Checking security settings..." />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 bg-card text-card-foreground rounded-xl shadow-lg border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">VyapaarVault</h1>
          <p className="text-muted-foreground mt-2">
            {isPinSet ? 'Enter your PIN to unlock' : 'Create a new PIN to secure your data'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded text-sm text-center">
            {error}
          </div>
        )}

        {isPinSet ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="w-full text-center tracking-[1em] text-2xl p-4 bg-input border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={pin.length < 4 || isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? 'Verifying...' : 'Unlock'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New PIN (4-6 digits)</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="w-full text-center tracking-[1em] text-xl p-3 bg-input border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm PIN</label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="w-full text-center tracking-[1em] text-xl p-3 bg-input border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {pin && confirmPin && pin !== confirmPin && (
              <p className="text-destructive text-sm text-center">PINs do not match</p>
            )}
            <button
              type="submit"
              disabled={pin.length < 4 || pin !== confirmPin || isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? 'Setting up...' : 'Set PIN'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
