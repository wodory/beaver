/**
 * 동기화 이력 테이블 스키마
 * 
 * 저장소의 데이터 동기화 작업 이력을 저장합니다.
 */

import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { repositories } from './repositories.js';

/**
 * 동기화 이력 테이블
 */
export const syncHistory = sqliteTable('sync_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  repositoryId: integer('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull(), // 'success', 'failed', 'in_progress'
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }),
  commitCount: integer('commit_count').default(0),
  pullRequestCount: integer('pull_request_count').default(0),
  reviewCount: integer('review_count').default(0),
  jiraIssueCount: integer('jira_issue_count').default(0),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
}); 