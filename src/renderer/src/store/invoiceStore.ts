import { create } from 'zustand';

export interface InvoiceItem {
  id: number;
  product_id: number;
  product_name_snapshot: string;
  unit_snapshot: string;
  quantity: number;
  selling_price_snapshot: number;
  total: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  party_id: number;
  party_name: string | null;
  subtotal: number;
  discount: number;
  extra_charges: number;
  total_amount: number;
  amount_paid: number;
  pending_amount: number;
  status: 'completed' | 'voided';
  created_at: string;
  items?: InvoiceItem[];
}

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;

  loadInvoices: (filters?: { partyId?: number; status?: 'completed' | 'voided' }, page?: number) => Promise<void>;
  getInvoice: (id: number) => Promise<Invoice | null>;
  createInvoice: (data: any) => Promise<{ success: boolean; invoiceId?: number }>;
  voidInvoice: (id: number, reason?: string) => Promise<boolean>;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  currentInvoice: null,
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  error: null,

  loadInvoices: async (filters = {}, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.invoice.list({ ...filters, page, pageSize: get().pageSize });
      if (response.success && response.data) {
        set({
          invoices: response.data.data,
          total: response.data.total,
          page: response.data.page,
          isLoading: false
        });
      } else {
        set({ error: response.error?.message || 'Failed to load invoices', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
    }
  },

  getInvoice: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.invoice.get({ id });
      if (response.success && response.data) {
        set({ currentInvoice: { ...response.data.invoice, items: response.data.items }, isLoading: false });
        return response.data;
      }
      set({ error: response.error?.message || 'Failed to load invoice', isLoading: false });
      return null;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return null;
    }
  },

  createInvoice: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.invoice.create(data);
      if (response.success) {
        set({ isLoading: false });
        return { success: true, invoiceId: response.data?.invoiceId };
      }
      set({ error: response.error?.message || 'Failed to create invoice', isLoading: false });
      return { success: false };
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return { success: false };
    }
  },

  voidInvoice: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.invoice.void({ id, reason });
      if (response.success) {
        set((state) => ({
           invoices: state.invoices.map(inv => inv.id === id ? { ...inv, status: 'voided' } : inv),
           currentInvoice: state.currentInvoice?.id === id ? { ...state.currentInvoice, status: 'voided' } : state.currentInvoice,
           isLoading: false
        }));
        return true;
      }
      set({ error: response.error?.message || 'Failed to void invoice', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  }
}));
