CREATE TABLE `ai_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_projects_user_name_unique` ON `ai_projects` (`user_id`,`name`);--> statement-breakpoint
CREATE INDEX `ai_projects_user_updated_idx` ON `ai_projects` (`user_id`,`updated_at`);--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD `project_id` text REFERENCES ai_projects(id) ON DELETE SET NULL;--> statement-breakpoint
CREATE INDEX `ai_conversations_user_project_idx` ON `ai_conversations` (`user_id`,`project_id`,`updated_at`);