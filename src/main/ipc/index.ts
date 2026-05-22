import { ipcMain } from 'electron';
import { ApiResponse } from '../types';
import { ZodType } from 'zod';

export type IpcHandler<TRequest, TResponse> = (payload: TRequest) => Promise<ApiResponse<TResponse>>;

export function registerIpcHandler<TRequest, TResponse>(
  channel: string,
  schema: ZodType<TRequest> | null,
  handler: IpcHandler<TRequest, TResponse>
) {
  ipcMain.handle(channel, async (_, payload: unknown) => {
    try {
      let validatedPayload = payload as TRequest;
      if (schema) {
        const parseResult = schema.safeParse(payload);
        if (!parseResult.success) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request payload',
              details: parseResult.error.errors,
            },
          };
        }
        validatedPayload = parseResult.data;
      }

      return await handler(validatedPayload);
    } catch (error) {
      console.error(`Error in IPC channel ${channel}:`, error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  });
}

// In-memory session state
let isAuthenticated = false;

export function setAuthenticated(status: boolean) {
  isAuthenticated = status;
}

export function getAuthenticated() {
  return isAuthenticated;
}

export function authGuard<TRequest, TResponse>(handler: IpcHandler<TRequest, TResponse>): IpcHandler<TRequest, TResponse> {
  return async (payload: TRequest) => {
    if (!isAuthenticated) {
      return {
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Session is not authenticated',
        },
      };
    }
    return handler(payload);
  };
}
