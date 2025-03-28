import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * JIRA 이슈 테이블 스키마
 *
 * 이 테이블은 JIRA에서 가져온 이슈 정보를 저장합니다.
 */
export const jiraIssues = sqliteTable('jira_issues', {
    // 식별자
    id: integer('id').primaryKey({ autoIncrement: true }),
    // 저장소 외래 키
    repositoryId: integer('repository_id'),
    // JIRA 이슈 키 (프로젝트 키 + 번호, 예: 'PROJ-123')
    key: text('key').notNull(),
    // 기본 정보
    summary: text('summary').notNull(),
    description: text('description'),
    status: text('status'),
    issueType: text('issue_type'),
    // 담당자 정보
    assignee: text('assignee'),
    reporter: text('reporter'),
    // 이슈 날짜 정보
    created: integer('created', { mode: 'timestamp' }),
    updated: integer('updated', { mode: 'timestamp' }),
    projectKey: text('project_key'),
    projectName: text('project_name'),
    createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
    resolvedAt: text('resolved_at'),
    // 추가 메타데이터
    priority: text('priority'),
    storyPoints: integer('story_points'),
    components: text('components'), // JSON으로 저장된 컴포넌트 배열
    labels: text('labels'), // JSON으로 저장된 레이블 배열
    // JIRA 데이터 마지막 업데이트 타임스탬프
    lastSyncAt: text('last_sync_at').default(sql`CURRENT_TIMESTAMP`)
}); 