import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { repositories } from './repositories.js';
import { users } from './users.js';
/**
 * Pull Request 테이블 스키마 정의
 *
 * 이 테이블은 GitHub Pull Request 데이터를 저장합니다.
 * PR 번호, 제목, 작성자, 상태, 생성/병합 시간 등의 정보가 포함됩니다.
 */
export const pullRequests = pgTable('pull_requests', {
    id: serial('id').primaryKey(),
    repositoryId: integer('repository_id').notNull().references(() => repositories.id, { onDelete: 'cascade' }),
    number: integer('number').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    state: text('state').notNull(), // 'open' | 'closed' | 'merged'
    authorId: integer('author_id').references(() => users.id),
    isDraft: boolean('is_draft').default(false),
    additions: integer('additions'),
    deletions: integer('deletions'),
    changedFiles: integer('changed_files'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    mergedAt: timestamp('merged_at', { withTimezone: true }),
    mergedBy: integer('merged_by').references(() => users.id)
});
