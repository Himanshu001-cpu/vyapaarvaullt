import { create } from 'zustand';

export interface Product {
  id: number;
  name: string;
  sku: string | null;
  category_id: number | null;
  category_name: string | null;
  base_unit_id: number;
  base_unit_name: string;
  purchase_price: number;
  selling_price: number;
  current_quantity: number;
  low_stock_threshold: number | null;
  created_at: string;
  updated_at: string;
}

interface InventoryState {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;

  loadProducts: (page?: number) => Promise<void>;
  createProduct: (data: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  adjustStock: (productId: number, quantityChange: number, note: string) => Promise<boolean>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  error: null,

  loadProducts: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.inventory.list({ page, pageSize: get().pageSize });
      if (response.success && response.data) {
        set({
          products: response.data.data,
          total: response.data.total,
          page: response.data.page,
          isLoading: false
        });
      } else {
        set({ error: response.error?.message || 'Failed to load products', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.inventory.create(data);
      if (response.success) {
        set({ isLoading: false });
        return true;
      }
      set({ error: response.error?.message || 'Failed to create product', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.inventory.delete({ id });
      if (response.success) {
        set((state) => ({
           products: state.products.filter(p => p.id !== id),
           isLoading: false
        }));
        return true;
      }
      set({ error: response.error?.message || 'Failed to delete product', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  },

  adjustStock: async (productId, quantityChange, note) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.inventory.adjust({ productId, quantityChange, note });
      if (response.success && response.data) {
         set((state) => ({
             products: state.products.map(p =>
                 p.id === productId
                 ? { ...p, current_quantity: response.data!.newQuantity }
                 : p
             ),
             isLoading: false
         }));
         return true;
      }
      set({ error: response.error?.message || 'Failed to adjust stock', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  }
}));
