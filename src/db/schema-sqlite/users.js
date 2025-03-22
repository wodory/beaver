import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

/**
 * 사용자 테이블 스키마 정의
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  displayName: text('display_name'),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  gitServiceType: text('git_service_type').notNull(),
  gitUserId: text('git_user_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
}); 