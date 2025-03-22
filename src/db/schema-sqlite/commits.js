import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

/**
 * 커밋 테이블 스키마 정의
 */
export const commits = sqliteTable('commits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sha: text('sha').notNull(),
  message: text('message'),
  authorName: text('author_name'),
  authorEmail: text('author_email'),
  authorDate: integer('author_date', { mode: 'timestamp' }),
  committerName: text('committer_name'),
  committerEmail: text('committer_email'),
  commitDate: integer('commit_date', { mode: 'timestamp' }),
  repositoryId: integer('repository_id').notNull(),
  userId: integer('user_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
}); 