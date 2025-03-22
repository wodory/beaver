import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

/**
 * 저장소 테이블 스키마 정의
 */
export const repositories = sqliteTable('repositories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  owner: text('owner').notNull(),
  url: text('url').notNull(),
  gitServiceType: text('git_service_type').notNull(),
  cloneUrl: text('clone_url'),
  defaultBranch: text('default_branch'),
  description: text('description'),
  lastSyncAt: integer('last_sync_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
  teamId: integer('team_id').references(() => teams.id),
});

// 단, teams 테이블을 참조하고 있으므로 teams 테이블 스키마도 간단히 정의
export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
}); 