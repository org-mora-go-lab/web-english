ALTER TABLE `users` ADD `kakao_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `profile_image_url` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_kakao_id_unique` ON `users` (`kakao_id`);