import { db } from '../database';
import { ProductRepository, ProductCreateData, ProductUpdateData } from '../repositories/product.repository';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { PriceHistoryRepository } from '../repositories/price-history.repository';
import { AuditService } from './audit.service';
import { LoggingService } from './logging.service';

export class InventoryService {
  static async createProduct(data: ProductCreateData) {
    if (data.sku) {
      const existingSku = await ProductRepository.getBySku(data.sku);
      if (existingSku) {
        throw new Error('DUPLICATE_SKU');
      }
    }

    let resultId: number = 0;

    await db.transaction(async (tx) => {
       const product = await ProductRepository.create(data, tx);
       resultId = product.id;

       // Create initial price history entry
       await PriceHistoryRepository.create({
         product_id: product.id,
         purchase_price: data.purchase_price,
         selling_price: data.selling_price
       }, tx);

       await AuditService.logAction('create', 'product', product.id, null, data, tx);
    });

    LoggingService.info('product_created', { id: resultId, sku: data.sku });
    return { id: resultId };
  }

  static async updateProduct(data: ProductUpdateData) {
    const existing = await ProductRepository.getById(data.id);
    if (!existing) {
      throw new Error('NOT_FOUND');
    }

    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await ProductRepository.getBySku(data.sku);
      if (existingSku) {
        throw new Error('DUPLICATE_SKU');
      }
    }

    await db.transaction(async (tx) => {
       await ProductRepository.update(data, tx);

       // Check if prices changed
       if (
         (data.purchase_price !== undefined && data.purchase_price !== existing.purchase_price) ||
         (data.selling_price !== undefined && data.selling_price !== existing.selling_price)
       ) {
         await PriceHistoryRepository.create({
           product_id: data.id,
           purchase_price: data.purchase_price ?? existing.purchase_price,
           selling_price: data.selling_price ?? existing.selling_price
         }, tx);
       }

       await AuditService.logAction('update', 'product', data.id, existing, data, tx);
    });

    LoggingService.info('product_updated', { id: data.id });
    return true;
  }

  static async adjustStock(productId: number, quantityChange: number, note: string) {
    if (quantityChange === 0) return true;

    const existing = await ProductRepository.getById(productId);
    if (!existing) {
      throw new Error('NOT_FOUND');
    }

    if (existing.current_quantity + quantityChange < 0) {
      throw new Error('NEGATIVE_STOCK');
    }

    let newQuantity = 0;
    await db.transaction(async (tx) => {
      await ProductRepository.updateStock(productId, quantityChange, tx);
      await StockMovementRepository.create({
        product_id: productId,
        movement_type: 'manual_adjustment',
        quantity_change: quantityChange,
        note
      }, tx);
      newQuantity = existing.current_quantity + quantityChange;
      await AuditService.logAction('adjust_stock', 'product', productId, { oldQty: existing.current_quantity }, { newQty: newQuantity, change: quantityChange, note }, tx);
    });

    LoggingService.info('stock_adjusted', { productId, quantityChange });
    return { newQuantity };
  }

  static async deleteProduct(id: number) {
    const existing = await ProductRepository.getById(id);
    if (!existing) {
      throw new Error('NOT_FOUND');
    }
    if (existing.deleted_at) {
      throw new Error('ALREADY_DELETED');
    }

    await db.transaction(async (tx) => {
      await ProductRepository.softDelete(id, tx);
      await AuditService.logAction('delete', 'product', id, existing, null, tx);
    });

    LoggingService.info('product_deleted', { id });
    return true;
  }

  static async restoreProduct(id: number) {
    const existing = await ProductRepository.getById(id);
    if (!existing) {
      throw new Error('NOT_FOUND');
    }
    if (!existing.deleted_at) {
      throw new Error('NOT_DELETED');
    }

    await db.transaction(async (tx) => {
      await ProductRepository.restore(id, tx);
      await AuditService.logAction('restore', 'product', id, existing, null, tx);
    });

    LoggingService.info('product_restored', { id });
    return true;
  }

  static async listProducts(includeDeleted?: boolean, page?: number, pageSize?: number) {
    return ProductRepository.list(includeDeleted, page, pageSize);
  }

  static async searchProducts(query: string, limit?: number) {
    return ProductRepository.searchFTS(query, limit);
  }

  static async getLowStock() {
    return ProductRepository.getLowStock();
  }

  static async getStockMovements(productId: number, page?: number, pageSize?: number) {
    return StockMovementRepository.listByProduct(productId, page, pageSize);
  }
}
