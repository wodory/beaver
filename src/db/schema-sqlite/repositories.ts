import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

/**
 * 저장소 테이블 스키마 정의 (SQLite)
 * 
 * 이 테이블은 분석 대상인 GitHub 저장소 정보를 저장합니다.
 */
export const repositories = sqliteTable('repositories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  fullName: text('full_name').notNull().unique(),
  cloneUrl: text('clone_url').notNull(),
  localPath: text('local_path'),
  type: text('type').default('github').notNull(),
  apiUrl: text('api_url'),
  apiToken: text('api_token'),
  lastSyncAt: text('last_sync_at').default(String(new Date().toISOString())),
  createdAt: text('created_at').default(String(new Date().toISOString())).notNull(),
  updatedAt: text('updated_at').default(String(new Date().toISOString())).notNull()
}); 