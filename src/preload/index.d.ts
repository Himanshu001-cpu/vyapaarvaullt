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
    }
  }
}
export {}
