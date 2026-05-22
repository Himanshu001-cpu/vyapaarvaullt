import { z } from 'zod';

export const createTransactionSchema = z.object({
  party_id: z.number().int().positive(),
  invoice_id: z.number().int().positive().optional().nullable(),
  type: z.enum(['credit', 'debit']),
  amount: z.number().positive(),
  note: z.string().optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial().extend({
  id: z.number().int().positive(),
}).refine(data => Object.keys(data).length > 1, {
  message: "At least one field must be provided to update",
});

export const getTransactionSchema = z.object({
  id: z.number().int().positive(),
});

export const listTransactionSchema = z.object({
  partyId: z.number().int().positive().optional().nullable(),
  invoiceId: z.number().int().positive().optional().nullable(),
  type: z.enum(['credit', 'debit']).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
});

export const searchTransactionSchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.number().int().min(1).max(100).optional().default(20),
});
