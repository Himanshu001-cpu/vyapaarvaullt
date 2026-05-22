import { registerIpcHandler, authGuard } from './index';
import { TransactionService } from '../services/transaction.service';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionSchema,
  listTransactionSchema,
  searchTransactionSchema
} from '../validation/transaction.schema';

export function registerTransactionHandlers() {
  registerIpcHandler('transaction:create', createTransactionSchema, authGuard(async (payload) => {
    try {
      const result = await TransactionService.createTransaction(payload);
      return { success: true, data: result };
    } catch(e: any) {
      if (e.message === 'PARTY_NOT_FOUND') return { success: false, error: { code: 'PARTY_NOT_FOUND', message: 'Party not found' }};
      throw e;
    }
  }));

  registerIpcHandler('transaction:update', updateTransactionSchema, authGuard(async (payload) => {
    try {
      const success = await TransactionService.updateTransaction(payload);
      return { success: true, data: { success } };
    } catch(e: any) {
      if (e.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' }};
      throw e;
    }
  }));

  registerIpcHandler('transaction:delete', getTransactionSchema, authGuard(async (payload) => {
    try {
      const success = await TransactionService.deleteTransaction(payload.id);
      return { success: true, data: { success } };
    } catch(e: any) {
      if (e.message === 'NOT_FOUND') return { success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' }};
      if (e.message === 'ALREADY_DELETED') return { success: false, error: { code: 'ALREADY_DELETED', message: 'Transaction already deleted' }};
      throw e;
    }
  }));

  registerIpcHandler('transaction:list', listTransactionSchema, authGuard(async (payload) => {
    const data = await TransactionService.listTransactions(
        payload.partyId ?? undefined,
        payload.invoiceId ?? undefined,
        payload.type ?? undefined,
        payload.startDate ?? undefined,
        payload.endDate ?? undefined,
        payload.page,
        payload.pageSize
    );
    return { success: true, data };
  }));

  registerIpcHandler('transaction:search', searchTransactionSchema, authGuard(async (payload) => {
    const data = await TransactionService.searchTransactions(payload.query, payload.limit);
    return { success: true, data };
  }));
}
