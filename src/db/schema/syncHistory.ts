/**
 * 동기화 이력 테이블 스키마
 * 
 * 저장소의 데이터 동기화 작업 이력을 저장합니다.
 */

import { integer, pgTableCreator, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { repositories } from './repositories.js';

// 테이블 생성 헬퍼 함수
const pgTable = pgTableCreator((name) => `sync_history`);

/**
 * 동기화 이력 테이블
 */
export const syncHistory = pgTable('sync_history', {
  id: serial('id').primaryKey(),
  repositoryId: integer('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  status: varchar('status', { length: 20 }).notNull().default('running'),
  commitCount: integer('commit_count').notNull().default(0),
  pullRequestCount: integer('pull_request_count').notNull().default(0),
  reviewCount: integer('review_count').notNull().default(0),
  error: text('error'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// 테이블 타입 정의 내보내기
export type SyncHistory = typeof syncHistory.$inferSelect;
export type NewSyncHistory = typeof syncHistory.$inferInsert; 