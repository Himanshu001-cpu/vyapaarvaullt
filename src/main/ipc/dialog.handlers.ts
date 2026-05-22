import { dialog } from 'electron';
import { registerIpcHandler, authGuard } from './index';

export function registerDialogHandlers() {
  registerIpcHandler('dialog:openFile', null, authGuard(async (options: any) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(options || {});
    if (canceled) {
      return { success: true, data: null };
    } else {
      return { success: true, data: filePaths[0] };
    }
  }));

  registerIpcHandler('dialog:saveFile', null, authGuard(async (options: any) => {
    const { canceled, filePath } = await dialog.showSaveDialog(options || {});
    if (canceled) {
      return { success: true, data: null };
    } else {
      return { success: true, data: filePath };
    }
  }));
}
