import { existsSync } from 'fs';
import { dbPath } from '../database';
import { BrowserWindow } from 'electron';
import { LoggingService } from './logging.service';

export class SsdDetectorService {
  private static interval: NodeJS.Timeout | null = null;
  private static isDisconnected = false;

  static startMonitoring() {
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      const currentlyExists = existsSync(dbPath);

      if (!currentlyExists && !this.isDisconnected) {
        this.isDisconnected = true;
        LoggingService.error('storage_disconnected', { path: dbPath });
        this.broadcastState();
      } else if (currentlyExists && this.isDisconnected) {
        this.isDisconnected = false;
        LoggingService.info('storage_reconnected', { path: dbPath });
        this.broadcastState();
      }
    }, 2000);
  }

  static stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private static broadcastState() {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
      win.webContents.send('storage:status', { disconnected: this.isDisconnected });
    });
  }

  static getIsDisconnected() {
    return this.isDisconnected;
  }
}
