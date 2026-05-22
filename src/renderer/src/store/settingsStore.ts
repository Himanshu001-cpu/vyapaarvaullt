import { create } from 'zustand';

interface SettingsState {
  settings: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Record<string, string>) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  isLoading: true,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.settings.getAll();
      if (response.success && response.data) {
        set({ settings: response.data, isLoading: false });
      } else {
        set({ error: response.error?.message || 'Failed to load settings', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
    }
  },

  updateSettings: async (newSettings: Record<string, string>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.settings.update({ settings: newSettings });
      if (response.success) {
        set((state) => ({ settings: { ...state.settings, ...newSettings }, isLoading: false }));
        return true;
      }
      set({ error: response.error?.message || 'Failed to update settings', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  }
}));
