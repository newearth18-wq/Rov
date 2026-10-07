CREATE TABLE `class_team_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`arena` integer NOT NULL,
	`team` integer NOT NULL,
	`plan` text NOT NULL,
	`author` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_class_team_plan` ON `class_team_plans` (`class_id`,`arena`,`team`);