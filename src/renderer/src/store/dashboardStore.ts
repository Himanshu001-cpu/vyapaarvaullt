import { create } from 'zustand';

interface DashboardData {
  monthlyRevenue: number;
  pendingReceivables: number;
  pendingPayables: number;
  lowStockCount: number;
  topCustomers: any[];
  recentInvoices: any[];
  recentTransactions: any[];
}

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  loadDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.analytics.dashboard();
      if (response.success && response.data) {
        set({ data: response.data, isLoading: false });
      } else {
        set({ error: response.error?.message || 'Failed to load dashboard', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
    }
  },
}));
