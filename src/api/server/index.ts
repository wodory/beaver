/**
 * API 서버 설정
 * 
 * Fastify를 사용한 API 서버를 설정합니다.
 */
import Fastify, { FastifyInstance } from 'fastify';
import { initializeDatabase, getDB } from '../../db/index.js';
import { schemaToUse as schema } from '../../db/index.js';
import { settingsRoutes } from './settings-api.js';
import { metricsRoutes } from './metrics-api.js';
import fastifyCors from '@fastify/cors';
import { eq } from 'drizzle-orm';

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
    await fastify.register(metricsRoutes);
    
    // 저장소 목록 API 엔드포인트
    fastify.get('/repositories', async () => {
      try {
        const db = getDB();
        const repositories = await db.select().from(schema.repositories);
        return repositories;
      } catch (error) {
        console.error('저장소 목록 조회 실패:', error);
        throw { statusCode: 500, message: '저장소 목록을 가져오는데 실패했습니다.' };
      }
    });
    
    // 저장소 동기화 API 엔드포인트 추가 (임시 목업)
    fastify.post('/repositories/:id/sync', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { forceFull = false, syncJira = true } = request.body as { forceFull?: boolean, syncJira?: boolean };
        
        console.log(`저장소 ID ${id} 동기화 요청 수신 - forceFull: ${forceFull}, syncJira: ${syncJira}`);
        
        // 저장소 존재 여부 확인
        const db = getDB();
        const repositories = await db.select().from(schema.repositories).where(eq(schema.repositories.id, parseInt(id)));
        
        if (repositories.length === 0) {
          return reply.status(404).send({ error: '저장소를 찾을 수 없습니다.' });
        }
        
        // SyncManager를 통해 실제 동기화 수행
        try {
          // ESM 로더에서는 확장자를 .js로 변경
          const { SyncManager } = await import('../../services/git/SyncManager.js');
          const syncManager = new SyncManager();
          
          // 비동기로 동기화 작업 시작 (백그라운드에서 실행)
          syncManager.syncRepository(parseInt(id), forceFull, syncJira)
            .then(result => {
              console.log(`저장소 ${id} 동기화 완료:`, result);
              // 동기화 결과를 DB에 저장하거나 추가 작업 수행 가능
            })
            .catch(error => {
              console.error(`저장소 ${id} 동기화 중 오류 발생:`, error);
            });
          
          // 즉시 응답 반환 (작업은 백그라운드에서 계속)
          return reply.status(202).send({ 
            message: '저장소 동기화가 시작되었습니다.',
            status: 'processing',
            repositoryId: id,
            forceFull,
            syncJira,
            timestamp: new Date().toISOString()
          });
        } catch (importError: any) {
          console.error('SyncManager 모듈 로드 중 오류:', importError);
          return reply.status(500).send({ 
            error: '저장소 동기화 모듈 로드 실패', 
            details: importError.message || '알 수 없는 오류',
            stack: importError.stack || '스택 정보 없음'
          });
        }
      } catch (error: any) {
        console.error('저장소 동기화 API 오류:', error);
        return reply.status(500).send({ 
          error: '저장소 동기화 중 오류가 발생했습니다.',
          details: error.message || '알 수 없는 오류',
          stack: error.stack || '스택 정보 없음'
        });
      }
    });
    
    // 기본 라우트
    fastify.get('/', async () => {
      return { message: 'Beaver API 서버가 실행 중입니다.' };
    });
    
    // 헬스체크 엔드포인트 추가
    fastify.get('/healthz', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
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