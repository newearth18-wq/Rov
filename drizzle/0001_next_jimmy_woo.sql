CREATE TABLE `class_matches` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`arena` integer NOT NULL,
	`host_id` text,
	`state` text,
	`status` text DEFAULT 'waiting' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_class_match_arena` ON `class_matches` (`class_id`,`arena`);--> statement-breakpoint
CREATE TABLE `class_students` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`token` text NOT NULL,
	`name` text NOT NULL,
	`hero` text NOT NULL,
	`slot` integer NOT NULL,
	`input` text DEFAULT '{}' NOT NULL,
	`seq` integer DEFAULT -1 NOT NULL,
	`reflection` text,
	`seen_at` integer NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_class_student_slot` ON `class_students` (`class_id`,`slot`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_class_student_token` ON `class_students` (`class_id`,`token`);--> statement-breakpoint
CREATE TABLE `classrooms` (
	`id` text PRIMARY KEY NOT NULL,
	`teacher_id` text NOT NULL,
	`title` text NOT NULL,
	`mode` text NOT NULL,
	`lesson` text NOT NULL,
	`mission` text NOT NULL,
	`phase` text DEFAULT 'waiting' NOT NULL,
	`paused` integer DEFAULT 0 NOT NULL,
	`round` integer DEFAULT 0 NOT NULL,
	`focus` text,
	`minutes` integer DEFAULT 8 NOT NULL,
	`deadline` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_classrooms_teacher` ON `classrooms` (`teacher_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `lesson_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`stage` text NOT NULL,
	`round` integer NOT NULL,
	`question_id` text NOT NULL,
	`answer` integer NOT NULL,
	`correct` integer NOT NULL,
	`answered_at` integer NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `class_students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lesson_answer_once` ON `lesson_answers` (`student_id`,`stage`,`round`,`question_id`);--> statement-breakpoint
CREATE INDEX `idx_answers_class` ON `lesson_answers` (`class_id`,`stage`);--> statement-breakpoint
CREATE TABLE `lesson_banks` (
	`id` text PRIMARY KEY NOT NULL,
	`teacher_id` text NOT NULL,
	`title` text NOT NULL,
	`subject` text NOT NULL,
	`level` text NOT NULL,
	`questions` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_banks_teacher` ON `lesson_banks` (`teacher_id`);--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_teachers_token` ON `teachers` (`token`);