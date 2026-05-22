import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import { join } from 'path';
import { app } from 'electron';
import { BackupService } from '../services/backup.service';
import { LoggingService } from '../services/logging.service';

export async function runMigrations() {
  try {
    const migrationsFolder = app.isPackaged
      ? join(process.resourcesPath, 'app.asar/drizzle')
      : join(app.getAppPath(), 'drizzle');

    // Always create a backup before applying migrations
    try {
       await BackupService.createBackup();
       LoggingService.info('pre_migration_backup_successful');
    } catch (e) {
       LoggingService.error('pre_migration_backup_failed', e);
       // We still proceed with migration even if backup fails in MVP,
       // but in production we might want to throw to be extra safe.
    }

    migrate(db, { migrationsFolder });
    console.log('Migrations applied successfully');
    LoggingService.info('migrations_applied');
  } catch (error) {
    console.error('Migration failed:', error);
    LoggingService.error('migrations_failed', error);
    throw error;
  }
}
