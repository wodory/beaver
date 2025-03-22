import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

/**
 * PR 리뷰 테이블 스키마 정의 (SQLite)
 * 
 * 이 테이블은 GitHub 저장소의 Pull Request 리뷰 정보를 저장합니다.
 */
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(), // GitHub API에서 제공하는 리뷰 ID
  pullRequestId: integer('pull_request_id').notNull(),
  state: text('state').notNull(), // 'approved', 'changes_requested', 'commented'
  authorId: integer('author_id'),
  submittedAt: text('submitted_at').notNull(),
  body: text('body'),
  createdAt: text('created_at').default(String(new Date().toISOString())).notNull(),
  updatedAt: text('updated_at').default(String(new Date().toISOString())).notNull()
});

/**
 * PR 리뷰 테이블 스키마 정의 (SQLite)
 * 
 * 이 테이블은 GitHub Pull Request 리뷰 데이터를 저장합니다.
 * 리뷰어, 리뷰 상태, 댓글, 제출 시간 등의 정보가 포함됩니다.
 */
export const prReviews = sqliteTable('pr_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pullRequestId: integer('pull_request_id').notNull(),
  reviewerId: integer('reviewer_id'),
  state: text('state').notNull(), // 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED'
  body: text('body'),
  submittedAt: text('submitted_at').notNull(),
  createdAt: text('created_at').default(String(new Date().toISOString())).notNull(),
  updatedAt: text('updated_at').default(String(new Date().toISOString())).notNull()
}); 