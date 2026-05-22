import { LoggingService } from './logging.service';
import * as xlsx from 'xlsx';
import { db } from '../database';
import { parties, products } from '../database/schema';

export class ImportService {
  static async importExcel(filePath: string, entityType: string, columnMapping: Record<string, string>) {
    try {
      LoggingService.info('import_started', { filePath, entityType });
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json<any>(worksheet);

      let imported = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          if (entityType === 'customers' || entityType === 'suppliers') {
             const name = row[columnMapping['name'] || 'Name'];
             const phone = row[columnMapping['phone'] || 'Phone']?.toString();

             if (!name) {
                 skipped++;
                 errors.push({ row: i+2, reason: 'Missing Name' });
                 continue;
             }

             await db.insert(parties).values({
                 name,
                 phone,
                 type: entityType === 'customers' ? 'customer' : 'supplier'
             });
             imported++;
          } else if (entityType === 'products') {
             const name = row[columnMapping['name'] || 'Name'];
             const sku = row[columnMapping['sku'] || 'SKU']?.toString();
             const purchase_price = Number(row[columnMapping['purchase_price'] || 'Purchase Price'] || 0);
             const selling_price = Number(row[columnMapping['selling_price'] || 'Selling Price'] || 0);

             if (!name) {
                 skipped++;
                 errors.push({ row: i+2, reason: 'Missing Name' });
                 continue;
             }

             await db.insert(products).values({
                 name,
                 sku,
                 purchase_price,
                 selling_price,
                 base_unit_id: 1 // Default
             });
             imported++;
          }
        } catch (e: any) {
           skipped++;
           errors.push({ row: i+2, reason: e.message });
        }
      }

      LoggingService.info('import_completed', { imported, skipped, errors });
      return { imported, skipped, errors };
    } catch (e: any) {
       LoggingService.error('import_failed', { filePath }, e);
       throw new Error('IMPORT_FAILED');
    }
  }
}
