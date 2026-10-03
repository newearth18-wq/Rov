import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(), hostToken: text('host_token').notNull(), status: text('status').notNull().default('waiting'),
  state: text('state'), revision: integer('revision').notNull().default(0), updatedAt: integer('updated_at').notNull(),
}, table => [index('idx_rooms_updated').on(table.updatedAt)]);
export const players = sqliteTable('players', {
  id: text('id').primaryKey(), roomId: text('room_id').notNull().references(()=>rooms.id,{onDelete:'cascade'}),
  token: text('token').notNull(), name: text('name').notNull(), team: integer('team').notNull(), position: text('position').notNull(),
  hero: text('hero').notNull(), rune: text('rune').notNull(), enchant: text('enchant').notNull(),
  input: text('input').notNull().default('{}'), seq: integer('seq').notNull().default(-1), seenAt: integer('seen_at').notNull(),
}, table => [uniqueIndex('idx_players_room_slot').on(table.roomId,table.team,table.position)]);
