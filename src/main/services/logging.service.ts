import { join } from 'path';
import { appendFileSync } from 'fs';
import { FileService } from './file.service';

type LogLevel = 'info' | 'warn' | 'error';

export class LoggingService {
  private static getLogFile(): string {
    const date = new Date().toISOString().split('T')[0];
    return join(FileService.getLogsPath(), `app-${date}.log`);
  }

  private static log(level: LogLevel, event: string, details?: unknown, error?: Error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      details,
      error: error ? { message: error.message, stack: error.stack } : undefined,
    };

    try {
      const logFile = this.getLogFile();
      const fs = require('fs');
      const dirname = require('path').dirname;
      fs.mkdirSync(dirname(logFile), { recursive: true });
      appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (e) {
      console.error('Failed to write to log file', e);
    }
  }

  static info(event: string, details?: unknown) {
    this.log('info', event, details);
  }

  static warn(event: string, details?: unknown) {
    this.log('warn', event, details);
  }

  static error(event: string, details?: unknown, error?: Error) {
    this.log('error', event, details, error);
  }
}
