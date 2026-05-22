import { LoggingService } from './logging.service';
import * as xlsx from 'xlsx';
import { db } from '../database';
import { invoices, parties } from '../database/schema';
import { eq, sql, and, isNull } from 'drizzle-orm';
import { FileService } from './file.service';
import { join } from 'path';
import { writeFileSync } from 'fs';

export class ExportService {
  static async exportExcel(reportType: string, filters?: any) {
    try {
      LoggingService.info('export_started', { reportType });
      const exportsDir = FileService.getBasePath() + '/exports';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = join(exportsDir, `${reportType}-${timestamp}.xlsx`);

      let data: any[] = [];

      if (reportType === 'dailySales') {
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         data = await db.select({
             Invoice: invoices.invoice_number,
             Date: invoices.created_at,
             Party: parties.name,
             Amount: invoices.total_amount,
             Status: invoices.status
         }).from(invoices)
           .leftJoin(parties, eq(invoices.party_id, parties.id))
           .where(and(
               isNull(invoices.deleted_at),
               sql`${invoices.created_at} >= ${today.toISOString()}`
           ));
      } else if (reportType === 'pendingBalance') {
         data = await db.select({
             Party: parties.name,
             Type: parties.type,
             PendingAmount: sql<number>`SUM(${invoices.pending_amount})`.mapWith(Number)
         }).from(invoices)
           .leftJoin(parties, eq(invoices.party_id, parties.id))
           .where(and(isNull(invoices.deleted_at), eq(invoices.status, 'completed')))
           .groupBy(parties.id)
           .having(sql`SUM(${invoices.pending_amount}) > 0`);
      }

      if (data.length === 0) {
         data = [{ Message: 'No data found for this report' }];
      }

      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Report");

      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      writeFileSync(filePath, buffer);

      LoggingService.info('export_completed', { filePath });
      return { filePath };
    } catch (e: any) {
       LoggingService.error('export_failed', { reportType }, e);
       throw new Error('EXPORT_FAILED');
    }
  }
}
