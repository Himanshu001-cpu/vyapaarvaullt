import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import { join } from 'path';
import { app } from 'electron';

export function runMigrations() {
  try {
    const migrationsFolder = app.isPackaged
      ? join(process.resourcesPath, 'app.asar/drizzle')
      : join(app.getAppPath(), 'drizzle');

    migrate(db, { migrationsFolder });
    console.log('Migrations applied successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
