import { db } from '../database';
import { products, categories, units } from '../database/schema';
import { eq, desc, isNull, sql, and, SQL, lte } from 'drizzle-orm';

export interface ProductCreateData {
  name: string;
  sku?: string | null;
  category_id?: number | null;
  base_unit_id: number;
  purchase_price: number;
  selling_price: number;
  low_stock_threshold?: number | null;
}

export interface ProductUpdateData extends Partial<ProductCreateData> {
  id: number;
}

export class ProductRepository {
  static async create(data: ProductCreateData, tx: any = db) {
    const result = await tx.insert(products).values(data).returning({ id: products.id });
    return result[0];
  }

  static async update(data: ProductUpdateData, tx: any = db) {
    const { id, ...updateFields } = data;
    await tx.update(products)
      .set({ ...updateFields, updated_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(products.id, id));
  }

  static async softDelete(id: number) {
    await db.update(products)
      .set({ deleted_at: sql`CURRENT_TIMESTAMP`, updated_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(products.id, id));
  }

  static async restore(id: number) {
    await db.update(products)
      .set({ deleted_at: null, updated_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(products.id, id));
  }

  static async updateStock(id: number, quantityChange: number, tx: any = db) {
    await tx.update(products)
      .set({
        current_quantity: sql`${products.current_quantity} + ${quantityChange}`,
        updated_at: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(products.id, id));
  }

  static async getById(id: number) {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0] || null;
  }

  static async getBySku(sku: string) {
    const result = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    return result[0] || null;
  }

  static async list(includeDeleted = false, page = 1, pageSize = 20) {
    let conditions: SQL<unknown>[] = [];

    if (!includeDeleted) {
      conditions.push(isNull(products.deleted_at));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(products)
      .where(whereClause);

    const data = await db
      .select({
         id: products.id,
         name: products.name,
         sku: products.sku,
         category_id: products.category_id,
         category_name: categories.name,
         base_unit_id: products.base_unit_id,
         base_unit_name: units.name,
         purchase_price: products.purchase_price,
         selling_price: products.selling_price,
         current_quantity: products.current_quantity,
         low_stock_threshold: products.low_stock_threshold,
         created_at: products.created_at,
         updated_at: products.updated_at
      })
      .from(products)
      .leftJoin(categories, eq(products.category_id, categories.id))
      .leftJoin(units, eq(products.base_unit_id, units.id))
      .where(whereClause)
      .orderBy(desc(products.created_at))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      data,
      total: countResult.count,
      page,
      pageSize
    };
  }

  static async getLowStock() {
    return db
      .select({
         id: products.id,
         name: products.name,
         sku: products.sku,
         current_quantity: products.current_quantity,
         low_stock_threshold: products.low_stock_threshold,
         base_unit_name: units.name,
      })
      .from(products)
      .leftJoin(units, eq(products.base_unit_id, units.id))
      .where(
        and(
          isNull(products.deleted_at),
          lte(products.current_quantity, products.low_stock_threshold || 0)
        )
      );
  }

  static async searchFTS(query: string, limit = 20) {
    // Utilize FTS5 virtual table
    return db
      .select({
         id: products.id,
         name: products.name,
         sku: products.sku,
         current_quantity: products.current_quantity,
         selling_price: products.selling_price,
         base_unit_name: units.name,
      })
      .from(products)
      .leftJoin(units, eq(products.base_unit_id, units.id))
      .innerJoin(sql`products_fts`, eq(products.id, sql`products_fts.rowid`))
      .where(
        and(
          isNull(products.deleted_at),
          sql`products_fts MATCH ${query}`
        )
      )
      .limit(limit);
  }

  static async getInventoryValuation() {
    const [result] = await db
      .select({
        totalValue: sql<number>`SUM(${products.current_quantity} * ${products.purchase_price})`.mapWith(Number),
        productCount: sql<number>`count(*)`.mapWith(Number)
      })
      .from(products)
      .where(and(isNull(products.deleted_at)));

    return {
      totalValue: result?.totalValue || 0,
      productCount: result?.productCount || 0
    };
  }
}
