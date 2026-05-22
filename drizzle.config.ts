import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/main/database/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './data/ledger.db',
  },
});
