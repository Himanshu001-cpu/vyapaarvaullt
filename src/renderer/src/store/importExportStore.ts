import { create } from 'zustand';

interface ImportExportState {
  isImporting: boolean;
  isExporting: boolean;
  importData: (filePath: string, entityType: string, mapping: Record<string, string>) => Promise<boolean>;
  exportData: (reportType: string) => Promise<boolean>;
}

export const useImportExportStore = create<ImportExportState>((set) => ({
  isImporting: false,
  isExporting: false,

  importData: async (filePath, entityType, columnMapping) => {
    set({ isImporting: true });
    try {
      const response = await window.api.importExport.importExcel({ filePath, entityType, columnMapping });
      set({ isImporting: false });
      return response.success;
    } catch (e) {
      set({ isImporting: false });
      return false;
    }
  },

  exportData: async (reportType) => {
    set({ isExporting: true });
    try {
      const response = await window.api.importExport.exportExcel({ reportType });
      set({ isExporting: false });
      return response.success;
    } catch (e) {
      set({ isExporting: false });
      return false;
    }
  }
}));
