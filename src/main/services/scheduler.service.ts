import { BackupService } from './backup.service';
import { LoggingService } from './logging.service';

export class SchedulerService {
  private static backupInterval: NodeJS.Timeout | null = null;
  private static readonly ONE_DAY_MS = 24 * 60 * 60 * 1000;

  static startDailyBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    // Set an interval to run once every 24 hours
    this.backupInterval = setInterval(async () => {
      try {
        LoggingService.info('automated_daily_backup_started');
        await BackupService.createBackup();
      } catch (e) {
        LoggingService.error('automated_daily_backup_failed', e);
      }
    }, this.ONE_DAY_MS);

    LoggingService.info('scheduler_started');
  }

  static stop() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }
}
