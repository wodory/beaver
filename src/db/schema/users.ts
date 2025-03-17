import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

/**
 * 사용자 테이블 스키마 정의
 * 
 * 이 테이블은 GitHub 사용자 정보를 저장합니다.
 * 커밋 작성자, PR 작성자, 리뷰어 등의 사용자 정보가 여기에 저장됩니다.
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  githubId: integer('github_id').unique(),
  login: text('login').notNull().unique(),
  name: text('name'),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  company: text('company'),
  location: text('location'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}); 