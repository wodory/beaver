/**
 * 저장소 정보 출력 스크립트
 * 
 * 데이터베이스에 저장된 모든 저장소 정보를 출력합니다.
 */
import { initializeDatabase, getDB } from '../db/index.js';
import { schemaToUse as schema } from '../db/index.js';

// 환경 변수 설정
process.env.DB_TYPE = 'sqlite';

// 저장소 인터페이스 정의
interface Repository {
  id: number;
  name: string;
  fullName: string;
  cloneUrl: string;
  localPath?: string;
  type?: string;
  apiUrl?: string;
  apiToken?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

async function displayRepositories() {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    console.log('데이터베이스 연결 성공');
    
    // 저장소 정보 조회
    const db = getDB();
    const repositories = await db.select().from(schema.repositories) as Repository[];
    
    console.log(`\n총 ${repositories.length}개의 저장소 정보가 있습니다.`);
    
    // 저장소 정보 출력
    if (repositories.length > 0) {
      console.log('\n=== 저장소 목록 ===');
      repositories.forEach((repo: Repository, index: number) => {
        console.log(`\n[${index + 1}] ${repo.fullName}`);
        console.log(`  - ID: ${repo.id}`);
        console.log(`  - 이름: ${repo.name}`);
        console.log(`  - Clone URL: ${repo.cloneUrl}`);
        console.log(`  - 타입: ${repo.type || 'github'}`);
        console.log(`  - 마지막 동기화: ${repo.lastSyncAt || '없음'}`);
        console.log(`  - 생성일: ${repo.createdAt}`);
      });
    } else {
      console.log('\n저장소 정보가 없습니다. 저장소를 추가해주세요.');
    }
    
  } catch (error) {
    console.error('저장소 정보 조회 실패:', error);
  }
}

// 스크립트 실행
displayRepositories(); 