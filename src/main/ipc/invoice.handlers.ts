import { registerIpcHandler, authGuard } from './index';
import { InvoiceService, CreateInvoicePayload } from '../services/invoice.service';
import {
  createInvoiceSchema,
  voidInvoiceSchema,
  getInvoiceSchema,
  listInvoiceSchema,
  searchInvoiceSchema,
  generatePdfSchema
} from '../validation/invoice.schema';

export function registerInvoiceHandlers() {
  registerIpcHandler('invoice:create', createInvoiceSchema, authGuard(async (payload) => {
    try {
      const servicePayload: CreateInvoicePayload = {
         partyId: payload.partyId,
         items: payload.items,
         discount: payload.discount ?? undefined,
         extraCharges: payload.extraCharges ?? undefined,
         amountPaid: payload.amountPaid ?? undefined,
         notes: payload.notes ?? undefined
      };
      const result = await InvoiceService.createInvoice(servicePayload);
      return { success: true, data: result };
    } catch(e: any) {
      if (e.message === 'PARTY_NOT_FOUND') return { success: false, error: { code: 'PARTY_NOT_FOUND', message: 'Party not found' }};
      if (e.message.startsWith('PRODUCT_NOT_FOUND')) return { success: false, error: { code: 'PRODUCT_NOT_FOUND', message: e.message }};
      if (e.message.startsWith('INSUFFICIENT_STOCK')) return { success: false, error: { code: 'INSUFFICIENT_STOCK', message: e.message }};
      if (e.message === 'VALIDATION_ERROR') return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid items data' }};
      throw e;
    }
  }));

  registerIpcHandler('invoice:void', voidInvoiceSchema, authGuard(async (payload) => {
    try {
      const success = await InvoiceService.voidInvoice(payload.id, payload.reason ?? undefined);
      return { success: true, data: { success } };
    } catch(e: any) {
      if (e.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' }};
      if (e.message === 'ALREADY_VOIDED') return { success: false, error: { code: 'ALREADY_VOIDED', message: 'Invoice already voided' }};
      throw e;
    }
  }));

  registerIpcHandler('invoice:get', getInvoiceSchema, authGuard(async (payload) => {
    try {
      const data = await InvoiceService.getInvoice(payload.id);
      return { success: true, data };
    } catch(e: any) {
      if (e.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' }};
      throw e;
    }
  }));

  registerIpcHandler('invoice:list', listInvoiceSchema, authGuard(async (payload) => {
    const data = await InvoiceService.listInvoices(
        payload.partyId ?? undefined,
        payload.status ?? undefined,
        payload.startDate ?? undefined,
        payload.endDate ?? undefined,
        payload.page,
        payload.pageSize
    );
    return { success: true, data };
  }));

  registerIpcHandler('invoice:search', searchInvoiceSchema, authGuard(async (payload) => {
    const data = await InvoiceService.searchInvoices(payload.query, payload.limit);
    return { success: true, data };
  }));

  registerIpcHandler('invoice:generatePdf', generatePdfSchema, authGuard(async (payload) => {
    try {
      const data = await InvoiceService.generatePdf(payload.id);
      return { success: true, data };
    } catch(e: any) {
      if (e.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' }};
      throw e;
    }
  }));
}
