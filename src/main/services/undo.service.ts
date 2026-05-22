import { db } from '../database';
import { audit_logs, products, stock_movements, transactions, parties } from '../database/schema';
import { eq } from 'drizzle-orm';
import { AuditService } from './audit.service';
import { LoggingService } from './logging.service';

export class UndoService {
  static async getUndoHistory(limit = 20) {
    const logs = await db.select().from(audit_logs).orderBy(audit_logs.created_at).limit(limit);
    return logs.reverse(); // Newest first
  }

  static async performUndo(auditLogId: number) {
    const logEntries = await db.select().from(audit_logs).where(eq(audit_logs.id, auditLogId)).limit(1);
    if (logEntries.length === 0) throw new Error('NOT_FOUND');
    const log = logEntries[0];

    await db.transaction(async (tx) => {
        if (log.action === 'delete') {
            if (log.entity_type === 'party') {
                await tx.update(parties).set({ deleted_at: null }).where(eq(parties.id, log.entity_id));
            } else if (log.entity_type === 'product') {
                await tx.update(products).set({ deleted_at: null }).where(eq(products.id, log.entity_id));
            } else if (log.entity_type === 'transaction') {
                await tx.update(transactions).set({ deleted_at: null }).where(eq(transactions.id, log.entity_id));
            } else {
                throw new Error('NOT_UNDOABLE');
            }
        } else if (log.action === 'adjust_stock') {
             if (log.old_value) {
                const oldVals = JSON.parse(log.old_value);
                const newVals = log.new_value ? JSON.parse(log.new_value) : null;
                const change = oldVals.oldQty - (newVals ? newVals.newQty : 0);

                await tx.update(products).set({ current_quantity: oldVals.oldQty }).where(eq(products.id, log.entity_id));
                await tx.insert(stock_movements).values({
                    product_id: log.entity_id,
                    movement_type: 'undo',
                    quantity_change: change,
                    note: `Undo stock adjustment`
                });
             } else {
                throw new Error('NOT_UNDOABLE');
             }
        } else {
            throw new Error('NOT_UNDOABLE');
        }

        await AuditService.logAction('undo', log.entity_type, log.entity_id, null, { original_log_id: auditLogId }, tx);
    });

    LoggingService.info('undo_performed', { auditLogId });
    return true;
  }
}
