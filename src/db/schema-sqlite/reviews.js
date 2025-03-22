import { sqliteTable, integer, text, sql } from 'drizzle-orm/sqlite-core';
import { pullRequests } from './pullRequests.js';
import { users } from './users.js';

/**
 * PR 리뷰 테이블 스키마 정의 (SQLite)
 *
 * 이 테이블은 GitHub Pull Request 리뷰 데이터를 저장합니다.
 * 리뷰어, 리뷰 상태, 댓글, 제출 시간 등의 정보가 포함됩니다.
 */
export const prReviews = sqliteTable('pr_reviews', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pullRequestId: integer('pull_request_id').notNull().references(() => pullRequests.id, { onDelete: 'cascade' }),
    reviewerId: integer('reviewer_id').references(() => users.id),
    state: text('state').notNull(), // 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED'
    body: text('body'),
    submittedAt: text('submitted_at').notNull(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
}); 