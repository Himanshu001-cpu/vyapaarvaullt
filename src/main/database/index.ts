import Database from 'better-sqlite3';
import type { Database as BetterSqlite3Database } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { app } from 'electron';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

// Get the path where the executable is located, or app data in dev
const getBasePath = () => {
  if (app.isPackaged) {
    // In production (portable mode), use the directory where the .exe is located
    return process.env.PORTABLE_EXECUTABLE_DIR || app.getPath('exe').replace(/\\[^\\]+$/, '');
  }
  return app.getPath('userData');
};

const basePath = getBasePath();
const dataPath = join(basePath, 'data');

if (!existsSync(dataPath)) {
  mkdirSync(dataPath, { recursive: true });
}

export const dbPath = join(dataPath, 'ledger.db');

export const sqlite: BetterSqlite3Database = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
