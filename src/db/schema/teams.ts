import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * 팀 테이블 스키마 정의
 * 
 * 이 테이블은 개발 팀 정보를 저장합니다.
 */
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

/**
 * 팀 멤버십 테이블 스키마 정의
 * 
 * 이 테이블은 팀과 사용자 간의 관계(팀 멤버십)를 저장합니다.
 */
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').default('member'), // 'leader' | 'member'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}); 