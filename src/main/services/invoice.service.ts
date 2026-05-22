import { db } from '../database';
import { InvoiceRepository, InvoiceCreateData } from '../repositories/invoice.repository';
import { InvoiceItemRepository, InvoiceItemCreateData } from '../repositories/invoice-item.repository';
import { ProductRepository } from '../repositories/product.repository';
import { PartyRepository } from '../repositories/party.repository';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { UnitRepository } from '../repositories/unit.repository';
import { AuditService } from './audit.service';
import { LoggingService } from './logging.service';

export interface InvoiceItemPayload {
  productId: number;
  quantity: number;
  sellingPrice: number;
}

export interface CreateInvoicePayload {
  partyId: number;
  items: InvoiceItemPayload[];
  discount?: number;
  extraCharges?: number;
  amountPaid?: number;
  notes?: string;
}

export class InvoiceService {
  static async createInvoice(payload: CreateInvoicePayload) {
    const party = await PartyRepository.getById(payload.partyId);
    if (!party) throw new Error('PARTY_NOT_FOUND');
    if (payload.items.length === 0) throw new Error('VALIDATION_ERROR'); // Need at least one item

    let finalInvoiceId = 0;
    let finalInvoiceNumber = '';

    // Atomic 6-step transaction
    await db.transaction(async (tx) => {
      // 1. Validate Stock & Gather Product Data
      let subtotal = 0;
      const productsData: any[] = [];

      for (const item of payload.items) {
        if (item.quantity <= 0) throw new Error('VALIDATION_ERROR');
        if (item.sellingPrice < 0) throw new Error('VALIDATION_ERROR');

        const product = await ProductRepository.getById(item.productId);
        if (!product) throw new Error(`PRODUCT_NOT_FOUND: ${item.productId}`);

        if (product.current_quantity < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK: ${product.name}`);
        }

        const unit = await UnitRepository.getById(product.base_unit_id);
        const unitName = unit ? unit.short_name : 'unit';

        const lineTotal = item.quantity * item.sellingPrice;
        subtotal += lineTotal;

        productsData.push({
           product,
           unitName,
           quantity: item.quantity,
           sellingPrice: item.sellingPrice,
           lineTotal
        });
      }

      const discount = payload.discount || 0;
      const extraCharges = payload.extraCharges || 0;
      const totalAmount = subtotal - discount + extraCharges;
      const amountPaid = payload.amountPaid || 0;
      const pendingAmount = totalAmount - amountPaid;

      // 2. Create Invoice
      const invoiceNumber = await InvoiceRepository.getNextInvoiceNumber(tx);
      const invoiceData: InvoiceCreateData = {
         invoice_number: invoiceNumber,
         party_id: payload.partyId,
         subtotal,
         discount,
         extra_charges: extraCharges,
         total_amount: totalAmount,
         amount_paid: amountPaid,
         pending_amount: pendingAmount,
         status: 'completed',
         notes: payload.notes
      };

      const invoice = await InvoiceRepository.create(invoiceData, tx);
      finalInvoiceId = invoice.id;
      finalInvoiceNumber = invoiceNumber;

      // 3. Create Invoice Items
      const invoiceItems: InvoiceItemCreateData[] = productsData.map(p => ({
         invoice_id: invoice.id,
         product_id: p.product.id,
         product_name_snapshot: p.product.name,
         unit_snapshot: p.unitName,
         quantity: p.quantity,
         purchase_price_snapshot: p.product.purchase_price,
         selling_price_snapshot: p.sellingPrice,
         total: p.lineTotal
      }));
      await InvoiceItemRepository.bulkCreate(invoiceItems, tx);

      // 4. Deduct Stock & Create Stock Movements
      for (const p of productsData) {
         await ProductRepository.updateStock(p.product.id, -p.quantity, tx);
         await StockMovementRepository.create({
            product_id: p.product.id,
            invoice_id: invoice.id,
            movement_type: 'invoice',
            quantity_change: -p.quantity,
            note: `Invoice ${invoiceNumber}`
         }, tx);
      }

      // 5. Create Transaction (if payment made)
      if (amountPaid > 0) {
         await TransactionRepository.create({
             party_id: payload.partyId,
             invoice_id: invoice.id,
             type: 'credit', // Money in from customer (assuming sales invoice for MVP)
             amount: amountPaid,
             note: `Payment for Invoice ${invoiceNumber}`
         }, tx);
      }

      // 6. Audit Log
      await AuditService.logAction('create', 'invoice', invoice.id, null, invoiceData, tx);
    });

    LoggingService.info('invoice_created', { invoiceId: finalInvoiceId, invoiceNumber: finalInvoiceNumber });
    return { invoiceId: finalInvoiceId, invoiceNumber: finalInvoiceNumber };
  }

  static async voidInvoice(id: number, reason?: string) {
    const existing = await InvoiceRepository.getById(id);
    if (!existing) throw new Error('NOT_FOUND');
    if (existing.status === 'voided') throw new Error('ALREADY_VOIDED');

    const items = await InvoiceItemRepository.getByInvoiceId(id);

    await db.transaction(async (tx) => {
        // 1. Update status
        await InvoiceRepository.updateStatus(id, 'voided', tx);

        // 2. Restore Stock
        for (const item of items) {
           await ProductRepository.updateStock(item.product_id, item.quantity, tx);
           await StockMovementRepository.create({
              product_id: item.product_id,
              invoice_id: id,
              movement_type: 'undo', // Undoing the invoice
              quantity_change: item.quantity,
              note: `Voided Invoice ${existing.invoice_number}`
           }, tx);
        }

        // 3. Reversal Transaction (if amount was paid)
        if (existing.amount_paid && existing.amount_paid > 0) {
           await TransactionRepository.create({
               party_id: existing.party_id,
               invoice_id: id,
               type: 'debit', // Money returned/credited back to customer
               amount: existing.amount_paid,
               note: `Reversal for Voided Invoice ${existing.invoice_number}`
           }, tx);
        }

        // 4. Audit Log
        await AuditService.logAction('void', 'invoice', id, { status: 'completed' }, { status: 'voided', reason }, tx);
    });

    LoggingService.info('invoice_voided', { id, invoiceNumber: existing.invoice_number });
    return true;
  }

  static async getInvoice(id: number) {
    const invoice = await InvoiceRepository.getById(id);
    if (!invoice) throw new Error('NOT_FOUND');

    const items = await InvoiceItemRepository.getByInvoiceId(id);
    const party = await PartyRepository.getById(invoice.party_id);

    return { invoice, items, party };
  }

  static async listInvoices(partyId?: number, status?: 'completed' | 'voided', startDate?: string, endDate?: string, page?: number, pageSize?: number) {
    return InvoiceRepository.list(partyId, status, startDate, endDate, page, pageSize);
  }

  static async searchInvoices(query: string, limit?: number) {
    return InvoiceRepository.search(query, limit);
  }
}
