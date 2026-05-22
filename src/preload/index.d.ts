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
      }
    }
  }
}
export {}
