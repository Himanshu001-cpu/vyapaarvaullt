import { registerIpcHandler, authGuard } from './index';
import { SettingsService } from '../services/settings.service';
import { updateSettingsSchema } from '../validation/settings.schema';

export function registerSettingsHandlers() {
  registerIpcHandler('settings:getAll', null, authGuard(async () => {
    const data = await SettingsService.getAllSettings();
    return { success: true, data };
  }));

  registerIpcHandler('settings:update', updateSettingsSchema, authGuard(async (payload) => {
    const success = await SettingsService.updateSettings(payload.settings);
    return { success: true, data: { success } };
  }));
}
