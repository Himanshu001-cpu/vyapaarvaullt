import { db } from '../database';
import { settings } from '../database/schema';
import { FileService } from './file.service';
import { LoggingService } from './logging.service';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const INTERNAL_KEYS = ['security_pin_hash'];

export class SettingsService {
  static getConfigJsonPath() {
    return join(FileService.getConfigPath(), 'settings.json');
  }

  static getRuntimeConfig() {
    const configPath = this.getConfigJsonPath();
    if (!existsSync(configPath)) {
       const defaultConfig = {
           ssdRoot: FileService.getBasePath()
       };
       writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
       return defaultConfig;
    }
    try {
      return JSON.parse(readFileSync(configPath, 'utf8'));
    } catch(e) {
       LoggingService.warn('failed_to_read_config_json', e);
       return { ssdRoot: FileService.getBasePath() };
    }
  }

  static saveRuntimeConfig(config: Record<string, any>) {
     try {
         writeFileSync(this.getConfigJsonPath(), JSON.stringify(config, null, 2));
     } catch(e) {
         LoggingService.error('failed_to_write_config_json', config, e as Error);
     }
  }

  static async getAllSettings(): Promise<Record<string, string>> {
    const rows = await db.select().from(settings);
    const result: Record<string, string> = {};
    for (const row of rows) {
      if (!INTERNAL_KEYS.includes(row.key)) {
        result[row.key] = row.value;
      }
    }

    const runtimeConfig = this.getRuntimeConfig();
    return { ...result, ...runtimeConfig };
  }

  static async updateSettings(newSettings: Record<string, string>): Promise<boolean> {
    try {
      const { ssdRoot, ...dbSettings } = newSettings;

      if (ssdRoot) {
          const currentConfig = this.getRuntimeConfig();
          this.saveRuntimeConfig({ ...currentConfig, ssdRoot });
      }

      await db.transaction(async (tx) => {
        for (const [key, value] of Object.entries(dbSettings)) {
          if (INTERNAL_KEYS.includes(key)) {
             throw new Error(`Cannot update internal key: ${key}`);
          }
          await tx
            .insert(settings)
            .values({ key, value })
            .onConflictDoUpdate({
              target: settings.key,
              set: { value },
            });
        }
      });
      LoggingService.info('settings_updated');
      return true;
    } catch (error) {
      LoggingService.error('settings_update_failed', error);
      throw error;
    }
  }
}
