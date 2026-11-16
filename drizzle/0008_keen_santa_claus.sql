DROP INDEX `ai_voice_sessions_user_active_unique`;--> statement-breakpoint
ALTER TABLE `ai_voice_sessions` ADD `warm_pending` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_voice_sessions` ADD `warm_request_id` text;--> statement-breakpoint
ALTER TABLE `ai_voice_sessions` ADD `warm_ready` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `ai_voice_sessions_user_active_unique` ON `ai_voice_sessions` (`user_id`) WHERE status in ('created', 'active');