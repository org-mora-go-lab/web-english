CREATE TABLE `child_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`age_months` integer DEFAULT 16 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `child_profiles_user_unique` ON `child_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `play_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`age_months` integer NOT NULL,
	`activity_id` text NOT NULL,
	`reaction` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`played_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `play_records_user_date_idx` ON `play_records` (`user_id`,`played_at`);