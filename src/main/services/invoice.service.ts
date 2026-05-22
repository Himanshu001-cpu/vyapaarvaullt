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
    if (payload.items.length === 0) throw new Error('VALIDATION_ERROR');

    let finalInvoiceId = 0;
    let finalInvoiceNumber = '';

    await db.transaction(async (tx) => {
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

      if (amountPaid > 0) {
         await TransactionRepository.create({
             party_id: payload.partyId,
             invoice_id: invoice.id,
             type: 'credit',
             amount: amountPaid,
             note: `Payment for Invoice ${invoiceNumber}`
         }, tx);
      }

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
        await InvoiceRepository.updateStatus(id, 'voided', tx);

        for (const item of items) {
           await ProductRepository.updateStock(item.product_id, item.quantity, tx);
           await StockMovementRepository.create({
              product_id: item.product_id,
              invoice_id: id,
              movement_type: 'undo',
              quantity_change: item.quantity,
              note: `Voided Invoice ${existing.invoice_number}`
           }, tx);
        }

        if (existing.amount_paid && existing.amount_paid > 0) {
           await TransactionRepository.create({
               party_id: existing.party_id,
               invoice_id: id,
               type: 'debit',
               amount: existing.amount_paid,
               note: `Reversal for Voided Invoice ${existing.invoice_number}`
           }, tx);
        }

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

  static async generatePdf(id: number): Promise<{ filePath: string }> {
    const { invoice, items, party } = await this.getInvoice(id);
    const html = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .total { font-weight: bold; text-align: right; margin-top: 20px; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="header">
             <div>
                <h2>INVOICE</h2>
                <p><strong>#${invoice.invoice_number}</strong></p>
                <p>Date: ${new Date(invoice.created_at).toLocaleDateString()}</p>
             </div>
             <div style="text-align: right;">
                <h3>Bill To:</h3>
                <p>${party?.name}</p>
                <p>${party?.phone || ''}</p>
             </div>
          </div>
          <table>
             <thead>
               <tr>
                 <th>Item</th>
                 <th>Qty</th>
                 <th>Price</th>
                 <th>Total</th>
               </tr>
             </thead>
             <tbody>
               ${items.map((item: any) => `
                 <tr>
                   <td>${item.product_name_snapshot}</td>
                   <td>${item.quantity} ${item.unit_snapshot}</td>
                   <td>₹${item.selling_price_snapshot}</td>
                   <td>₹${item.total}</td>
                 </tr>
               `).join('')}
             </tbody>
          </table>
          <div class="total">
             <p>Subtotal: ₹${invoice.subtotal}</p>
             <p>Discount: ₹${invoice.discount}</p>
             <p>Total: ₹${invoice.total_amount}</p>
          </div>
        </body>
      </html>
    `;

    return new Promise((resolve, reject) => {
      const { BrowserWindow } = require('electron');
      const { FileService } = require('./file.service');
      const { join } = require('path');
      const { writeFileSync } = require('fs');

      const win = new BrowserWindow({ show: false });
      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      win.webContents.on('did-finish-load', () => {
        win.webContents.printToPDF({}).then(data => {
          const exportsDir = FileService.getBasePath() + '/exports';
          const filePath = join(exportsDir, `Invoice-${invoice.invoice_number}.pdf`);
          writeFileSync(filePath, data);
          win.close();
          resolve({ filePath });
        }).catch(err => {
          win.close();
          reject(err);
        });
      });
    });
  }
}
