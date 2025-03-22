import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';

/**
 * 팀 테이블 스키마 정의
 *
 * 이 테이블은 개발 팀 정보를 저장합니다.
 */
export const teams = sqliteTable('teams', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
});

/**
 * 팀 멤버십 테이블 스키마 정의
 *
 * 이 테이블은 팀과 사용자 간의 관계(팀 멤버십)를 저장합니다.
 */
export const teamMembers = sqliteTable('team_members', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').default('member'), // 'leader' | 'member'
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
}); 