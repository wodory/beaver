import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * 저장소 테이블 스키마 정의
 * 
 * 이 테이블은 분석 대상인 GitHub 저장소 정보를 저장합니다.
 */
export const repositories = pgTable('repositories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull().unique(),
  cloneUrl: text('clone_url').notNull(),
  localPath: text('local_path'),
  type: text('type').default('github').notNull(),
  apiUrl: text('api_url'),
  apiToken: text('api_token'),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}); 