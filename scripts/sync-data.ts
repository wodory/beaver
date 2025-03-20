/**
 * 저장소 데이터 동기화 및 메트릭스 계산 스크립트
 * 
 * 이 스크립트는 다음 작업을 수행합니다:
 * 1. 데이터베이스 연결
 * 2. 저장소 목록 조회
 * 3. 각 저장소의 데이터 동기화 (커밋, PR, 리뷰 등)
 * 4. 메트릭스 계산
 */

import { initializeDatabase, closeDatabase, getDB } from '../src/db/index.js';
import { schemaToUse as schema } from '../src/db/index.js';
import { SyncManager } from '../src/services/git/SyncManager.js';
import { eq } from 'drizzle-orm';
import { format, subDays } from 'date-fns';

// 결과 타입 정의
interface SyncResult {
  repositoryName: string;
  success: boolean;
  commitCount: number;
  pullRequestCount: number;
  reviewCount: number;
  error?: string;
}

/**
 * 메인 함수
 */
async function main() {
  try {
    console.log('저장소 데이터 동기화 및 메트릭스 계산 시작');
    
    // 1. 데이터베이스 초기화
    console.log('데이터베이스 연결 중...');
    await initializeDatabase();
    console.log('데이터베이스 연결 성공');
    
    // 2. 저장소 목록 조회
    const db = getDB();
    const repositories = await db.select().from(schema.repositories);
    console.log(`저장소 ${repositories.length}개 조회 완료`);
    
    // 3. SyncManager 초기화
    const syncManager = new SyncManager();
    
    // 4. 각 저장소 동기화
    const results: SyncResult[] = [];
    for (const repo of repositories) {
      console.log(`저장소 동기화 시작: ${repo.fullName} (ID: ${repo.id})`);
      
      try {
        // 저장소 데이터 동기화 (커밋, PR, 리뷰 등)
        const result = await syncManager.syncRepository(repo.id, false, true);
        
        // 결과 저장
        results.push({
          repositoryName: repo.fullName,
          success: true,
          commitCount: result.commitCount,
          pullRequestCount: result.pullRequestCount,
          reviewCount: result.reviewCount
        });
        
        console.log(`저장소 동기화 완료: ${repo.fullName}`);
        console.log(`- 커밋: ${result.commitCount}개`);
        console.log(`- PR: ${result.pullRequestCount}개`);
        console.log(`- 리뷰: ${result.reviewCount}개`);
      } catch (error) {
        console.error(`저장소 동기화 실패: ${repo.fullName}`, error);
        
        results.push({
          repositoryName: repo.fullName,
          success: false,
          commitCount: 0,
          pullRequestCount: 0,
          reviewCount: 0,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    // 5. 메트릭스 계산 (최근 30일)
    console.log('\n메트릭스 계산 시작 (최근 30일)');
    const now = new Date();
    const startDate = subDays(now, 30);
    
    for (const repo of repositories) {
      console.log(`저장소 메트릭스 계산: ${repo.fullName}`);
      
      // 메트릭스 계산 요청 시뮬레이션
      try {
        const url = `http://localhost:3001/metrics/projects/${repo.id}?from=${format(startDate, 'yyyy-MM-dd')}&to=${format(now, 'yyyy-MM-dd')}`;
        console.log(`메트릭스 URL: ${url}`);
        
        // 실제 요청은 주석 처리 (필요시 해제)
        // const response = await fetch(url);
        // const metrics = await response.json();
        // console.log(`메트릭스 계산 완료: ${repo.fullName}`, metrics);
      } catch (error) {
        console.error(`메트릭스 계산 실패: ${repo.fullName}`, error);
      }
    }
    
    // 결과 요약 출력
    console.log('\n동기화 결과 요약:');
    console.log('---------------------------------------------------------------');
    console.log('저장소               | 상태   | 커밋 수 | PR 수 | 리뷰 수');
    console.log('---------------------------------------------------------------');
    
    for (const result of results) {
      const status = result.success ? '성공' : '실패';
      console.log(
        `${result.repositoryName.padEnd(20)} | ${status.padEnd(6)} | ${String(result.commitCount).padEnd(7)} | ${String(result.pullRequestCount).padEnd(5)} | ${result.reviewCount}`
      );
    }
    
    console.log('---------------------------------------------------------------');
    
    // 6. 데이터베이스 연결 종료
    console.log('\n데이터베이스 연결 종료');
    await closeDatabase();
    
    console.log('스크립트 실행 완료');
  } catch (error) {
    console.error('스크립트 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main().catch(error => {
  console.error('치명적인 오류 발생:', error);
  process.exit(1);
}); 