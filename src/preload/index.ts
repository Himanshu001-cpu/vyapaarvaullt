import { contextBridge, ipcRenderer } from 'electron';

if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow');
}

try {
  contextBridge.exposeInMainWorld('api', {
    auth: {
      checkPinSet: () => ipcRenderer.invoke('auth:checkPinSet'),
      setupPin: (data: unknown) => ipcRenderer.invoke('auth:setupPin', data),
      login: (data: unknown) => ipcRenderer.invoke('auth:login', data),
      changePin: (data: unknown) => ipcRenderer.invoke('auth:changePin', data),
      validateSession: () => ipcRenderer.invoke('auth:validateSession'),
    },
    settings: {
      getAll: () => ipcRenderer.invoke('settings:getAll'),
      update: (data: unknown) => ipcRenderer.invoke('settings:update', data),
    },
    backup: {
      create: () => ipcRenderer.invoke('backup:create'),
    },
    audit: {
      list: () => ipcRenderer.invoke('audit:list'),
    },
    party: {
      create: (data: unknown) => ipcRenderer.invoke('party:create', data),
      update: (data: unknown) => ipcRenderer.invoke('party:update', data),
      delete: (data: unknown) => ipcRenderer.invoke('party:delete', data),
      restore: (data: unknown) => ipcRenderer.invoke('party:restore', data),
      get: (data: unknown) => ipcRenderer.invoke('party:get', data),
      search: (data: unknown) => ipcRenderer.invoke('party:search', data),
      list: (data: unknown) => ipcRenderer.invoke('party:list', data),
    },
    category: {
      create: (data: unknown) => ipcRenderer.invoke('category:create', data),
      update: (data: unknown) => ipcRenderer.invoke('category:update', data),
      delete: (data: unknown) => ipcRenderer.invoke('category:delete', data),
      list: () => ipcRenderer.invoke('category:list'),
    },
    unit: {
      create: (data: unknown) => ipcRenderer.invoke('unit:create', data),
      update: (data: unknown) => ipcRenderer.invoke('unit:update', data),
      delete: (data: unknown) => ipcRenderer.invoke('unit:delete', data),
      list: () => ipcRenderer.invoke('unit:list'),
    },
    conversion: {
      create: (data: unknown) => ipcRenderer.invoke('conversion:create', data),
      delete: (data: unknown) => ipcRenderer.invoke('conversion:delete', data),
      list: (data: unknown) => ipcRenderer.invoke('conversion:list', data),
    },
    inventory: {
      create: (data: unknown) => ipcRenderer.invoke('inventory:create', data),
      update: (data: unknown) => ipcRenderer.invoke('inventory:update', data),
      delete: (data: unknown) => ipcRenderer.invoke('inventory:delete', data),
      restore: (data: unknown) => ipcRenderer.invoke('inventory:restore', data),
      adjust: (data: unknown) => ipcRenderer.invoke('inventory:adjust', data),
      list: (data: unknown) => ipcRenderer.invoke('inventory:list', data),
      search: (data: unknown) => ipcRenderer.invoke('inventory:search', data),
      lowStock: () => ipcRenderer.invoke('inventory:lowStock'),
      movements: (data: unknown) => ipcRenderer.invoke('inventory:movements', data),
    },
    transaction: {
      create: (data: unknown) => ipcRenderer.invoke('transaction:create', data),
      update: (data: unknown) => ipcRenderer.invoke('transaction:update', data),
      delete: (data: unknown) => ipcRenderer.invoke('transaction:delete', data),
      list: (data: unknown) => ipcRenderer.invoke('transaction:list', data),
      search: (data: unknown) => ipcRenderer.invoke('transaction:search', data),
    },
    invoice: {
      create: (data: unknown) => ipcRenderer.invoke('invoice:create', data),
      void: (data: unknown) => ipcRenderer.invoke('invoice:void', data),
      get: (data: unknown) => ipcRenderer.invoke('invoice:get', data),
      list: (data: unknown) => ipcRenderer.invoke('invoice:list', data),
      search: (data: unknown) => ipcRenderer.invoke('invoice:search', data),
    },
    analytics: {
      dashboard: () => ipcRenderer.invoke('analytics:dashboard'),
    },
    search: {
      global: (data: unknown) => ipcRenderer.invoke('search:global', data),
    },
    importExport: {
      importExcel: (data: unknown) => ipcRenderer.invoke('import:excel', data),
      exportExcel: (data: unknown) => ipcRenderer.invoke('export:excel', data),
    },
    undo: {
      perform: (data: unknown) => ipcRenderer.invoke('undo:perform', data),
      history: (data: unknown) => ipcRenderer.invoke('undo:history', data),
    },
    dialog: {
      openFile: (options: unknown) => ipcRenderer.invoke('dialog:openFile', options),
      saveFile: (options: unknown) => ipcRenderer.invoke('dialog:saveFile', options),
    },
    onStorageStatus: (callback: (status: any) => void) => {
      ipcRenderer.on('storage:status', (_, data) => callback(data));
      return () => {
        ipcRenderer.removeAllListeners('storage:status');
      };
    }
  });
} catch (error) {
  console.error(error);
}
