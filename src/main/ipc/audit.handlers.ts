import { registerIpcHandler, authGuard } from './index';
import { db } from '../database';
import { audit_logs } from '../database/schema';
import { desc } from 'drizzle-orm';

export function registerAuditHandlers() {
  registerIpcHandler('audit:list', null, authGuard(async () => {
    const data = await db.select().from(audit_logs).orderBy(desc(audit_logs.created_at)).limit(100);
    return { success: true, data };
  }));
}
