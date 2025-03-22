import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';

/**
 * 팀 테이블 스키마 정의
 *
 * 이 테이블은 개발 팀 정보를 저장합니다.
 */
export const teams = sqliteTable('teams', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    description: text('description'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
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

// 테이블 타입 정의 내보내기
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert; 