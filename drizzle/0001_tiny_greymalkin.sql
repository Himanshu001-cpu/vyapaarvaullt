CREATE TABLE `backup_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action_type` text NOT NULL,
	`file_path` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `unit_conversions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`from_unit_id` integer NOT NULL,
	`to_unit_id` integer NOT NULL,
	`multiplier` real NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
