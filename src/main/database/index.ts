import Database from 'better-sqlite3';
import type { Database as BetterSqlite3Database } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { FileService } from '../services/file.service';

const basePath = FileService.getBasePath();
const dataPath = join(basePath, 'data');

if (!existsSync(dataPath)) {
  mkdirSync(dataPath, { recursive: true });
}

export const dbPath = join(dataPath, 'ledger.db');

export const sqlite: BetterSqlite3Database = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
