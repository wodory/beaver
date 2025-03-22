// SQLite 스키마 index 파일
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * 간단한 테스트용 스키마
 */
export const testTable = sqliteTable('test_table', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

/**
 * 저장소 테이블
 */
export const repositories = sqliteTable('repositories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  owner: text('owner').notNull(),
  url: text('url').notNull(),
  gitServiceType: text('git_service_type').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

/**
 * 사용자 테이블
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  email: text('email'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

/**
 * 풀 리퀘스트 테이블
 */
export const pullRequests = sqliteTable('pull_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  repositoryId: integer('repository_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

/**
 * 커밋 테이블
 */
export const commits = sqliteTable('commits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sha: text('sha').notNull(),
  message: text('message'),
  repositoryId: integer('repository_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

/**
 * 리뷰 테이블
 */
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pullRequestId: integer('pull_request_id').notNull(),
  userId: integer('user_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

/**
 * 팀 테이블
 */
export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

/**
 * Jira 이슈 테이블
 */
export const jiraIssues = sqliteTable('jira_issues', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull(),
  summary: text('summary').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

/**
 * 동기화 히스토리 테이블
 */
export const syncHistory = sqliteTable('sync_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  repositoryId: integer('repository_id').notNull(),
  status: text('status').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

/**
 * 메트릭 캐시 테이블
 */
export const metricCache = sqliteTable('metric_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull(),
  value: text('value').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
}); 