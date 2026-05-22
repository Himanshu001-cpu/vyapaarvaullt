import { registerIpcHandler, authGuard } from './index';
import { BackupService } from '../services/backup.service';

export function registerBackupHandlers() {
  registerIpcHandler('backup:create', null, authGuard(async () => {
    const data = await BackupService.createBackup();
    return { success: true, data };
  }));
}
