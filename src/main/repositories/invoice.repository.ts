import { db } from '../database';
import { invoices, parties } from '../database/schema';
import { eq, desc, isNull, sql, and, or, SQL, like } from 'drizzle-orm';

export interface InvoiceCreateData {
  invoice_number: string;
  party_id: number;
  subtotal: number;
  discount?: number;
  extra_charges?: number;
  total_amount: number;
  amount_paid?: number;
  pending_amount?: number;
  status: 'completed' | 'voided';
  notes?: string | null;
}

export class InvoiceRepository {
  static async create(data: InvoiceCreateData, tx: any = db) {
    const result = await tx.insert(invoices).values(data).returning({ id: invoices.id });
    return result[0];
  }

  static async updateStatus(id: number, status: 'completed' | 'voided', tx: any = db) {
    await tx.update(invoices)
      .set({ status, updated_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(invoices.id, id));
  }

  static async updatePayment(id: number, amountPaid: number, pendingAmount: number, tx: any = db) {
    await tx.update(invoices)
      .set({ amount_paid: amountPaid, pending_amount: pendingAmount, updated_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(invoices.id, id));
  }

  static async getById(id: number) {
    const result = await db.select({
         id: invoices.id,
         invoice_number: invoices.invoice_number,
         party_id: invoices.party_id,
         party_name: parties.name,
         subtotal: invoices.subtotal,
         discount: invoices.discount,
         extra_charges: invoices.extra_charges,
         total_amount: invoices.total_amount,
         amount_paid: invoices.amount_paid,
         pending_amount: invoices.pending_amount,
         status: invoices.status,
         notes: invoices.notes,
         created_at: invoices.created_at
    }).from(invoices)
      .leftJoin(parties, eq(invoices.party_id, parties.id))
      .where(eq(invoices.id, id)).limit(1);
    return result[0] || null;
  }

  static async getNextInvoiceNumber(tx: any = db): Promise<string> {
    const [result] = await tx
      .select({ invoice_number: invoices.invoice_number })
      .from(invoices)
      .orderBy(desc(invoices.id))
      .limit(1);

    if (!result || !result.invoice_number) {
        return 'INV-0001';
    }
    const match = result.invoice_number.match(/INV-(\d+)/);
    if (match) {
        const nextNumber = parseInt(match[1], 10) + 1;
        return `INV-${nextNumber.toString().padStart(4, '0')}`;
    }
    return 'INV-0001';
  }

  static async list(partyId?: number, status?: 'completed' | 'voided', startDate?: string, endDate?: string, page = 1, pageSize = 20) {
    let conditions: SQL<unknown>[] = [isNull(invoices.deleted_at)];

    if (partyId) conditions.push(eq(invoices.party_id, partyId));
    if (status) conditions.push(eq(invoices.status, status));
    if (startDate) conditions.push(sql`${invoices.created_at} >= ${startDate}`);
    if (endDate) conditions.push(sql`${invoices.created_at} <= ${endDate}`);

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(invoices)
      .where(whereClause);

    const data = await db
      .select({
         id: invoices.id,
         invoice_number: invoices.invoice_number,
         party_id: invoices.party_id,
         party_name: parties.name,
         total_amount: invoices.total_amount,
         amount_paid: invoices.amount_paid,
         pending_amount: invoices.pending_amount,
         status: invoices.status,
         created_at: invoices.created_at
      })
      .from(invoices)
      .leftJoin(parties, eq(invoices.party_id, parties.id))
      .where(whereClause)
      .orderBy(desc(invoices.created_at))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      data,
      total: countResult.count,
      page,
      pageSize
    };
  }

  static async search(query: string, limit = 20) {
    // Basic search on invoice number or party name
    return db
      .select({
         id: invoices.id,
         invoice_number: invoices.invoice_number,
         party_id: invoices.party_id,
         party_name: parties.name,
         total_amount: invoices.total_amount,
         status: invoices.status,
         created_at: invoices.created_at
      })
      .from(invoices)
      .leftJoin(parties, eq(invoices.party_id, parties.id))
      .where(
        and(
          isNull(invoices.deleted_at),
          or(
            like(invoices.invoice_number, `%${query}%`),
            like(parties.name, `%${query}%`)
          )
        )
      )
      .limit(limit);
  }
}
