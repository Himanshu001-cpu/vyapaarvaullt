import { registerIpcHandler, authGuard } from './index';
import { PartyService } from '../services/party.service';
import {
  createPartySchema,
  updatePartySchema,
  getPartySchema,
  searchPartySchema,
  listPartySchema
} from '../validation/party.schema';

export function registerPartyHandlers() {
  registerIpcHandler('party:create', createPartySchema, authGuard(async (payload) => {
    try {
      const result = await PartyService.createParty(payload);
      return { success: true, data: result };
    } catch (error: any) {
      if (error.message === 'DUPLICATE_PHONE') {
        return { success: false, error: { code: 'DUPLICATE_PHONE', message: 'Phone number already exists' } };
      }
      throw error;
    }
  }));

  registerIpcHandler('party:update', updatePartySchema, authGuard(async (payload) => {
    try {
      const success = await PartyService.updateParty(payload);
      return { success: true, data: { success } };
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
         return { success: false, error: { code: 'NOT_FOUND', message: 'Party not found' } };
      }
      if (error.message === 'DUPLICATE_PHONE') {
        return { success: false, error: { code: 'DUPLICATE_PHONE', message: 'Phone number already exists' } };
      }
      throw error;
    }
  }));

  registerIpcHandler('party:delete', getPartySchema, authGuard(async (payload) => {
    try {
      const success = await PartyService.deleteParty(payload.id);
      return { success: true, data: { success } };
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Party not found' } };
      if (error.message === 'ALREADY_DELETED') return { success: false, error: { code: 'ALREADY_DELETED', message: 'Party already deleted' } };
      throw error;
    }
  }));

  registerIpcHandler('party:restore', getPartySchema, authGuard(async (payload) => {
    try {
      const success = await PartyService.restoreParty(payload.id);
      return { success: true, data: { success } };
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Party not found' } };
      if (error.message === 'NOT_DELETED') return { success: false, error: { code: 'NOT_DELETED', message: 'Party is not deleted' } };
      throw error;
    }
  }));

  registerIpcHandler('party:get', getPartySchema, authGuard(async (payload) => {
    try {
      const data = await PartyService.getPartyWithBalance(payload.id);
      return { success: true, data };
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Party not found' } };
      throw error;
    }
  }));

  registerIpcHandler('party:search', searchPartySchema, authGuard(async (payload) => {
    const data = await PartyService.searchParties(payload.query, payload.type, payload.limit);
    return { success: true, data };
  }));

  registerIpcHandler('party:list', listPartySchema, authGuard(async (payload) => {
    const data = await PartyService.listParties(payload.type, payload.includeDeleted, payload.page, payload.pageSize);
    return { success: true, data };
  }));
}
