CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `parties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`address` text,
	`notes` text,
	`type` text NOT NULL,
	`deleted_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer,
	`name` text NOT NULL,
	`sku` text,
	`base_unit_id` integer NOT NULL,
	`purchase_price` real DEFAULT 0 NOT NULL,
	`selling_price` real DEFAULT 0 NOT NULL,
	`current_quantity` real DEFAULT 0 NOT NULL,
	`low_stock_threshold` real DEFAULT 0,
	`deleted_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`base_unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`short_name` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE INDEX `idx_parties_name` ON `parties` (`name`);--> statement-breakpoint
CREATE INDEX `idx_parties_phone` ON `parties` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_parties_type` ON `parties` (`type`);--> statement-breakpoint
CREATE INDEX `idx_parties_deleted` ON `parties` (`deleted_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE INDEX `idx_products_name` ON `products` (`name`);--> statement-breakpoint
CREATE INDEX `idx_products_sku` ON `products` (`sku`);--> statement-breakpoint
CREATE INDEX `idx_products_category` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_products_deleted` ON `products` (`deleted_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE INDEX `idx_settings_key` ON `settings` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `units_name_unique` ON `units` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `units_short_name_unique` ON `units` (`short_name`);