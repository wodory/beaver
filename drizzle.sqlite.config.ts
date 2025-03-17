import type { Config } from 'drizzle-kit';
import 'dotenv/config';

/**
 * Drizzle 마이그레이션 설정
 * 
 * 이 설정 파일은 SQLite 마이그레이션을 위한 Drizzle Kit 구성을 정의합니다.
 */
export default {
  schema: './src/db/schema-sqlite/*.ts',
  out: './src/db/migrations-sqlite',
  dialect: 'sqlite',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: process.env.SQLITE_DB_PATH || './data/github-metrics.db',
  },
  verbose: true,
  strict: true,
} satisfies Config; 