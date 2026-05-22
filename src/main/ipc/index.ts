import { ipcMain } from 'electron';
import { ApiResponse } from '../types';
import { ZodType } from 'zod';
import { SsdDetectorService } from '../services/ssd.detector';

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

export { getAuthenticated, setAuthenticated } from './state';
import { getAuthenticated } from './state';

export function authGuard<TRequest, TResponse>(handler: IpcHandler<TRequest, TResponse>): IpcHandler<TRequest, TResponse> {
  return async (payload: TRequest) => {
    if (!getAuthenticated()) {
      return {
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Session is not authenticated',
        },
      };
    }
    if (SsdDetectorService.getIsDisconnected()) {
      return {
        success: false,
        error: {
          code: 'STORAGE_DISCONNECTED',
          message: 'Storage device is disconnected'
        }
      };
    }
    return handler(payload);
  };
}
