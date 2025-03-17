import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

/**
 * 사용자 테이블 스키마 정의 (SQLite)
 * 
 * 이 테이블은 GitHub 저장소에 기여한 사용자 정보를 저장합니다.
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  login: text('login').notNull(),
  name: text('name'),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  githubId: integer('github_id').unique(),
  createdAt: text('created_at').default(String(new Date().toISOString())).notNull(),
  updatedAt: text('updated_at').default(String(new Date().toISOString())).notNull()
}); 