import { db } from '../database';
import { product_price_history } from '../database/schema';

export interface PriceHistoryData {
  product_id: number;
  purchase_price: number;
  selling_price: number;
}

export class PriceHistoryRepository {
  static async create(data: PriceHistoryData, tx: any = db) {
    const result = await tx.insert(product_price_history).values(data).returning({ id: product_price_history.id });
    return result[0];
  }
}
