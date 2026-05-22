import { z } from 'zod';

export const createPartySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  phone: z.string().regex(/^[\d\s\-+()]{0,20}$/, 'Invalid phone format').optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  type: z.enum(['customer', 'supplier', 'both']),
});

export const updatePartySchema = createPartySchema.partial().extend({
  id: z.number().int().positive(),
}).refine(data => Object.keys(data).length > 1, {
  message: "At least one field must be provided to update",
});

export const getPartySchema = z.object({
  id: z.number().int().positive(),
});

export const searchPartySchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(['customer', 'supplier', 'both']).optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export const listPartySchema = z.object({
  type: z.enum(['customer', 'supplier', 'both']).optional(),
  includeDeleted: z.boolean().optional().default(false),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
});
