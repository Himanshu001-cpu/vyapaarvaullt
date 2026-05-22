import { db } from '../database';
import { units, products, unit_conversions } from '../database/schema';
import { eq, sql, or } from 'drizzle-orm';

export interface UnitData {
  name: string;
  short_name: string;
}

export class UnitRepository {
  static async create(data: UnitData) {
    const result = await db.insert(units).values(data).returning({ id: units.id });
    return result[0];
  }

  static async update(id: number, data: Partial<UnitData>) {
    await db.update(units)
      .set(data)
      .where(eq(units.id, id));
  }

  static async delete(id: number) {
    // Check if in use by products
    const productCount = await db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(products).where(eq(products.base_unit_id, id));

    if (productCount[0].count > 0) {
      throw new Error('UNIT_IN_USE');
    }

    // Check if in use by conversions
    const conversionCount = await db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(unit_conversions).where(or(
        eq(unit_conversions.from_unit_id, id),
        eq(unit_conversions.to_unit_id, id)
      ));

    if (conversionCount[0].count > 0) {
      throw new Error('UNIT_IN_USE');
    }

    await db.delete(units).where(eq(units.id, id));
  }

  static async list() {
    return db.select().from(units).orderBy(units.name);
  }

  static async getById(id: number) {
    const result = await db.select().from(units).where(eq(units.id, id)).limit(1);
    return result[0] || null;
  }

  static async getByName(name: string) {
    const result = await db.select().from(units).where(eq(units.name, name)).limit(1);
    return result[0] || null;
  }

  static async getByShortName(shortName: string) {
    const result = await db.select().from(units).where(eq(units.short_name, shortName)).limit(1);
    return result[0] || null;
  }
}
