import type { Config } from 'drizzle-kit';
import 'dotenv/config';
import { extractPostgresInfo } from './src/utils/db-utils';

// Neon DB 연결 문자열에서 호스트, 사용자, 비밀번호, DB 이름을 추출
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Fg3G0Pyrcklp@ep-bold-water-a1ga74m9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const { host, user, password, database, port } = extractPostgresInfo(connectionString);

/**
 * Drizzle 마이그레이션 설정
 * 
 * 이 설정 파일은 PostgreSQL 마이그레이션을 위한 Drizzle Kit 구성을 정의합니다.
 */
export default {
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host,
    port: port || 5432,
    user,
    password,
    database,
    ssl: true
  },
  verbose: true,
  strict: true,
} satisfies Config; 