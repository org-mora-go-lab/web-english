ALTER TABLE `ai_voice_sessions` ADD `observer_id` text;--> statement-breakpoint
ALTER TABLE `ai_voice_sessions` ADD `next_observer_id` text;--> statement-breakpoint
ALTER TABLE `ai_voice_sessions` ADD `next_observer_ready` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_voice_sessions` ADD `next_observer_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_voice_sessions` ADD `observer_state_json` text DEFAULT '' NOT NULL;