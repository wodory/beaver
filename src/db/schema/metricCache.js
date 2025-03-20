import { pgTable, serial, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
/**
 * 메트릭 캐시 테이블 스키마 정의
 *
 * 이 테이블은 계산된 메트릭 결과를 캐싱하여 성능을 향상시킵니다.
 * 24시간 등 일정 기간 동안 자주 요청되는 복잡한 메트릭 계산 결과를 저장합니다.
 */
export const metricCache = pgTable('metric_cache', {
    id: serial('id').primaryKey(),
    cacheKey: text('cache_key').notNull().unique(),
    metricType: text('metric_type').notNull(), // 'user' | 'team' | 'repository'
    targetId: text('target_id').notNull(), // 사용자 ID, 팀 이름, 또는 저장소 ID
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    data: jsonb('data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull() // 캐시 만료 시간
});
