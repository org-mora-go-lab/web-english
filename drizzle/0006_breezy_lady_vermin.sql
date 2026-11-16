ALTER TABLE `ai_voice_sessions` ADD `renewable` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_voice_sessions` ADD `continuation_of` text;--> statement-breakpoint
CREATE UNIQUE INDEX `ai_voice_sessions_continuation_unique` ON `ai_voice_sessions` (`continuation_of`);