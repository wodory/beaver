import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

/**
 * 풀 리퀘스트 테이블 스키마 정의
 */
export const pullRequests = sqliteTable('pull_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: integer('number').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  state: text('state').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  closedAt: integer('closed_at', { mode: 'timestamp' }),
  mergedAt: integer('merged_at', { mode: 'timestamp' }),
  draft: integer('draft', { mode: 'boolean' }).default(false),
  repositoryId: integer('repository_id').notNull(),
  userId: integer('user_id'),
  sourceBranch: text('source_branch'),
  targetBranch: text('target_branch'),
  mergeCommitSha: text('merge_commit_sha'),
}); 