import { create } from 'zustand';

interface SearchResult {
  entityType: 'party' | 'product' | 'transaction';
  entityId: number;
  displayText: string;
  subtitle: string;
}

interface SearchState {
  isModalOpen: boolean;
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  setModalOpen: (isOpen: boolean) => void;
  setQuery: (query: string) => void;
  executeSearch: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  isModalOpen: false,
  query: '',
  results: [],
  isLoading: false,

  setModalOpen: (isOpen) => {
    set({ isModalOpen: isOpen });
    if (!isOpen) {
      set({ query: '', results: [] });
    }
  },

  setQuery: (query) => {
    set({ query });
    if (query.trim() === '') {
       set({ results: [] });
    }
  },

  executeSearch: async () => {
    const q = get().query;
    if (!q || q.trim() === '') return;

    set({ isLoading: true });
    try {
      const response = await window.api.search.global({ query: q });
      if (response.success && response.data) {
        set({ results: response.data, isLoading: false });
      } else {
        set({ results: [], isLoading: false });
      }
    } catch (err) {
      set({ results: [], isLoading: false });
    }
  },
}));
