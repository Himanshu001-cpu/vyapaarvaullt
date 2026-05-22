import { db } from '../database';
import { transactions, parties } from '../database/schema';
import { eq, desc, isNull, sql, and, SQL } from 'drizzle-orm';

export interface TransactionCreateData {
  party_id: number;
  invoice_id?: number | null;
  type: 'credit' | 'debit';
  amount: number;
  note?: string | null;
}

export interface TransactionUpdateData extends Partial<TransactionCreateData> {
  id: number;
}

export class TransactionRepository {
  static async create(data: TransactionCreateData, tx: any = db) {
    const result = await tx.insert(transactions).values(data).returning({ id: transactions.id });
    return result[0];
  }

  static async update(data: TransactionUpdateData, tx: any = db) {
    const { id, ...updateFields } = data;
    await tx.update(transactions)
      .set(updateFields)
      .where(eq(transactions.id, id));
  }

  static async softDelete(id: number) {
    await db.update(transactions)
      .set({ deleted_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(transactions.id, id));
  }

  static async getById(id: number) {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0] || null;
  }

  static async list(partyId?: number, invoiceId?: number, type?: 'credit' | 'debit', startDate?: string, endDate?: string, page = 1, pageSize = 20) {
    let conditions: SQL<unknown>[] = [isNull(transactions.deleted_at)];

    if (partyId) conditions.push(eq(transactions.party_id, partyId));
    if (invoiceId) conditions.push(eq(transactions.invoice_id, invoiceId));
    if (type) conditions.push(eq(transactions.type, type));
    if (startDate) conditions.push(sql`${transactions.created_at} >= ${startDate}`);
    if (endDate) conditions.push(sql`${transactions.created_at} <= ${endDate}`);

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(transactions)
      .where(whereClause);

    const data = await db
      .select({
         id: transactions.id,
         party_id: transactions.party_id,
         party_name: parties.name,
         invoice_id: transactions.invoice_id,
         type: transactions.type,
         amount: transactions.amount,
         note: transactions.note,
         created_at: transactions.created_at
      })
      .from(transactions)
      .leftJoin(parties, eq(transactions.party_id, parties.id))
      .where(whereClause)
      .orderBy(desc(transactions.created_at))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      data,
      total: countResult.count,
      page,
      pageSize
    };
  }

  static async searchFTS(query: string, limit = 20) {
    return db
      .select({
         id: transactions.id,
         party_id: transactions.party_id,
         party_name: parties.name,
         invoice_id: transactions.invoice_id,
         type: transactions.type,
         amount: transactions.amount,
         note: transactions.note,
         created_at: transactions.created_at
      })
      .from(transactions)
      .leftJoin(parties, eq(transactions.party_id, parties.id))
      .innerJoin(sql`transactions_fts`, eq(transactions.id, sql`transactions_fts.rowid`))
      .where(
        and(
          isNull(transactions.deleted_at),
          sql`transactions_fts MATCH ${query}`
        )
      )
      .limit(limit);
  }
}
