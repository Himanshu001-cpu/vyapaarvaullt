import { db } from '../database';
import { TransactionRepository, TransactionCreateData, TransactionUpdateData } from '../repositories/transaction.repository';
import { PartyRepository } from '../repositories/party.repository';
import { AuditService } from './audit.service';
import { LoggingService } from './logging.service';

export class TransactionService {
  static async createTransaction(data: TransactionCreateData) {
    const party = await PartyRepository.getById(data.party_id);
    if (!party) throw new Error('PARTY_NOT_FOUND');

    let resultId: number = 0;

    await db.transaction(async (tx) => {
       const transaction = await TransactionRepository.create(data, tx);
       resultId = transaction.id;
       await AuditService.logAction('create', 'transaction', resultId, null, data, tx);
    });

    LoggingService.info('transaction_created', { id: resultId, type: data.type, amount: data.amount });
    return { id: resultId };
  }

  static async updateTransaction(data: TransactionUpdateData) {
    const existing = await TransactionRepository.getById(data.id);
    if (!existing) throw new Error('NOT_FOUND');

    await db.transaction(async (tx) => {
       await TransactionRepository.update(data, tx);
       await AuditService.logAction('update', 'transaction', data.id, existing, data, tx);
    });

    LoggingService.info('transaction_updated', { id: data.id });
    return true;
  }

  static async deleteTransaction(id: number) {
    const existing = await TransactionRepository.getById(id);
    if (!existing) throw new Error('NOT_FOUND');
    if (existing.deleted_at) throw new Error('ALREADY_DELETED');

    await db.transaction(async (tx) => {
       await TransactionRepository.softDelete(id);
       await AuditService.logAction('delete', 'transaction', id, existing, null, tx);
    });

    LoggingService.info('transaction_deleted', { id });
    return true;
  }

  static async listTransactions(partyId?: number, invoiceId?: number, type?: 'credit' | 'debit', startDate?: string, endDate?: string, page?: number, pageSize?: number) {
    return TransactionRepository.list(partyId, invoiceId, type, startDate, endDate, page, pageSize);
  }

  static async searchTransactions(query: string, limit?: number) {
    return TransactionRepository.searchFTS(query, limit);
  }
}
