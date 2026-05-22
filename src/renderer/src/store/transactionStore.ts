import { create } from 'zustand';

export interface Transaction {
  id: number;
  party_id: number;
  party_name: string | null;
  invoice_id: number | null;
  type: 'credit' | 'debit';
  amount: number;
  note: string | null;
  created_at: string;
}

interface TransactionState {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;

  loadTransactions: (filters?: { partyId?: number; invoiceId?: number; type?: 'credit' | 'debit' }, page?: number) => Promise<void>;
  createTransaction: (data: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: number) => Promise<boolean>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  error: null,

  loadTransactions: async (filters = {}, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.transaction.list({ ...filters, page, pageSize: get().pageSize });
      if (response.success && response.data) {
        set({
          transactions: response.data.data,
          total: response.data.total,
          page: response.data.page,
          isLoading: false
        });
      } else {
        set({ error: response.error?.message || 'Failed to load transactions', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
    }
  },

  createTransaction: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.transaction.create(data);
      if (response.success) {
        set({ isLoading: false });
        return true;
      }
      set({ error: response.error?.message || 'Failed to create transaction', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.transaction.delete({ id });
      if (response.success) {
        set((state) => ({
           transactions: state.transactions.filter(t => t.id !== id),
           isLoading: false
        }));
        return true;
      }
      set({ error: response.error?.message || 'Failed to delete transaction', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  }
}));
