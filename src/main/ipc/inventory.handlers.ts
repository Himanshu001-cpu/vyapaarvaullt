import { registerIpcHandler, authGuard } from './index';
import { InventoryService } from '../services/inventory.service';
import { CategoryRepository } from '../repositories/category.repository';
import { UnitRepository } from '../repositories/unit.repository';
import { UnitConversionRepository } from '../repositories/unit-conversion.repository';
import {
  createCategorySchema, updateCategorySchema,
  createUnitSchema, updateUnitSchema,
  createConversionSchema, createProductSchema,
  updateProductSchema, adjustStockSchema,
  getByIdSchema, searchProductSchema,
  listProductSchema, getMovementsSchema
} from '../validation/inventory.schema';

export function registerInventoryHandlers() {
  // Categories
  registerIpcHandler('category:create', createCategorySchema, authGuard(async (payload) => {
    try {
      const result = await CategoryRepository.create(payload);
      return { success: true, data: result };
    } catch(e: any) {
      if (e.message.includes('UNIQUE constraint failed')) return { success: false, error: { code: 'DUPLICATE_NAME', message: 'Category name already exists' }};
      throw e;
    }
  }));

  registerIpcHandler('category:list', null, authGuard(async () => {
    const data = await CategoryRepository.list();
    return { success: true, data };
  }));

  registerIpcHandler('category:update', updateCategorySchema, authGuard(async (payload) => {
    try {
      await CategoryRepository.update(payload.id, payload.name);
      return { success: true, data: { success: true } };
    } catch(e: any) {
      if (e.message.includes('UNIQUE constraint failed')) return { success: false, error: { code: 'DUPLICATE_NAME', message: 'Category name already exists' }};
      throw e;
    }
  }));

  registerIpcHandler('category:delete', getByIdSchema, authGuard(async (payload) => {
    try {
      await CategoryRepository.delete(payload.id);
      return { success: true, data: { success: true } };
    } catch(e: any) {
      if (e.message === 'CATEGORY_IN_USE') return { success: false, error: { code: 'CATEGORY_IN_USE', message: 'Cannot delete category because it is used by products' }};
      throw e;
    }
  }));

  // Units
  registerIpcHandler('unit:create', createUnitSchema, authGuard(async (payload) => {
    try {
      const result = await UnitRepository.create(payload);
      return { success: true, data: result };
    } catch(e: any) {
      if (e.message.includes('UNIQUE constraint failed')) return { success: false, error: { code: 'DUPLICATE_NAME', message: 'Unit name or short name already exists' }};
      throw e;
    }
  }));

  registerIpcHandler('unit:list', null, authGuard(async () => {
    const data = await UnitRepository.list();
    return { success: true, data };
  }));

  registerIpcHandler('unit:update', updateUnitSchema, authGuard(async (payload) => {
    try {
      await UnitRepository.update(payload.id, payload);
      return { success: true, data: { success: true } };
    } catch(e: any) {
      if (e.message.includes('UNIQUE constraint failed')) return { success: false, error: { code: 'DUPLICATE_NAME', message: 'Unit name or short name already exists' }};
      throw e;
    }
  }));

  registerIpcHandler('unit:delete', getByIdSchema, authGuard(async (payload) => {
    try {
      await UnitRepository.delete(payload.id);
      return { success: true, data: { success: true } };
    } catch(e: any) {
      if (e.message === 'UNIT_IN_USE') return { success: false, error: { code: 'UNIT_IN_USE', message: 'Cannot delete unit because it is currently in use' }};
      throw e;
    }
  }));

  // Unit Conversions
  registerIpcHandler('conversion:create', createConversionSchema, authGuard(async (payload) => {
    try {
      const result = await UnitConversionRepository.create(payload);
      return { success: true, data: result };
    } catch(e: any) {
      if (e.message === 'CIRCULAR_CONVERSION') return { success: false, error: { code: 'CIRCULAR_CONVERSION', message: 'Cannot convert a unit to itself' }};
      if (e.message === 'DUPLICATE_CONVERSION') return { success: false, error: { code: 'DUPLICATE_CONVERSION', message: 'Conversion already exists' }};
      throw e;
    }
  }));

  registerIpcHandler('conversion:list', getByIdSchema, authGuard(async (payload) => {
    const data = await UnitConversionRepository.listByProduct(payload.id); // Reusing getByIdSchema since it just needs an ID
    return { success: true, data };
  }));

  registerIpcHandler('conversion:delete', getByIdSchema, authGuard(async (payload) => {
    await UnitConversionRepository.delete(payload.id);
    return { success: true, data: { success: true } };
  }));

  // Products
  registerIpcHandler('inventory:create', createProductSchema, authGuard(async (payload) => {
    try {
      const result = await InventoryService.createProduct(payload);
      return { success: true, data: result };
    } catch(e: any) {
      if (e.message === 'DUPLICATE_SKU') return { success: false, error: { code: 'DUPLICATE_SKU', message: 'SKU already exists' }};
      throw e;
    }
  }));

  registerIpcHandler('inventory:update', updateProductSchema, authGuard(async (payload) => {
    try {
      const success = await InventoryService.updateProduct(payload);
      return { success: true, data: { success } };
    } catch(e: any) {
      if (e.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' }};
      if (e.message === 'DUPLICATE_SKU') return { success: false, error: { code: 'DUPLICATE_SKU', message: 'SKU already exists' }};
      throw e;
    }
  }));

  registerIpcHandler('inventory:delete', getByIdSchema, authGuard(async (payload) => {
    try {
      const success = await InventoryService.deleteProduct(payload.id);
      return { success: true, data: { success } };
    } catch(e: any) {
      if (e.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' }};
      if (e.message === 'ALREADY_DELETED') return { success: false, error: { code: 'ALREADY_DELETED', message: 'Product already deleted' }};
      throw e;
    }
  }));

  registerIpcHandler('inventory:restore', getByIdSchema, authGuard(async (payload) => {
    try {
      const success = await InventoryService.restoreProduct(payload.id);
      return { success: true, data: { success } };
    } catch(e: any) {
      if (e.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' }};
      if (e.message === 'NOT_DELETED') return { success: false, error: { code: 'NOT_DELETED', message: 'Product not deleted' }};
      throw e;
    }
  }));

  registerIpcHandler('inventory:adjust', adjustStockSchema, authGuard(async (payload) => {
    try {
      const data = await InventoryService.adjustStock(payload.productId, payload.quantityChange, payload.note);
      return { success: true, data };
    } catch(e: any) {
      if (e.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' }};
      if (e.message === 'NEGATIVE_STOCK') return { success: false, error: { code: 'NEGATIVE_STOCK', message: 'Adjustment would result in negative stock' }};
      throw e;
    }
  }));

  registerIpcHandler('inventory:list', listProductSchema, authGuard(async (payload) => {
    const data = await InventoryService.listProducts(payload.includeDeleted, payload.page, payload.pageSize);
    return { success: true, data };
  }));

  registerIpcHandler('inventory:search', searchProductSchema, authGuard(async (payload) => {
    const data = await InventoryService.searchProducts(payload.query, payload.limit);
    return { success: true, data };
  }));

  registerIpcHandler('inventory:lowStock', null, authGuard(async () => {
    const data = await InventoryService.getLowStock();
    return { success: true, data };
  }));

  registerIpcHandler('inventory:movements', getMovementsSchema, authGuard(async (payload) => {
    const data = await InventoryService.getStockMovements(payload.productId, payload.page, payload.pageSize);
    return { success: true, data };
  }));
}
