import { registerIpcHandler, authGuard } from './index';
import { ImportService } from '../services/import.service';
import { ExportService } from '../services/export.service';
import { importExcelSchema, exportExcelSchema } from '../validation/import-export.schema';

export function registerImportExportHandlers() {
  registerIpcHandler('import:excel', importExcelSchema, authGuard(async (payload) => {
    const data = await ImportService.importExcel(payload.filePath, payload.entityType, payload.columnMapping);
    return { success: true, data };
  }));

  registerIpcHandler('export:excel', exportExcelSchema, authGuard(async (payload) => {
    const data = await ExportService.exportExcel(payload.reportType, payload);
    return { success: true, data };
  }));
}
