import { db } from '../database';
import { parties, products, transactions } from '../database/schema';
import { sql, isNull, and, eq } from 'drizzle-orm';
import { sanitizeFtsQuery } from './fts.util';

export interface GlobalSearchResult {
  entityType: 'party' | 'product' | 'transaction';
  entityId: number;
  displayText: string;
  subtitle: string;
}

export class SearchRepository {
  static async globalSearch(query: string, limit = 10): Promise<GlobalSearchResult[]> {
    const sanitized = sanitizeFtsQuery(query);
    if (!sanitized) return [];

    const results: GlobalSearchResult[] = [];

    // FTS on Parties
    const partyResults = await db
      .select({ id: parties.id, name: parties.name, phone: parties.phone, type: parties.type })
      .from(parties)
      .innerJoin(sql`parties_fts`, eq(parties.id, sql`parties_fts.rowid`))
      .where(and(isNull(parties.deleted_at), sql`parties_fts MATCH ${sanitized}`))
      .limit(limit);

    for (const p of partyResults) {
      results.push({
        entityType: 'party',
        entityId: p.id,
        displayText: p.name,
        subtitle: `${p.type} • ${p.phone || 'No phone'}`
      });
    }

    // FTS on Products
    const productResults = await db
      .select({ id: products.id, name: products.name, sku: products.sku })
      .from(products)
      .innerJoin(sql`products_fts`, eq(products.id, sql`products_fts.rowid`))
      .where(and(isNull(products.deleted_at), sql`products_fts MATCH ${sanitized}`))
      .limit(limit);

    for (const p of productResults) {
      results.push({
        entityType: 'product',
        entityId: p.id,
        displayText: p.name,
        subtitle: `SKU: ${p.sku || 'N/A'}`
      });
    }

    // FTS on Transactions
    const txnResults = await db
      .select({ id: transactions.id, note: transactions.note, type: transactions.type, amount: transactions.amount })
      .from(transactions)
      .innerJoin(sql`transactions_fts`, eq(transactions.id, sql`transactions_fts.rowid`))
      .where(and(isNull(transactions.deleted_at), sql`transactions_fts MATCH ${sanitized}`))
      .limit(limit);

    for (const t of txnResults) {
      results.push({
        entityType: 'transaction',
        entityId: t.id,
        displayText: `₹${t.amount} ${t.type}`,
        subtitle: t.note || ''
      });
    }

    // Combine and limit overall
    return results.slice(0, limit);
  }
}
