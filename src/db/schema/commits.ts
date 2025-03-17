import { pgTable, text, integer, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { repositories } from './repositories';
import { users } from './users';

/**
 * 커밋 테이블 스키마 정의
 * 
 * 이 테이블은 저장소의 Git 커밋 데이터를 저장합니다.
 * 커밋 작성자, 메시지, 시간, 코드 추가/삭제 라인 수 등의 정보가 포함됩니다.
 */
export const commits = pgTable('commits', {
  id: text('id').primaryKey(), // Git commit SHA
  repositoryId: integer('repository_id').notNull().references(() => repositories.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').references(() => users.id),
  committerId: integer('committer_id').references(() => users.id),
  message: text('message'),
  committedAt: timestamp('committed_at', { withTimezone: true }).notNull(),
  additions: integer('additions'),
  deletions: integer('deletions'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}); 