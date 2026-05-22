import { db } from '../database';
import { unit_conversions } from '../database/schema';
import { eq, and } from 'drizzle-orm';

export interface UnitConversionData {
  product_id: number;
  from_unit_id: number;
  to_unit_id: number;
  multiplier: number;
}

export class UnitConversionRepository {
  static async create(data: UnitConversionData) {
    // Basic circular dependency check: Don't allow from = to
    if (data.from_unit_id === data.to_unit_id) {
       throw new Error('CIRCULAR_CONVERSION');
    }

    const existing = await db.select().from(unit_conversions).where(
      and(
        eq(unit_conversions.product_id, data.product_id),
        eq(unit_conversions.from_unit_id, data.from_unit_id),
        eq(unit_conversions.to_unit_id, data.to_unit_id)
      )
    ).limit(1);

    if (existing.length > 0) {
       throw new Error('DUPLICATE_CONVERSION');
    }

    const result = await db.insert(unit_conversions).values(data).returning({ id: unit_conversions.id });
    return result[0];
  }

  static async delete(id: number) {
    await db.delete(unit_conversions).where(eq(unit_conversions.id, id));
  }

  static async listByProduct(productId: number) {
    return db.select().from(unit_conversions).where(eq(unit_conversions.product_id, productId));
  }
}
