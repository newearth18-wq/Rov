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

export const teachers = sqliteTable('teachers', {
  id: text('id').primaryKey(), token: text('token').notNull(), createdAt: integer('created_at').notNull(),
}, t=>[uniqueIndex('idx_teachers_token').on(t.token)]);
export const lessonBanks = sqliteTable('lesson_banks', {
  id: text('id').primaryKey(), teacherId: text('teacher_id').notNull().references(()=>teachers.id),
  title: text('title').notNull(), subject: text('subject').notNull(), level: text('level').notNull(),
  questions: text('questions').notNull(), updatedAt: integer('updated_at').notNull(),
}, t=>[index('idx_banks_teacher').on(t.teacherId)]);
export const classrooms = sqliteTable('classrooms', {
  id: text('id').primaryKey(), teacherId: text('teacher_id').notNull().references(()=>teachers.id),
  title: text('title').notNull(), mode: text('mode').notNull(), lesson: text('lesson').notNull(),
  activity: text('activity').notNull().default('moba'), energyQuestions: integer('energy_questions').notNull().default(0),
  mission: text('mission').notNull(), phase: text('phase').notNull().default('waiting'),
  paused: integer('paused').notNull().default(0), round: integer('round').notNull().default(0), focus: text('focus'),
  minutes: integer('minutes').notNull().default(8), deadline: integer('deadline'), updatedAt: integer('updated_at').notNull(),
}, t=>[index('idx_classrooms_teacher').on(t.teacherId,t.updatedAt)]);
export const classStudents = sqliteTable('class_students', {
  id: text('id').primaryKey(), classId: text('class_id').notNull().references(()=>classrooms.id),
  token: text('token').notNull(), name: text('name').notNull(), hero: text('hero').notNull(),
  slot: integer('slot').notNull(), input: text('input').notNull().default('{}'),
  seq: integer('seq').notNull().default(-1), reflection: text('reflection'), seenAt: integer('seen_at').notNull(),
}, t=>[uniqueIndex('idx_class_student_slot').on(t.classId,t.slot),uniqueIndex('idx_class_student_token').on(t.classId,t.token)]);
export const classMatches = sqliteTable('class_matches', {
  id: text('id').primaryKey(), classId: text('class_id').notNull().references(()=>classrooms.id),
  arena: integer('arena').notNull(), hostId: text('host_id'), state: text('state'),
  status: text('status').notNull().default('waiting'), revision: integer('revision').notNull().default(0),
  updatedAt: integer('updated_at').notNull(),
}, t=>[uniqueIndex('idx_class_match_arena').on(t.classId,t.arena)]);
export const lessonAnswers = sqliteTable('lesson_answers', {
  id: text('id').primaryKey(), classId: text('class_id').notNull().references(()=>classrooms.id),
  studentId: text('student_id').notNull().references(()=>classStudents.id), stage: text('stage').notNull(),
  round: integer('round').notNull(), questionId: text('question_id').notNull(), answer: integer('answer').notNull(),
  correct: integer('correct').notNull(), answeredAt: integer('answered_at').notNull(),
}, t=>[uniqueIndex('idx_lesson_answer_once').on(t.studentId,t.stage,t.round,t.questionId),index('idx_answers_class').on(t.classId,t.stage)]);
export const classTeamPlans = sqliteTable('class_team_plans', {
  id: text('id').primaryKey(), classId: text('class_id').notNull().references(()=>classrooms.id),
  arena: integer('arena').notNull(), team: integer('team').notNull(), plan: text('plan').notNull(),
  author: text('author').notNull(), revision: integer('revision').notNull().default(1), updatedAt: integer('updated_at').notNull(),
}, t=>[uniqueIndex('idx_class_team_plan').on(t.classId,t.arena,t.team)]);

export const classPlayProgress = sqliteTable('class_play_progress', {
  studentId: text('student_id').primaryKey().references(()=>classStudents.id),
  credits: integer('credits').notNull().default(1000), spent: integer('spent').notNull().default(0),
  ammo: integer('ammo').notNull().default(3), shots: integer('shots').notNull().default(0),
  cursor: integer('cursor').notNull().default(0), correct: integer('correct').notNull().default(0),
  answeredAt: integer('answered_at').notNull().default(0), movedAt: integer('moved_at').notNull().default(0),
});
export const classSnowStates = sqliteTable('class_snow_states', {
  classId: text('class_id').notNull().references(()=>classrooms.id), arena: integer('arena').notNull(),
  state: text('state').notNull(), revision: integer('revision').notNull().default(0), updatedAt: integer('updated_at').notNull(),
}, t=>[uniqueIndex('idx_class_snow_arena').on(t.classId,t.arena)]);
