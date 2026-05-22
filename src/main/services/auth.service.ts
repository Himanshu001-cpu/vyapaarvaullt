import bcrypt from 'bcryptjs';
import { db } from '../database';
import { settings } from '../database/schema';
import { eq } from 'drizzle-orm';
import { LoggingService } from './logging.service';
import { setAuthenticated } from '../ipc';

const PIN_KEY = 'security_pin_hash';

export class AuthService {
  static async checkPinSet(): Promise<boolean> {
    const result = await db.select().from(settings).where(eq(settings.key, PIN_KEY)).limit(1);
    return result.length > 0;
  }

  static async setupPin(pin: string): Promise<boolean> {
    const isSet = await this.checkPinSet();
    if (isSet) {
      throw new Error('PIN_ALREADY_SET');
    }

    const hash = await bcrypt.hash(pin, 10);
    await db.insert(settings).values({ key: PIN_KEY, value: hash });

    setAuthenticated(true);

    LoggingService.info('auth_pin_setup');
    return true;
  }

  static async login(pin: string): Promise<boolean> {
    const result = await db.select().from(settings).where(eq(settings.key, PIN_KEY)).limit(1);
    if (result.length === 0) {
      throw new Error('PIN_NOT_SET');
    }

    const isValid = await bcrypt.compare(pin, result[0].value);
    if (isValid) {
      setAuthenticated(true);
      LoggingService.info('auth_login_success');
      return true;
    }

    LoggingService.warn('auth_login_failed');
    return false;
  }

  static async changePin(oldPin: string, newPin: string): Promise<boolean> {
    const result = await db.select().from(settings).where(eq(settings.key, PIN_KEY)).limit(1);
    if (result.length === 0) {
      throw new Error('PIN_NOT_SET');
    }

    const isValid = await bcrypt.compare(oldPin, result[0].value);
    if (!isValid) {
      throw new Error('Old PIN is incorrect');
    }

    const newHash = await bcrypt.hash(newPin, 10);
    await db.update(settings).set({ value: newHash }).where(eq(settings.key, PIN_KEY));
    LoggingService.info('auth_pin_changed');
    return true;
  }
}
