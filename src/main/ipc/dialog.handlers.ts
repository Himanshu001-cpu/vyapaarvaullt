import { ipcMain, dialog } from 'electron';

export function registerDialogHandlers() {
  ipcMain.handle('dialog:openFile', async (_, options: any) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(options);
    if (canceled) {
      return { success: true, data: null };
    } else {
      return { success: true, data: filePaths[0] };
    }
  });

  ipcMain.handle('dialog:saveFile', async (_, options: any) => {
    const { canceled, filePath } = await dialog.showSaveDialog(options);
    if (canceled) {
      return { success: true, data: null };
    } else {
      return { success: true, data: filePath };
    }
  });
}
