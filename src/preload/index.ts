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
    }
  });
} catch (error) {
  console.error(error);
}
