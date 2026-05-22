import { create } from 'zustand';

export interface Party {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  type: 'customer' | 'supplier' | 'both';
  balance?: number;
}

interface PartyState {
  parties: Party[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;

  loadParties: (type?: 'customer' | 'supplier' | 'both', page?: number) => Promise<void>;
  createParty: (data: Partial<Party>) => Promise<boolean>;
  deleteParty: (id: number) => Promise<boolean>;
}

export const usePartyStore = create<PartyState>((set, get) => ({
  parties: [],
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  error: null,

  loadParties: async (type, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.party.list({ type, page, pageSize: get().pageSize });
      if (response.success && response.data) {
        set({
          parties: response.data.data,
          total: response.data.total,
          page: response.data.page,
          isLoading: false
        });
      } else {
        set({ error: response.error?.message || 'Failed to load parties', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
    }
  },

  createParty: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.party.create(data);
      if (response.success) {
        set({ isLoading: false });
        return true;
      }
      set({ error: response.error?.message || 'Failed to create party', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  },

  deleteParty: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await window.api.party.delete({ id });
      if (response.success) {
        // Optimistic UI update or trigger reload
        set((state) => ({
           parties: state.parties.filter(p => p.id !== id),
           isLoading: false
        }));
        return true;
      }
      set({ error: response.error?.message || 'Failed to delete party', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Failed to communicate with main process', isLoading: false });
      return false;
    }
  }
}));
