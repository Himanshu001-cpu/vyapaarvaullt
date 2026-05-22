import { db } from '../database';
import { parties, transactions, invoices } from '../database/schema';
import { eq, desc, isNull, sql, and, or, SQL } from 'drizzle-orm';

export interface PartyCreateData {
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  type: 'customer' | 'supplier' | 'both';
}

export interface PartyUpdateData extends Partial<PartyCreateData> {
  id: number;
}

export class PartyRepository {
  static async create(data: PartyCreateData) {
    const result = await db.insert(parties).values(data).returning({ id: parties.id });
    return result[0];
  }

  static async update(data: PartyUpdateData) {
    const { id, ...updateFields } = data;
    await db.update(parties)
      .set({ ...updateFields, updated_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(parties.id, id));
  }

  static async softDelete(id: number) {
    await db.update(parties)
      .set({ deleted_at: sql`CURRENT_TIMESTAMP`, updated_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(parties.id, id));
  }

  static async restore(id: number) {
    await db.update(parties)
      .set({ deleted_at: null, updated_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(parties.id, id));
  }

  static async getById(id: number) {
    const result = await db.select().from(parties).where(eq(parties.id, id)).limit(1);
    return result[0] || null;
  }

  static async getByPhone(phone: string) {
    const result = await db.select().from(parties).where(eq(parties.phone, phone)).limit(1);
    return result[0] || null;
  }

  static async list(type?: 'customer' | 'supplier' | 'both', includeDeleted = false, page = 1, pageSize = 20) {
    let conditions: SQL<unknown>[] = [];

    if (type) {
      if (type !== 'both') {
         conditions.push(or(eq(parties.type, type), eq(parties.type, 'both')) as SQL<unknown>);
      } else {
         conditions.push(eq(parties.type, 'both'));
      }
    }

    if (!includeDeleted) {
      conditions.push(isNull(parties.deleted_at));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(parties)
      .where(whereClause);

    const data = await db
      .select()
      .from(parties)
      .where(whereClause)
      .orderBy(desc(parties.created_at))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      data,
      total: countResult.count,
      page,
      pageSize
    };
  }

  static async getBalance(partyId: number) {
    const [transactionResult] = await db
      .select({
        totalCredits: sql<number>`SUM(CASE WHEN ${transactions.type} = 'credit' THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
        totalDebits: sql<number>`SUM(CASE WHEN ${transactions.type} = 'debit' THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number)
      })
      .from(transactions)
      .where(and(eq(transactions.party_id, partyId), isNull(transactions.deleted_at)));

    const [invoiceResult] = await db
      .select({
        totalPending: sql<number>`SUM(${invoices.pending_amount})`.mapWith(Number)
      })
      .from(invoices)
      .where(and(eq(invoices.party_id, partyId), isNull(invoices.deleted_at), eq(invoices.status, 'completed')));

    const credits = transactionResult?.totalCredits || 0;
    const debits = transactionResult?.totalDebits || 0;
    const pending = invoiceResult?.totalPending || 0;

    return {
      credits,
      debits,
      pending
    };
  }

  static async searchFTS(query: string, type?: 'customer' | 'supplier' | 'both', limit = 20) {
    let conditions: SQL<unknown>[] = [];
    if (type) {
       if (type !== 'both') {
         conditions.push(or(eq(parties.type, type), eq(parties.type, 'both')) as SQL<unknown>);
      } else {
         conditions.push(eq(parties.type, 'both'));
      }
    }
    conditions.push(isNull(parties.deleted_at));
    conditions.push(sql`parties_fts MATCH ${query}`);

    return db
      .select({
         id: parties.id,
         name: parties.name,
         phone: parties.phone,
         type: parties.type
      })
      .from(parties)
      .innerJoin(sql`parties_fts`, eq(parties.id, sql`parties_fts.rowid`))
      .where(and(...conditions))
      .limit(limit);
  }
}
