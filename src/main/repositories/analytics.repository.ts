import { db } from '../database';
import { invoices, transactions, products, parties } from '../database/schema';
import { sql, and, isNull, eq, desc } from 'drizzle-orm';

export class AnalyticsRepository {
  static async getMonthlyRevenue() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sqliteFormat = startOfMonth.toISOString().replace('T', ' ').substring(0, 19);

    const [result] = await db
      .select({
        total: sql<number>`SUM(${invoices.total_amount})`.mapWith(Number)
      })
      .from(invoices)
      .where(
        and(
          isNull(invoices.deleted_at),
          eq(invoices.status, 'completed'),
          sql`${invoices.created_at} >= ${sqliteFormat}`
        )
      );
    return result?.total || 0;
  }

  static async getPendingReceivables() {
    const [result] = await db
      .select({
        total: sql<number>`SUM(${invoices.pending_amount})`.mapWith(Number)
      })
      .from(invoices)
      .innerJoin(parties, eq(invoices.party_id, parties.id))
      .where(
        and(
          isNull(invoices.deleted_at),
          eq(invoices.status, 'completed'),
          eq(parties.type, 'customer')
        )
      );
    return result?.total || 0;
  }

  static async getPendingPayables() {
    // Usually payables come from purchase invoices, but our schema just has general invoices.
    // For MVP, if it's a supplier invoice, it's a payable.
    const [result] = await db
      .select({
        total: sql<number>`SUM(${invoices.pending_amount})`.mapWith(Number)
      })
      .from(invoices)
      .innerJoin(parties, eq(invoices.party_id, parties.id))
      .where(
        and(
          isNull(invoices.deleted_at),
          eq(invoices.status, 'completed'),
          eq(parties.type, 'supplier')
        )
      );
    return result?.total || 0;
  }

  static async getLowStockCount() {
    const [result] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(products)
      .where(
        and(
          isNull(products.deleted_at),
          sql`${products.current_quantity} <= COALESCE(${products.low_stock_threshold}, 0)`
        )
      );
    return result?.count || 0;
  }

  static async getTopCustomers(limit = 5) {
    return db
      .select({
        party_id: parties.id,
        name: parties.name,
        totalAmount: sql<number>`SUM(${invoices.total_amount})`.mapWith(Number)
      })
      .from(invoices)
      .innerJoin(parties, eq(invoices.party_id, parties.id))
      .where(and(isNull(invoices.deleted_at), eq(invoices.status, 'completed'), eq(parties.type, 'customer')))
      .groupBy(parties.id)
      .orderBy(desc(sql`SUM(${invoices.total_amount})`))
      .limit(limit);
  }

  static async getRecentInvoices(limit = 5) {
    return db
      .select({
        id: invoices.id,
        invoice_number: invoices.invoice_number,
        total_amount: invoices.total_amount,
        status: invoices.status,
        party_name: parties.name,
        created_at: invoices.created_at
      })
      .from(invoices)
      .innerJoin(parties, eq(invoices.party_id, parties.id))
      .where(isNull(invoices.deleted_at))
      .orderBy(desc(invoices.created_at))
      .limit(limit);
  }

  static async getRecentTransactions(limit = 5) {
    return db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        party_name: parties.name,
        created_at: transactions.created_at
      })
      .from(transactions)
      .innerJoin(parties, eq(transactions.party_id, parties.id))
      .where(isNull(transactions.deleted_at))
      .orderBy(desc(transactions.created_at))
      .limit(limit);
  }
}
