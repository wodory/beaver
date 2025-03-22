import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

/**
 * 메트릭 캐시 테이블 스키마
 *
 * 이 테이블은 복잡한 메트릭 계산 결과를 캐싱하여 성능을 향상시킵니다.
 * 자주 사용되지만 계산 비용이 높은 메트릭들을 저장합니다.
 */
export const metricCache = sqliteTable('metric_cache', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    key: text('key').notNull(),
    value: text('value').notNull(),
    type: text('type').notNull(),
    repositoryId: integer('repository_id'),
    userId: integer('user_id'),
    teamId: integer('team_id'),
    validUntil: integer('valid_until', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
}); 