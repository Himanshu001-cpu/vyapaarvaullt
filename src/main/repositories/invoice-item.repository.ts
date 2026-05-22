import { db } from '../database';
import { invoice_items } from '../database/schema';
import { eq } from 'drizzle-orm';

export interface InvoiceItemCreateData {
  invoice_id: number;
  product_id: number;
  product_name_snapshot: string;
  unit_snapshot: string;
  quantity: number;
  purchase_price_snapshot: number;
  selling_price_snapshot: number;
  total: number;
}

export class InvoiceItemRepository {
  static async bulkCreate(items: InvoiceItemCreateData[], tx: any = db) {
    await tx.insert(invoice_items).values(items);
  }

  static async getByInvoiceId(invoiceId: number) {
    return db.select().from(invoice_items).where(eq(invoice_items.invoice_id, invoiceId));
  }
}
