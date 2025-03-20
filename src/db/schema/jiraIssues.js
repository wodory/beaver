import { sql } from 'drizzle-orm';
import { integer, text, timestamp, pgTable, serial } from 'drizzle-orm/pg-core';
/**
 * JIRA 이슈 테이블 스키마
 */
export const jiraIssues = pgTable('jira_issues', {
    // 식별자
    id: serial('id').primaryKey(),
    // 저장소 외래 키
    repositoryId: integer('repository_id').notNull(),
    // JIRA 이슈 키 (프로젝트 키 + 번호, 예: 'PROJ-123')
    key: text('key').notNull().unique(),
    // 기본 정보
    summary: text('summary').notNull(),
    description: text('description'),
    status: text('status').notNull(),
    issueType: text('issue_type'),
    // 담당자 정보
    assignee: text('assignee'),
    reporter: text('reporter'),
    // 이슈 날짜 정보
    createdAt: timestamp('created_at').default(sql `CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').default(sql `CURRENT_TIMESTAMP`),
    resolvedAt: timestamp('resolved_at'),
    // 추가 메타데이터
    priority: text('priority'),
    storyPoints: integer('story_points'),
    components: text('components'), // JSON으로 저장된 컴포넌트 배열
    labels: text('labels'), // JSON으로 저장된 레이블 배열
    // JIRA 데이터 마지막 업데이트 타임스탬프
    lastSyncAt: timestamp('last_sync_at').default(sql `CURRENT_TIMESTAMP`)
});
