import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const parties = sqliteTable('parties', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  notes: text('notes'),
  type: text('type').notNull(),
  deleted_at: text('deleted_at'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP'),
}, (table) => {
  return {
    nameIdx: index('idx_parties_name').on(table.name),
    phoneIdx: index('idx_parties_phone').on(table.phone),
    typeIdx: index('idx_parties_type').on(table.type),
    deletedIdx: index('idx_parties_deleted').on(table.deleted_at),
  };
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const units = sqliteTable('units', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  short_name: text('short_name').notNull().unique(),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category_id: integer('category_id').references(() => categories.id),
  name: text('name').notNull(),
  sku: text('sku').unique(),
  base_unit_id: integer('base_unit_id').notNull().references(() => units.id),
  purchase_price: real('purchase_price').notNull().default(0),
  selling_price: real('selling_price').notNull().default(0),
  current_quantity: real('current_quantity').notNull().default(0),
  low_stock_threshold: real('low_stock_threshold').default(0),
  deleted_at: text('deleted_at'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP'),
}, (table) => {
  return {
    nameIdx: index('idx_products_name').on(table.name),
    skuIdx: index('idx_products_sku').on(table.sku),
    categoryIdx: index('idx_products_category').on(table.category_id),
    deletedIdx: index('idx_products_deleted').on(table.deleted_at),
  };
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
}, (table) => {
  return {
    keyIdx: index('idx_settings_key').on(table.key),
  };
});

export const backup_history = sqliteTable('backup_history', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    action_type: text('action_type').notNull(),
    file_path: text('file_path').notNull(),
    created_at: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const unit_conversions = sqliteTable('unit_conversions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    product_id: integer('product_id').notNull().references(() => products.id),
    from_unit_id: integer('from_unit_id').notNull().references(() => units.id),
    to_unit_id: integer('to_unit_id').notNull().references(() => units.id),
    multiplier: real('multiplier').notNull(),
    created_at: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const product_price_history = sqliteTable('product_price_history', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    product_id: integer('product_id').notNull().references(() => products.id),
    purchase_price: real('purchase_price').notNull(),
    selling_price: real('selling_price').notNull(),
    effective_from: text('effective_from').default('CURRENT_TIMESTAMP'),
}, (table) => {
  return {
    productIdx: index('idx_price_history_product').on(table.product_id),
    dateIdx: index('idx_price_history_date').on(table.effective_from),
  };
});

export const invoices = sqliteTable('invoices', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    invoice_number: text('invoice_number').notNull().unique(),
    party_id: integer('party_id').notNull().references(() => parties.id),
    subtotal: real('subtotal').notNull(),
    discount: real('discount').default(0),
    extra_charges: real('extra_charges').default(0),
    total_amount: real('total_amount').notNull(),
    amount_paid: real('amount_paid').default(0),
    pending_amount: real('pending_amount').default(0),
    status: text('status').notNull(),
    notes: text('notes'),
    deleted_at: text('deleted_at'),
    created_at: text('created_at').default('CURRENT_TIMESTAMP'),
}, (table) => {
  return {
    numberIdx: index('idx_invoice_number').on(table.invoice_number),
    partyIdx: index('idx_invoice_party').on(table.party_id),
    statusIdx: index('idx_invoice_status').on(table.status),
    createdIdx: index('idx_invoice_created').on(table.created_at),
    deletedIdx: index('idx_invoice_deleted').on(table.deleted_at),
  };
});

export const invoice_items = sqliteTable('invoice_items', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    invoice_id: integer('invoice_id').notNull().references(() => invoices.id),
    product_id: integer('product_id').notNull().references(() => products.id),
    product_name_snapshot: text('product_name_snapshot').notNull(),
    unit_snapshot: text('unit_snapshot').notNull(),
    quantity: real('quantity').notNull(),
    purchase_price_snapshot: real('purchase_price_snapshot').notNull(),
    selling_price_snapshot: real('selling_price_snapshot').notNull(),
    total: real('total').notNull(),
    created_at: text('created_at').default('CURRENT_TIMESTAMP'),
}, (table) => {
  return {
    invoiceIdx: index('idx_invoice_items_invoice').on(table.invoice_id),
    productIdx: index('idx_invoice_items_product').on(table.product_id),
  };
});

export const transactions = sqliteTable('transactions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    party_id: integer('party_id').notNull().references(() => parties.id),
    invoice_id: integer('invoice_id').references(() => invoices.id),
    type: text('type').notNull(),
    amount: real('amount').notNull(),
    note: text('note'),
    deleted_at: text('deleted_at'),
    created_at: text('created_at').default('CURRENT_TIMESTAMP'),
}, (table) => {
  return {
    partyIdx: index('idx_transactions_party').on(table.party_id),
    invoiceIdx: index('idx_transactions_invoice').on(table.invoice_id),
    typeIdx: index('idx_transactions_type').on(table.type),
    createdIdx: index('idx_transactions_created').on(table.created_at),
    deletedIdx: index('idx_transactions_deleted').on(table.deleted_at),
  };
});

export const stock_movements = sqliteTable('stock_movements', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    product_id: integer('product_id').notNull().references(() => products.id),
    invoice_id: integer('invoice_id').references(() => invoices.id),
    movement_type: text('movement_type').notNull(),
    quantity_change: real('quantity_change').notNull(),
    note: text('note'),
    created_at: text('created_at').default('CURRENT_TIMESTAMP'),
}, (table) => {
  return {
    productIdx: index('idx_stock_movements_product').on(table.product_id),
    invoiceIdx: index('idx_stock_movements_invoice').on(table.invoice_id),
    typeIdx: index('idx_stock_movements_type').on(table.movement_type),
    createdIdx: index('idx_stock_movements_created').on(table.created_at),
  };
});

export const audit_logs = sqliteTable('audit_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    action: text('action').notNull(),
    entity_type: text('entity_type').notNull(),
    entity_id: integer('entity_id').notNull(),
    old_value: text('old_value'),
    new_value: text('new_value'),
    created_at: text('created_at').default('CURRENT_TIMESTAMP'),
}, (table) => {
  return {
    actionIdx: index('idx_audit_logs_action').on(table.action),
    createdIdx: index('idx_audit_logs_created').on(table.created_at),
  };
});

export const import_export_logs = sqliteTable('import_export_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    operation_type: text('operation_type').notNull(),
    file_name: text('file_name').notNull(),
    result: text('result').notNull(),
    created_at: text('created_at').default('CURRENT_TIMESTAMP'),
}, (table) => {
  return {
    createdIdx: index('idx_import_export_created').on(table.created_at),
  };
});
