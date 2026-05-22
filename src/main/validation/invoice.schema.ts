import { z } from 'zod';

export const invoiceItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().positive(),
  sellingPrice: z.number().min(0),
});

export const createInvoiceSchema = z.object({
  partyId: z.number().int().positive(),
  items: z.array(invoiceItemSchema).min(1),
  discount: z.number().min(0).optional().nullable(),
  extraCharges: z.number().min(0).optional().nullable(),
  amountPaid: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const voidInvoiceSchema = z.object({
  id: z.number().int().positive(),
  reason: z.string().optional().nullable(),
});

export const getInvoiceSchema = z.object({
  id: z.number().int().positive(),
});

export const listInvoiceSchema = z.object({
  partyId: z.number().int().positive().optional().nullable(),
  status: z.enum(['completed', 'voided']).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
});

export const searchInvoiceSchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.number().int().min(1).max(100).optional().default(20),
});
