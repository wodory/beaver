import { RepositoryManager } from '../services/repository-manager';
import { initializeDatabase, closeDatabase } from '../db';
import 'dotenv/config';
import { dbAdapter } from '../db';
import { schemaToUse as schema } from '../db';

/**
 * 저장소 관리 모듈 테스트 스크립트
 * 
 * 이 스크립트는 RepositoryManager 클래스의 기능을 테스트합니다.
 */
async function main() {
  try {
    console.log('데이터베이스 초기화 중...');
    await initializeDatabase();
    
    // 테스트 전에 기존 데이터 삭제
    if (dbAdapter.db) {
      console.log('테스트 데이터 초기화 중...');
      await dbAdapter.db.delete(schema.repositories).execute();
    }
    
    const repoManager = new RepositoryManager(process.env.REPOS_BASE_PATH || './repos');
    
    // 테스트 저장소 추가
    console.log('테스트 저장소 추가 중...');
    const testRepo = await repoManager.addRepository({
      name: 'test-repo',
      fullName: 'test-user/test-repo',
      cloneUrl: 'https://github.com/facebook/react.git' // 테스트용으로 React 저장소 사용
    });
    
    console.log('추가된 저장소 정보:', testRepo);
    
    // 모든 저장소 목록 조회
    console.log('모든 저장소 목록 조회 중...');
    const allRepos = await repoManager.getAllRepositories();
    console.log('저장소 목록:', allRepos);
    
    // 저장소 정보 조회
    console.log('저장소 정보 조회 중...');
    const repo = await repoManager.getRepository(testRepo.id);
    console.log('조회된 저장소 정보:', repo);
    
    // 저장소 삭제
    console.log('저장소 삭제 중...');
    await repoManager.removeRepository(testRepo.id);
    console.log('저장소 삭제 완료');
    
    // 삭제 후 목록 확인
    const reposAfterDelete = await repoManager.getAllRepositories();
    console.log('삭제 후 저장소 목록:', reposAfterDelete);
    
    console.log('테스트 완료');
  } catch (error) {
    console.error('테스트 실패:', error);
  } finally {
    await closeDatabase();
  }
}

main(); 