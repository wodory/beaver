import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

/**
 * PR 테이블 스키마 정의 (SQLite)
 * 
 * 이 테이블은 GitHub 저장소의 Pull Request 정보를 저장합니다.
 */
export const pullRequests = sqliteTable('pull_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: integer('number').notNull(),
  repositoryId: integer('repository_id').notNull(),
  title: text('title').notNull(),
  state: text('state').notNull(), // 'open', 'closed', 'merged'
  authorId: integer('author_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  closedAt: text('closed_at'),
  mergedAt: text('merged_at'),
  additions: integer('additions'),
  deletions: integer('deletions'),
  changedFiles: integer('changed_files'),
  recordCreatedAt: text('record_created_at').default(String(new Date().toISOString())).notNull(),
  recordUpdatedAt: text('record_updated_at').default(String(new Date().toISOString())).notNull()
}); 