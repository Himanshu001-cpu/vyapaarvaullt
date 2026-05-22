import { db } from '../database';
import { audit_logs } from '../database/schema';

export class AuditService {
  static async logAction(
    action: string,
    entityType: string,
    entityId: number,
    oldValue?: unknown,
    newValue?: unknown,
    tx?: any // Optional Drizzle transaction
  ) {
    try {
      const dbInstance = tx || db;
      await dbInstance.insert(audit_logs).values({
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_value: oldValue ? JSON.stringify(oldValue) : null,
        new_value: newValue ? JSON.stringify(newValue) : null,
      });
    } catch (error) {
      // We don't want audit logging failures to necessarily crash the app outside of a tx,
      // but we should log them.
      console.error('Audit logging failed:', error);
      if (tx) throw error; // If inside a transaction, bubble up to trigger rollback
    }
  }
}
