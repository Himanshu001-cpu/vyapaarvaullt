import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.number().int().positive(),
});

export const createUnitSchema = z.object({
  name: z.string().min(1).max(50),
  short_name: z.string().min(1).max(10),
});

export const updateUnitSchema = createUnitSchema.partial().extend({
  id: z.number().int().positive(),
}).refine(data => Object.keys(data).length > 1, {
  message: "At least one field must be provided to update",
});

export const createConversionSchema = z.object({
  product_id: z.number().int().positive(),
  from_unit_id: z.number().int().positive(),
  to_unit_id: z.number().int().positive(),
  multiplier: z.number().positive(),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().max(100).optional().nullable(),
  category_id: z.number().int().positive().optional().nullable(),
  base_unit_id: z.number().int().positive(),
  purchase_price: z.number().min(0),
  selling_price: z.number().min(0),
  low_stock_threshold: z.number().min(0).optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.number().int().positive(),
}).refine(data => Object.keys(data).length > 1, {
  message: "At least one field must be provided to update",
});

export const adjustStockSchema = z.object({
  productId: z.number().int().positive(),
  quantityChange: z.number().refine(val => val !== 0, "Change cannot be zero"),
  note: z.string().min(1),
});

export const getByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const searchProductSchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export const listProductSchema = z.object({
  includeDeleted: z.boolean().optional().default(false),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
});

export const getMovementsSchema = z.object({
  productId: z.number().int().positive(),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
});
