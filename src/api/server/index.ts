/**
 * API 서버 설정
 * 
 * Fastify를 사용한 API 서버를 설정합니다.
 */
import Fastify, { FastifyInstance } from 'fastify';
import { initializeDatabase } from '../../db/index.js';
import { settingsRoutes } from './settings-api.js';
import fastifyCors from '@fastify/cors';

// 서버 인스턴스 생성
export const fastify: FastifyInstance = Fastify({
  logger: true
});

/**
 * 서버 초기화 함수
 */
export async function initializeServer() {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    
    // CORS 설정 (ESM 방식으로 수정)
    await fastify.register(fastifyCors, {
      origin: true
    });
    
    // API 라우트 등록
    await fastify.register(settingsRoutes);
    
    // 기본 라우트
    fastify.get('/', async () => {
      return { message: 'Beaver API 서버가 실행 중입니다.' };
    });
    
    return fastify;
  } catch (error) {
    console.error('서버 초기화 실패:', error);
    throw error;
  }
}

/**
 * 서버 시작 함수
 */
export async function startServer(port: number = 3001) {
  try {
    await initializeServer();
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// 직접 실행 시 서버 시작
// ESM 모듈에서는 import.meta.url을 확인하여 직접 실행 여부를 확인
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const port = parseInt(process.env.API_PORT || '3001');
  startServer(port);
} 