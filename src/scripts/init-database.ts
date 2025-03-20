/**
 * 데이터베이스 초기화 스크립트
 * 
 * config.json에서 저장소 정보를 읽어와 데이터베이스에 삽입합니다.
 */
import { dbAdapter } from '../db/index.js';
import { schemaToUse as schema } from '../db/index.js';
import config from '../config.json' assert { type: 'json' };
import { RepositoryManager } from '../services/repository-manager.js';

// 데이터베이스에서 사용하는 저장소 인터페이스
interface Repository {
  id: number;
  name: string;
  fullName: string;
  cloneUrl: string;
  localPath: string | null;
  lastSyncAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * 데이터베이스를 초기화합니다.
 */
async function initializeDatabase(): Promise<void> {
  try {
    await dbAdapter.initialize();
    console.log('데이터베이스 초기화 완료');
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    throw error;
  }
}

/**
 * 데이터베이스 연결을 종료합니다.
 */
async function closeDatabase(): Promise<void> {
  try {
    await dbAdapter.close();
    console.log('데이터베이스 연결 종료');
  } catch (error) {
    console.error('데이터베이스 연결 종료 실패:', error);
  }
}

/**
 * 마이그레이션을 실행합니다.
 */
async function runMigrations(): Promise<void> {
  try {
    await dbAdapter.runMigrations();
    console.log('마이그레이션 완료');
  } catch (error) {
    console.error('마이그레이션 실패:', error);
    throw error;
  }
}

/**
 * 저장소 정보를 DB에 동기화합니다.
 */
async function syncRepositories() {
  if (!config.repositories || config.repositories.length === 0) {
    console.log('저장소 정보가 없습니다.');
    return;
  }

  console.log(`${config.repositories.length}개의 저장소 정보를 동기화합니다.`);
  
  try {
    const repoManager = new RepositoryManager(config.defaultPaths?.repoStorage || './repos');
    
    // 현재 저장된 모든 저장소 가져오기
    const existingRepos = await repoManager.getAllRepositories();
    const existingRepoMap = new Map();
    
    // 기존 저장소를 맵에 추가
    existingRepos.forEach(repo => {
      if (repo && typeof repo === 'object' && ('fullName' in repo || 'full_name' in repo)) {
        const repoKey = (repo as any).fullName || (repo as any).full_name;
        existingRepoMap.set(repoKey, repo);
      }
    });
    
    // config.json에 있는 저장소 추가 또는 업데이트
    for (const repo of config.repositories) {
      if (existingRepoMap.has(repo.fullName)) {
        console.log(`저장소 ${repo.fullName}은 이미 존재합니다.`);
        continue;
      }

      // 저장소 정보 추가 - Repository Manager 사용
      console.log(`저장소 ${repo.fullName} 추가 중...`);
      await repoManager.addRepository({
        name: repo.name,
        fullName: repo.fullName,
        cloneUrl: repo.url || `https://github.com/${repo.fullName}.git`
      });

      console.log(`저장소 ${repo.fullName} 추가 완료`);
    }

    console.log('모든 저장소 정보가 성공적으로 동기화되었습니다.');
  } catch (error) {
    console.error('저장소 정보 동기화 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 스크립트 메인 함수
 */
async function main() {
  try {
    console.log('데이터베이스 초기화 시작...');
    
    // 데이터베이스 초기화
    await initializeDatabase();
    
    // 마이그레이션 실행
    await runMigrations();
    
    // 저장소 정보 동기화
    await syncRepositories();
    
    console.log('데이터베이스 초기화 완료!');
  } catch (error) {
    console.error('초기화 중 오류 발생:', error);
  } finally {
    // 데이터베이스 연결 종료
    await closeDatabase();
  }
}

// 스크립트 실행
main(); 