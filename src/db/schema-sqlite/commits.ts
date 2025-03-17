import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

/**
 * 커밋 테이블 스키마 정의 (SQLite)
 * 
 * 이 테이블은 Git 저장소의 커밋 정보를 저장합니다.
 */
export const commits = sqliteTable('commits', {
  id: text('id').primaryKey(), // Git 커밋 해시
  repositoryId: integer('repository_id').notNull(),
  authorId: integer('author_id'),
  committerId: integer('committer_id'),
  message: text('message'),
  committedAt: text('committed_at').notNull(),
  additions: integer('additions'),
  deletions: integer('deletions'),
  createdAt: text('created_at').default(String(new Date().toISOString())).notNull(),
  updatedAt: text('updated_at').default(String(new Date().toISOString())).notNull()
}); 