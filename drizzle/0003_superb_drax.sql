CREATE TABLE `class_play_progress` (
	`student_id` text PRIMARY KEY NOT NULL,
	`credits` integer DEFAULT 1000 NOT NULL,
	`spent` integer DEFAULT 0 NOT NULL,
	`ammo` integer DEFAULT 3 NOT NULL,
	`shots` integer DEFAULT 0 NOT NULL,
	`cursor` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`answered_at` integer DEFAULT 0 NOT NULL,
	`moved_at` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `class_students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `class_snow_states` (
	`class_id` text NOT NULL,
	`arena` integer NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_class_snow_arena` ON `class_snow_states` (`class_id`,`arena`);--> statement-breakpoint
ALTER TABLE `classrooms` ADD `activity` text DEFAULT 'moba' NOT NULL;--> statement-breakpoint
ALTER TABLE `classrooms` ADD `energy_questions` integer DEFAULT 0 NOT NULL;