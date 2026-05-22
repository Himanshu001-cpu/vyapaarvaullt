import { z } from 'zod';

export const importExcelSchema = z.object({
  filePath: z.string().min(1),
  entityType: z.enum(['customers', 'suppliers', 'products', 'transactions']),
  columnMapping: z.record(z.string(), z.string()),
  skipInvalidRows: z.boolean().optional().default(false),
});

export const exportExcelSchema = z.object({
  reportType: z.enum(['customerStatement', 'dailySales', 'monthlySummary', 'pendingBalance']),
  partyId: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
