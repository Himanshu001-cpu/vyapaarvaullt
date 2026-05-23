import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { runMigrations } from "./database/migrate";
import { seedDatabase } from "./database/seed";
import { mkdirSync, existsSync } from 'fs';
import { FileService } from './services/file.service';
import { SchedulerService } from './services/scheduler.service';
import { SsdDetectorService } from './services/ssd.detector';
import { BackupService } from './services/backup.service';
import { LoggingService } from './services/logging.service';

import { registerAuthHandlers } from './ipc/auth.handlers';
import { registerSettingsHandlers } from './ipc/settings.handlers';
import { registerBackupHandlers } from './ipc/backup.handlers';
import { registerAuditHandlers } from './ipc/audit.handlers';
import { registerPartyHandlers } from './ipc/party.handlers';
import { registerInventoryHandlers } from './ipc/inventory.handlers';
import { registerTransactionHandlers } from './ipc/transaction.handlers';
import { registerInvoiceHandlers } from './ipc/invoice.handlers';
import { registerAnalyticsHandlers } from './ipc/analytics.handlers';
import { registerSearchHandlers } from './ipc/search.handlers';
import { registerImportExportHandlers } from './ipc/import-export.handlers';
import { registerDialogHandlers } from './ipc/dialog.handlers';
import { registerUndoHandlers } from './ipc/undo.handlers';

function setupDirectories() {
  const basePath = FileService.getBasePath();
  const dirs = ['data', 'data/temp', 'backups', 'exports', 'logs', 'config'];

  dirs.forEach(dir => {
    const fullPath = join(basePath, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  });
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.vyapaarvault.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupDirectories();
  SchedulerService.startDailyBackup();
  SsdDetectorService.startMonitoring();

  registerAuthHandlers();
  registerSettingsHandlers();
  registerBackupHandlers();
  registerAuditHandlers();
  registerPartyHandlers();
  registerInventoryHandlers();
  registerTransactionHandlers();
  registerInvoiceHandlers();
  registerAnalyticsHandlers();
  registerSearchHandlers();
  registerImportExportHandlers();
  registerDialogHandlers();
  registerUndoHandlers();

  await runMigrations();
  await seedDatabase();
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

let isQuitting = false;
app.on('before-quit', async (e) => {
  if (!isQuitting) {
    e.preventDefault();
    LoggingService.info('app_closing_starting_backup');
    try {
      await BackupService.createBackup();
    } catch (err) {
      LoggingService.error('app_close_backup_failed', err);
    } finally {
      isQuitting = true;
      app.quit();
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
