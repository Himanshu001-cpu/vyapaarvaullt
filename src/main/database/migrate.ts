import { join } from 'path';
import { app } from 'electron';
import { readFileSync, existsSync } from 'fs';
import { sqlite } from './index';
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
    }

    // 1. Ensure __drizzle_migrations table exists
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id integer PRIMARY KEY AUTOINCREMENT,
        hash text NOT NULL,
        created_at integer
      );
    `);

    // 2. Read journal
    const journalPath = join(migrationsFolder, 'meta/_journal.json');
    if (!existsSync(journalPath)) {
      throw new Error(`Migration journal not found at ${journalPath}`);
    }
    const journal = JSON.parse(readFileSync(journalPath, 'utf8'));
    const entries = journal.entries || [];

    // 3. Get applied migrations
    const applied = sqlite.prepare('SELECT hash FROM __drizzle_migrations').all() as { hash: string }[];
    const appliedHashes = new Set(applied.map(row => row.hash));

    // 4. Run each pending migration in a transaction
    for (const entry of entries) {
      const tag = entry.tag; // e.g. "0000_stiff_nicolaos"
      if (!appliedHashes.has(tag)) {
        console.log(`Applying migration: ${tag}.sql`);
        LoggingService.info('applying_migration', { tag });

        const sqlPath = join(migrationsFolder, `${tag}.sql`);
        const sqlContent = readFileSync(sqlPath, 'utf8');

        // Run within a transaction using direct SQLite driver to avoid Drizzle parsing limitations on semicolons in triggers
        sqlite.transaction(() => {
          sqlite.exec(sqlContent);
          sqlite.prepare('INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)')
                .run(tag, Date.now());
        })();

        console.log(`Successfully applied migration: ${tag}.sql`);
        LoggingService.info('migration_success', { tag });
      }
    }

    console.log('Migrations applied successfully');
    LoggingService.info('migrations_applied');
  } catch (error) {
    console.error('Migration failed:', error);
    LoggingService.error('migrations_failed', error);
    throw error;
  }
}
