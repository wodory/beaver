/**
 * 동기화 이력 테이블 스키마
 * 
 * 저장소의 데이터 동기화 작업 이력을 저장합니다.
 */

import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { repositories } from './repositories.js';

/**
 * 동기화 이력 테이블
 */
export const syncHistory = sqliteTable('sync_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  repositoryId: integer('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  status: text('status').notNull().default('running'),
  commitCount: integer('commit_count').notNull().default(0),
  pullRequestCount: integer('pull_request_count').notNull().default(0),
  reviewCount: integer('review_count').notNull().default(0),
  error: text('error'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
}); 