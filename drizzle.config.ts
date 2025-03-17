import type { Config } from 'drizzle-kit';
import 'dotenv/config';

/**
 * Drizzle 마이그레이션 설정
 * 
 * 이 설정 파일은 PostgreSQL 마이그레이션을 위한 Drizzle Kit 구성을 정의합니다.
 */
export default {
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'pg',
  driver: 'pg',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'github_metrics',
  },
  verbose: true,
  strict: true,
} satisfies Config; 