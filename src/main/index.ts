import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { runMigrations } from "./database/migrate";
import { seedDatabase } from "./database/seed";
import { mkdirSync, existsSync } from 'fs';
import { FileService } from './services/file.service';

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
  require("./ipc/auth.handlers").registerAuthHandlers();
  require("./ipc/settings.handlers").registerSettingsHandlers();
  require("./ipc/backup.handlers").registerBackupHandlers();
  require("./ipc/audit.handlers").registerAuditHandlers();
  require("./ipc/party.handlers").registerPartyHandlers();
  require("./ipc/inventory.handlers").registerInventoryHandlers();
  require("./ipc/transaction.handlers").registerTransactionHandlers();
  require("./ipc/invoice.handlers").registerInvoiceHandlers();
  require("./ipc/analytics.handlers").registerAnalyticsHandlers();
  require("./ipc/search.handlers").registerSearchHandlers();
  require("./ipc/import-export.handlers").registerImportExportHandlers();
  require("./ipc/dialog.handlers").registerDialogHandlers();

  runMigrations();
  await seedDatabase();
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
