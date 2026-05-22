import { registerIpcHandler, authGuard } from './index';
import { UndoService } from '../services/undo.service';
import { z } from 'zod';

export const undoPerformSchema = z.object({
  auditLogId: z.number().int().positive(),
});

export const undoHistorySchema = z.object({
  limit: z.number().int().positive().optional().default(20),
});

export function registerUndoHandlers() {
  registerIpcHandler('undo:perform', undoPerformSchema, authGuard(async (payload) => {
    try {
      const success = await UndoService.performUndo(payload.auditLogId);
      return { success: true, data: { success } };
    } catch(e: any) {
      if (e.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Audit log not found' }};
      if (e.message === 'NOT_UNDOABLE') return { success: false, error: { code: 'NOT_UNDOABLE', message: 'This operation cannot be undone' }};
      throw e;
    }
  }));

  registerIpcHandler('undo:history', undoHistorySchema, authGuard(async (payload) => {
    const data = await UndoService.getUndoHistory(payload.limit);
    return { success: true, data };
  }));
}
