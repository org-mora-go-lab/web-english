CREATE TABLE `ai_voice_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`conversation_id` text NOT NULL,
	`call_id` text NOT NULL,
	`mode` text NOT NULL,
	`revision` integer NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_voice_sessions_user_expiry_idx` ON `ai_voice_sessions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `ai_voice_sessions_user_active_unique` ON `ai_voice_sessions` (`user_id`) WHERE status != 'ended';