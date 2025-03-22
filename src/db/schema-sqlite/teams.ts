import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

/**
 * 팀 테이블 스키마 정의 (SQLite)
 * 
 * 이 테이블은 개발 팀 정보를 저장합니다.
 */
export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: text('created_at').default(String(new Date().toISOString())).notNull(),
  updatedAt: text('updated_at').default(String(new Date().toISOString())).notNull()
});

/**
 * 팀 멤버십 테이블 스키마 정의 (SQLite)
 * 
 * 이 테이블은 팀과 사용자 간의 관계(팀 멤버십)를 저장합니다.
 */
export const teamMembers = sqliteTable('team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  teamId: integer('team_id').notNull(),
  userId: integer('user_id').notNull(),
  role: text('role').default('member'), // 'leader' | 'member'
  createdAt: text('created_at').default(String(new Date().toISOString())).notNull(),
  updatedAt: text('updated_at').default(String(new Date().toISOString())).notNull()
}); 