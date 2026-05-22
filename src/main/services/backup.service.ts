import { FileService } from './file.service';
import { sqlite } from '../database';
import { join } from 'path';
import { createWriteStream, unlinkSync } from 'fs';
import { LoggingService } from './logging.service';
import * as archiver from 'archiver';

const getArchiver = () => {
  return (archiver.default || archiver) as any;
};

export class BackupService {
  static async createBackup(): Promise<{ filePath: string }> {
    return new Promise(async (resolve, reject) => {
      let tempBackupPath = '';
      try {
        const date = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup-${date}.zip`;
        const backupPath = join(FileService.getBackupPath(), backupFileName);

        // Use better-sqlite3 built-in backup API to safely flush WAL and copy
        tempBackupPath = join(FileService.getBasePath(), 'data', 'temp', `temp-${date}.db`);
        await sqlite.backup(tempBackupPath);

        const output = createWriteStream(backupPath);
        const archive = getArchiver()('zip', {
          zlib: { level: 9 }
        });

        output.on('close', function() {
          LoggingService.info('backup_created', { path: backupPath, bytes: archive.pointer() });
          try {
            unlinkSync(tempBackupPath); // Clean up temp file
          } catch(e) {
            console.error('Failed to cleanup temp backup file', e);
          }
          resolve({ filePath: backupPath });
        });

        archive.on('error', function(err) {
          LoggingService.error('backup_failed', {}, err);
          reject(new Error('BACKUP_FAILED'));
        });

        archive.pipe(output);
        archive.file(tempBackupPath, { name: 'ledger.db' });
        archive.finalize();
      } catch (error) {
        if (tempBackupPath) {
          try {
             unlinkSync(tempBackupPath);
          } catch(e) {}
        }
        LoggingService.error('backup_failed', {}, error as Error);
        reject(new Error('BACKUP_FAILED'));
      }
    });
  }
}
