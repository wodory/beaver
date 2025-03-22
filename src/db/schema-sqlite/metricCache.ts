import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * 메트릭 캐시 테이블 스키마
 *
 * 이 테이블은 복잡한 메트릭 계산 결과를 캐싱하여 성능을 향상시킵니다.
 * 자주 사용되지만 계산 비용이 높은 메트릭들을 저장합니다.
 */
export const metricCache = sqliteTable('metric_cache', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    cacheKey: text('cache_key').notNull().unique(),
    metricType: text('metric_type').notNull(), // 'user', 'team', 'repository'
    targetId: text('target_id').notNull(), // user id, team name, or repository id
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    data: text('data').notNull(), // JSON data as text in SQLite
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    expiresAt: text('expires_at').notNull()
});

// 테이블 타입 정의 내보내기
export type MetricCache = typeof metricCache.$inferSelect;
export type NewMetricCache = typeof metricCache.$inferInsert; 