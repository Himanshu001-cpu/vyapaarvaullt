CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`old_value` text,
	`new_value` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `import_export_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`operation_type` text NOT NULL,
	`file_name` text NOT NULL,
	`result` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`product_name_snapshot` text NOT NULL,
	`unit_snapshot` text NOT NULL,
	`quantity` real NOT NULL,
	`purchase_price_snapshot` real NOT NULL,
	`selling_price_snapshot` real NOT NULL,
	`total` real NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_number` text NOT NULL,
	`party_id` integer NOT NULL,
	`subtotal` real NOT NULL,
	`discount` real DEFAULT 0,
	`extra_charges` real DEFAULT 0,
	`total_amount` real NOT NULL,
	`amount_paid` real DEFAULT 0,
	`pending_amount` real DEFAULT 0,
	`status` text NOT NULL,
	`notes` text,
	`deleted_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_price_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`purchase_price` real NOT NULL,
	`selling_price` real NOT NULL,
	`effective_from` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`invoice_id` integer,
	`movement_type` text NOT NULL,
	`quantity_change` real NOT NULL,
	`note` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`party_id` integer NOT NULL,
	`invoice_id` integer,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`note` text,
	`deleted_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_action` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_created` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_import_export_created` ON `import_export_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_invoice_items_invoice` ON `invoice_items` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `idx_invoice_items_product` ON `invoice_items` (`product_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_number_unique` ON `invoices` (`invoice_number`);--> statement-breakpoint
CREATE INDEX `idx_invoice_number` ON `invoices` (`invoice_number`);--> statement-breakpoint
CREATE INDEX `idx_invoice_party` ON `invoices` (`party_id`);--> statement-breakpoint
CREATE INDEX `idx_invoice_status` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `idx_invoice_created` ON `invoices` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_invoice_deleted` ON `invoices` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_price_history_product` ON `product_price_history` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_price_history_date` ON `product_price_history` (`effective_from`);--> statement-breakpoint
CREATE INDEX `idx_stock_movements_product` ON `stock_movements` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_stock_movements_invoice` ON `stock_movements` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `idx_stock_movements_type` ON `stock_movements` (`movement_type`);--> statement-breakpoint
CREATE INDEX `idx_stock_movements_created` ON `stock_movements` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_transactions_party` ON `transactions` (`party_id`);--> statement-breakpoint
CREATE INDEX `idx_transactions_invoice` ON `transactions` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `idx_transactions_type` ON `transactions` (`type`);--> statement-breakpoint
CREATE INDEX `idx_transactions_created` ON `transactions` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_transactions_deleted` ON `transactions` (`deleted_at`);