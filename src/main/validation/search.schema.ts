import { z } from 'zod';

export const globalSearchSchema = z.object({
  query: z.string().max(200),
  limit: z.number().int().positive().optional().default(10)
});
