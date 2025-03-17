import { runMigrations } from '../db';
import 'dotenv/config';

/**
 * 데이터베이스 마이그레이션 실행 스크립트
 * 
 * 이 스크립트는 Drizzle ORM의 마이그레이션을 실행합니다.
 */
async function main() {
  try {
    console.log(`마이그레이션 시작... (DB 타입: ${process.env.DB_TYPE || 'postgresql'})`);
    await runMigrations();
    console.log('마이그레이션 완료');
    process.exit(0);
  } catch (error) {
    console.error('마이그레이션 실패:', error);
    process.exit(1);
  }
}

main(); 