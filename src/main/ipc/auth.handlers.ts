import { registerIpcHandler, authGuard } from './index';
import { AuthService } from '../services/auth.service';
import { loginSchema, setupPinSchema, changePinSchema } from '../validation/auth.schema';
import { getAuthenticated } from './state';

export function registerAuthHandlers() {
  registerIpcHandler('auth:checkPinSet', null, async () => {
    const isPinSet = await AuthService.checkPinSet();
    return { success: true, data: { isPinSet } };
  });

  registerIpcHandler('auth:setupPin', setupPinSchema, async (payload) => {
    const success = await AuthService.setupPin(payload.pin);
    return { success: true, data: { success } };
  });

  registerIpcHandler('auth:login', loginSchema, async (payload) => {
    const authenticated = await AuthService.login(payload.pin);
    if (!authenticated) {
      return { success: false, error: { code: 'INVALID_PIN', message: 'Wrong PIN entered' } };
    }
    return { success: true, data: { authenticated } };
  });

  registerIpcHandler('auth:changePin', changePinSchema, authGuard(async (payload) => {
    try {
      const success = await AuthService.changePin(payload.oldPin, payload.newPin);
      return { success: true, data: { success } };
    } catch (e) {
      return { success: false, error: { code: 'INVALID_OLD_PIN', message: (e as Error).message } };
    }
  }));

  registerIpcHandler('auth:validateSession', null, async () => {
    return { success: true, data: { isValid: getAuthenticated() } };
  });
}
