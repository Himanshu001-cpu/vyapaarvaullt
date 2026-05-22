import { app } from 'electron';
import { join } from 'path';

export class FileService {
  static getBasePath(): string {
    if (app.isPackaged) {
      return process.env.PORTABLE_EXECUTABLE_DIR || app.getPath('exe').replace(/\\[^\\]+$/, '');
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
