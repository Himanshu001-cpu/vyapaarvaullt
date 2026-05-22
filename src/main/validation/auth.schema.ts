import { z } from 'zod';

export const pinSchema = z.string().regex(/^\d{4,6}$/, 'PIN must be 4 to 6 digits');

export const setupPinSchema = z.object({
  pin: pinSchema,
});

export const loginSchema = z.object({
  pin: pinSchema,
});

export const changePinSchema = z.object({
  oldPin: pinSchema,
  newPin: pinSchema,
});
