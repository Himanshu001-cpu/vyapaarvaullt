import { db } from '../database';
import { stock_movements } from '../database/schema';
import { desc, eq, sql } from 'drizzle-orm';

export interface StockMovementData {
  product_id: number;
  invoice_id?: number | null;
  movement_type: 'invoice' | 'manual_adjustment' | 'undo' | 'restore';
  quantity_change: number;
  note?: string | null;
}

export class StockMovementRepository {
  static async create(data: StockMovementData, tx: any = db) {
    const result = await tx.insert(stock_movements).values(data).returning({ id: stock_movements.id });
    return result[0];
  }

  static async listByProduct(productId: number, page = 1, pageSize = 20) {
    const [countResult] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(stock_movements)
      .where(eq(stock_movements.product_id, productId));

    const data = await db
      .select()
      .from(stock_movements)
      .where(eq(stock_movements.product_id, productId))
      .orderBy(desc(stock_movements.created_at))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      data,
      total: countResult.count,
      page,
      pageSize
    };
  }
}
