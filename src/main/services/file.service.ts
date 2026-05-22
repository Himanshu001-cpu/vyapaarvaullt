import { app } from 'electron';
import { join, dirname } from 'path';

export class FileService {
  static getBasePath(): string {
    if (app.isPackaged) {
      if (process.platform === 'linux' && process.env.APPIMAGE) {
        return dirname(process.env.APPIMAGE);
      }
      return process.env.PORTABLE_EXECUTABLE_DIR || dirname(app.getPath('exe'));
    }
    return app.getPath('userData');
  }

  static getBackupPath(): string {
    return join(this.getBasePath(), 'backups');
  }

  static getLogsPath(): string {
    return join(this.getBasePath(), 'logs');
  }

  static getConfigPath(): string {
    return join(this.getBasePath(), 'config');
  }
}
