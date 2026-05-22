import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isPinSet: boolean | null;
  isLoading: boolean;
  error: string | null;
  checkPinSet: () => Promise<void>;
  setupPin: (pin: string) => Promise<boolean>;
  login: (pin: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isPinSet: null,
  isLoading: true,
  error: null,

  checkPinSet: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.auth.checkPinSet();
      if (response.success && response.data) {
        set({ isPinSet: response.data.isPinSet, isLoading: false });
      } else {
        set({ error: response.error?.message || 'Failed to check PIN', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
    }
  },

  setupPin: async (pin: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.auth.setupPin({ pin });
      if (response.success) {
        set({ isPinSet: true, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ error: response.error?.message || 'Failed to setup PIN', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  },

  login: async (pin: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.auth.login({ pin });
      if (response.success && response.data?.authenticated) {
        set({ isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ error: response.error?.message || 'Invalid PIN', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  }
}));
