/**
 * API 서버 실행 스크립트
 * 
 * 이 스크립트는 Fastify 기반 API 서버를 실행합니다.
 */

// ESM 스타일 import를 위한 동적 임포트
async function startServer() {
  try {
    // 환경 변수 설정
    process.env.DB_TYPE = 'neon';
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Fg3G0Pyrcklp@ep-bold-water-a1ga74m9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
    process.env.API_PORT = process.env.API_PORT || '3001';
    
    // 서버 모듈 동적 임포트
    const { startServer } = await import('../api/server/index.js');
    
    // 포트 설정
    const port = parseInt(process.env.API_PORT);
    
    // 서버 시작
    await startServer(port);
    
    console.log(`API 서버가 포트 ${port}에서 실행 중입니다.`);
  } catch (error) {
    console.error('API 서버 시작 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
startServer(); 