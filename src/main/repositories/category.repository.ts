import { db } from '../database';
import { categories, products } from '../database/schema';
import { eq, sql } from 'drizzle-orm';

export interface CategoryData {
  name: string;
}

export class CategoryRepository {
  static async create(data: CategoryData) {
    const result = await db.insert(categories).values(data).returning({ id: categories.id });
    return result[0];
  }

  static async update(id: number, name: string) {
    await db.update(categories)
      .set({ name })
      .where(eq(categories.id, id));
  }

  static async delete(id: number) {
    // Check if in use
    const countResult = await db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(products).where(eq(products.category_id, id));

    if (countResult[0].count > 0) {
      throw new Error('CATEGORY_IN_USE');
    }

    await db.delete(categories).where(eq(categories.id, id));
  }

  static async list() {
    return db.select().from(categories).orderBy(categories.name);
  }

  static async getByName(name: string) {
    const result = await db.select().from(categories).where(eq(categories.name, name)).limit(1);
    return result[0] || null;
  }
}
