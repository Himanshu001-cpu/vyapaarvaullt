import { PartyRepository, PartyCreateData, PartyUpdateData } from '../repositories/party.repository';
import { AuditService } from './audit.service';
import { LoggingService } from './logging.service';

export class PartyService {
  static async createParty(data: PartyCreateData) {
    if (data.phone) {
      const existing = await PartyRepository.getByPhone(data.phone);
      if (existing) {
        throw new Error('DUPLICATE_PHONE');
      }
    }

    const result = await PartyRepository.create(data);

    await AuditService.logAction('create', 'party', result.id, null, data);
    LoggingService.info('party_created', { id: result.id, type: data.type });

    return result;
  }

  static async updateParty(data: PartyUpdateData) {
    const existing = await PartyRepository.getById(data.id);
    if (!existing) {
      throw new Error('NOT_FOUND');
    }

    if (data.phone && data.phone !== existing.phone) {
      const phoneDuplicate = await PartyRepository.getByPhone(data.phone);
      if (phoneDuplicate) {
        throw new Error('DUPLICATE_PHONE');
      }
    }

    await PartyRepository.update(data);

    await AuditService.logAction('update', 'party', data.id, existing, data);
    LoggingService.info('party_updated', { id: data.id });

    return true;
  }

  static async deleteParty(id: number) {
    const existing = await PartyRepository.getById(id);
    if (!existing) {
      throw new Error('NOT_FOUND');
    }
    if (existing.deleted_at) {
      throw new Error('ALREADY_DELETED');
    }

    // Soft delete
    await PartyRepository.softDelete(id);

    await AuditService.logAction('delete', 'party', id, existing, null);
    LoggingService.info('party_deleted', { id });

    return true;
  }

  static async restoreParty(id: number) {
    const existing = await PartyRepository.getById(id);
    if (!existing) {
      throw new Error('NOT_FOUND');
    }
    if (!existing.deleted_at) {
      throw new Error('NOT_DELETED');
    }

    await PartyRepository.restore(id);

    await AuditService.logAction('restore', 'party', id, existing, null);
    LoggingService.info('party_restored', { id });

    return true;
  }

  static async getPartyWithBalance(id: number) {
    const party = await PartyRepository.getById(id);
    if (!party) {
      throw new Error('NOT_FOUND');
    }

    const { credits, debits, pending } = await PartyRepository.getBalance(id);

    let balance = 0;
    if (party.type === 'customer' || party.type === 'both') {
      // PRD: Customer balance = SUM(credit) - SUM(debit) - SUM(pending)
      // Actually standard accounting: Balance = Invoices Pending - Payments(Credits).
      // The PRD mentions SUM(credits) - SUM(debits) - pending. We will use PRD's literal formula but it's weird.
      // Wait, PRD says: "Customer balance tracking: SUM(credits) - SUM(debits)" in UI component matrix.
      // Let's use: credits - debits - pending for Customer.
      balance = credits - debits - pending;
    } else if (party.type === 'supplier') {
      // PRD: Supplier balance = SUM(debits) - SUM(credits)
      balance = debits - credits + pending; // Pending is what we owe them for purchase invoices
    }

    return {
      ...party,
      balance
    };
  }

  static async searchParties(query: string, type?: 'customer' | 'supplier' | 'both', limit?: number) {
    return PartyRepository.searchFTS(query, type, limit);
  }

  static async listParties(type?: 'customer' | 'supplier' | 'both', includeDeleted?: boolean, page?: number, pageSize?: number) {
    return PartyRepository.list(type, includeDeleted, page, pageSize);
  }
}
