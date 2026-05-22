import { ApiResponse } from '../main/types';

declare global {
  interface Window {
    api: {
      auth: {
        checkPinSet: () => Promise<ApiResponse<{ isPinSet: boolean }>>;
        setupPin: (data: { pin: string }) => Promise<ApiResponse<{ success: boolean }>>;
        login: (data: { pin: string }) => Promise<ApiResponse<{ authenticated: boolean }>>;
        changePin: (data: { oldPin: string, newPin: string }) => Promise<ApiResponse<{ success: boolean }>>;
        validateSession: () => Promise<ApiResponse<{ isValid: boolean }>>;
      };
      settings: {
        getAll: () => Promise<ApiResponse<Record<string, string>>>;
        update: (data: { settings: Record<string, string> }) => Promise<ApiResponse<{ success: boolean }>>;
      };
      backup: {
        create: () => Promise<ApiResponse<{ filePath: string }>>;
      };
      audit: {
        list: () => Promise<ApiResponse<any[]>>;
      };
      party: {
        create: (data: any) => Promise<ApiResponse<{ id: number }>>;
        update: (data: any) => Promise<ApiResponse<{ success: boolean }>>;
        delete: (data: { id: number }) => Promise<ApiResponse<{ success: boolean }>>;
        restore: (data: { id: number }) => Promise<ApiResponse<{ success: boolean }>>;
        get: (data: { id: number }) => Promise<ApiResponse<any>>;
        search: (data: { query: string, type?: string, limit?: number }) => Promise<ApiResponse<any[]>>;
        list: (data: { type?: string, includeDeleted?: boolean, page?: number, pageSize?: number }) => Promise<ApiResponse<{ data: any[], total: number, page: number, pageSize: number }>>;
      };
      category: {
        create: (data: any) => Promise<ApiResponse<{ id: number }>>;
        update: (data: any) => Promise<ApiResponse<{ success: boolean }>>;
        delete: (data: { id: number }) => Promise<ApiResponse<{ success: boolean }>>;
        list: () => Promise<ApiResponse<any[]>>;
      };
      unit: {
        create: (data: any) => Promise<ApiResponse<{ id: number }>>;
        update: (data: any) => Promise<ApiResponse<{ success: boolean }>>;
        delete: (data: { id: number }) => Promise<ApiResponse<{ success: boolean }>>;
        list: () => Promise<ApiResponse<any[]>>;
      };
      conversion: {
        create: (data: any) => Promise<ApiResponse<{ id: number }>>;
        delete: (data: { id: number }) => Promise<ApiResponse<{ success: boolean }>>;
        list: (data: { id: number }) => Promise<ApiResponse<any[]>>;
      };
      inventory: {
        create: (data: any) => Promise<ApiResponse<{ id: number }>>;
        update: (data: any) => Promise<ApiResponse<{ success: boolean }>>;
        delete: (data: { id: number }) => Promise<ApiResponse<{ success: boolean }>>;
        restore: (data: { id: number }) => Promise<ApiResponse<{ success: boolean }>>;
        adjust: (data: any) => Promise<ApiResponse<{ newQuantity: number }>>;
        list: (data: any) => Promise<ApiResponse<{ data: any[], total: number, page: number, pageSize: number }>>;
        search: (data: any) => Promise<ApiResponse<any[]>>;
        lowStock: () => Promise<ApiResponse<any[]>>;
        movements: (data: any) => Promise<ApiResponse<{ data: any[], total: number, page: number, pageSize: number }>>;
      };
      transaction: {
        create: (data: any) => Promise<ApiResponse<{ id: number }>>;
        update: (data: any) => Promise<ApiResponse<{ success: boolean }>>;
        delete: (data: { id: number }) => Promise<ApiResponse<{ success: boolean }>>;
        list: (data: any) => Promise<ApiResponse<{ data: any[], total: number, page: number, pageSize: number }>>;
        search: (data: any) => Promise<ApiResponse<any[]>>;
      };
      invoice: {
        create: (data: any) => Promise<ApiResponse<{ invoiceId: number, invoiceNumber: string }>>;
        void: (data: { id: number, reason?: string }) => Promise<ApiResponse<{ success: boolean }>>;
        get: (data: { id: number }) => Promise<ApiResponse<any>>;
        list: (data: any) => Promise<ApiResponse<{ data: any[], total: number, page: number, pageSize: number }>>;
        search: (data: any) => Promise<ApiResponse<any[]>>;
      };
      analytics: {
        dashboard: () => Promise<ApiResponse<any>>;
      };
      search: {
        global: (data: { query: string, limit?: number }) => Promise<ApiResponse<any[]>>;
      };
      importExport: {
        importExcel: (data: any) => Promise<ApiResponse<any>>;
        exportExcel: (data: any) => Promise<ApiResponse<any>>;
      };
      undo: {
        perform: (data: { auditLogId: number }) => Promise<ApiResponse<{ success: boolean }>>;
        history: (data?: { limit?: number }) => Promise<ApiResponse<any[]>>;
      };
      dialog: {
        openFile: (options: any) => Promise<ApiResponse<string | null>>;
        saveFile: (options: any) => Promise<ApiResponse<string | null>>;
      };
      onStorageStatus: (callback: (status: any) => void) => () => void;
    }
  }
}
export {}
