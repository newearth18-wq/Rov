CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`token` text NOT NULL,
	`name` text NOT NULL,
	`team` integer NOT NULL,
	`position` text NOT NULL,
	`hero` text NOT NULL,
	`rune` text NOT NULL,
	`enchant` text NOT NULL,
	`input` text DEFAULT '{}' NOT NULL,
	`seq` integer DEFAULT -1 NOT NULL,
	`seen_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_players_room_slot` ON `players` (`room_id`,`team`,`position`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`host_token` text NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`state` text,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_rooms_updated` ON `rooms` (`updated_at`);