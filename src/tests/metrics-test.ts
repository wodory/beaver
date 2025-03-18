import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';
import { MetricsService } from '../services/metrics/MetricsService';
import { dbAdapter, initializeDatabase, closeDatabase } from '../db';

// ESM 환경에서 __filename 에뮬레이션
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
dotenv.config();

/**
 * 메트릭 서비스 테스트 실행
 */
async function runMetricsTest() {
  console.log('메트릭 서비스 테스트 시작...');
  
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    console.log('데이터베이스 초기화 성공');
    
    // 메트릭 서비스 인스턴스 생성
    const metricsService = new MetricsService();
    
    // 날짜 범위 설정 (최근 90일)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    
    console.log(`테스트 날짜 범위: ${startDate.toISOString()} ~ ${endDate.toISOString()}`);
    
    try {
      // 첫 번째 저장소의 지표 계산
      console.log('\n1. 저장소 지표 테스트:');
      
      // 데이터베이스에서 첫 번째 저장소 ID 가져오기
      const reposResult = await dbAdapter.query(
        `SELECT id, name, full_name FROM repositories LIMIT 1`
      );
      
      if (reposResult.length === 0) {
        console.log('저장소 데이터가 없습니다.');
      } else {
        const repo = reposResult[0];
        const repoId = repo.id;
        
        console.log(`테스트 저장소: ${repo.full_name} (ID: ${repoId})`);
        
        const repoMetrics = await metricsService.getRepositoryMetrics(repoId, startDate, endDate);
        
        if (repoMetrics) {
          console.log('저장소 지표 결과:');
          console.log(`- 커밋 수: ${repoMetrics.commitCount}`);
          console.log(`- 기여자 수: ${repoMetrics.contributorCount}`);
          console.log(`- PR 수: ${repoMetrics.prCount}`);
          console.log(`- 병합된 PR 수: ${repoMetrics.prMergedCount}`);
          console.log(`- 리뷰 수: ${repoMetrics.reviewCount}`);
          console.log(`- 코드 추가 라인: ${repoMetrics.totalAdditions}`);
          console.log(`- 코드 삭제 라인: ${repoMetrics.totalDeletions}`);
          console.log(`- 첫 리뷰까지 평균 시간: ${repoMetrics.avgTimeToFirstReview ? repoMetrics.avgTimeToFirstReview + '분' : 'N/A'}`);
          console.log(`- 병합까지 평균 시간: ${repoMetrics.avgTimeToMerge ? repoMetrics.avgTimeToMerge + '분' : 'N/A'}`);
        } else {
          console.log('저장소 지표를 계산할 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('저장소 지표 테스트 실패:', error);
    }
    
    try {
      // 활발한 사용자 지표 계산
      console.log('\n2. 사용자 지표 테스트:');
      
      // 커밋을 많이 한 사용자 찾기
      const usersResult = await dbAdapter.query(
        `SELECT u.id, u.login, COUNT(c.id) as commit_count 
         FROM users u 
         JOIN commits c ON u.id = c.author_id 
         GROUP BY u.id 
         ORDER BY commit_count DESC LIMIT 1`
      );
      
      if (usersResult.length === 0) {
        console.log('사용자 데이터가 없습니다.');
      } else {
        const user = usersResult[0];
        const userId = user.id;
        
        console.log(`테스트 사용자: ${user.login} (ID: ${userId}, 커밋 수: ${user.commit_count})`);
        
        const userMetrics = await metricsService.getUserMetrics(userId, startDate, endDate);
        
        if (userMetrics) {
          console.log('사용자 지표 결과:');
          console.log(`- 커밋 수: ${userMetrics.commitCount}`);
          console.log(`- 코드 추가 라인: ${userMetrics.totalAdditions}`);
          console.log(`- 코드 삭제 라인: ${userMetrics.totalDeletions}`);
          console.log(`- PR 수: ${userMetrics.prCount}`);
          console.log(`- 병합된 PR 수: ${userMetrics.prMergedCount}`);
          console.log(`- 리뷰 작성 수: ${userMetrics.reviewsGivenCount}`);
          console.log(`- 활동 일수 (커밋): ${userMetrics.activeCommitDays}`);
          console.log(`- 활동 일수 (PR): ${userMetrics.activePrDays}`);
        } else {
          console.log('사용자 지표를 계산할 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('사용자 지표 테스트 실패:', error);
    }
    
    try {
      // 팀 지표 계산 (모든 저장소를 하나의 팀으로 가정)
      console.log('\n3. 팀 지표 테스트:');
      
      // 모든 저장소 ID 가져오기
      const allReposResult = await dbAdapter.query(
        `SELECT id FROM repositories`
      );
      
      if (allReposResult.length === 0) {
        console.log('저장소 데이터가 없습니다.');
      } else {
        const repoIds = allReposResult.map(repo => repo.id);
        
        console.log(`테스트 팀: 전체 팀 (${repoIds.length}개 저장소)`);
        
        const teamMetrics = await metricsService.getTeamMetrics(
          'all-team',
          '전체 팀',
          repoIds,
          startDate,
          endDate
        );
        
        if (teamMetrics) {
          console.log('팀 지표 결과:');
          console.log(`- 멤버 수: ${teamMetrics.memberCount}`);
          console.log(`- 커밋 수: ${teamMetrics.commitCount}`);
          console.log(`- PR 수: ${teamMetrics.prCount}`);
          console.log(`- 병합된 PR 수: ${teamMetrics.prMergedCount}`);
          console.log(`- 리뷰 수: ${teamMetrics.reviewCount}`);
          console.log(`- 코드 추가 라인: ${teamMetrics.totalAdditions}`);
          console.log(`- 코드 삭제 라인: ${teamMetrics.totalDeletions}`);
          console.log(`- 첫 리뷰까지 평균 시간: ${teamMetrics.avgTimeToFirstReview ? teamMetrics.avgTimeToFirstReview + '분' : 'N/A'}`);
          console.log(`- 병합까지 평균 시간: ${teamMetrics.avgTimeToMerge ? teamMetrics.avgTimeToMerge + '분' : 'N/A'}`);
          console.log(`- 완료된 JIRA 이슈 수: ${teamMetrics.jiraIssuesCompletedCount}`);
          console.log(`- 평균 이슈 해결 시간: ${teamMetrics.avgIssueResolutionTime ? teamMetrics.avgIssueResolutionTime + '시간' : 'N/A'}`);
        } else {
          console.log('팀 지표를 계산할 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('팀 지표 테스트 실패:', error);
    }
    
    console.log('\n메트릭 서비스 테스트 완료');
    return true;
  } catch (error) {
    console.error('메트릭 서비스 테스트 실패:', error);
    return false;
  } finally {
    // 데이터베이스 연결 종료
    await closeDatabase();
    console.log('데이터베이스 연결 종료');
  }
}

// 메인 함수로 실행될 때만 테스트 수행
if (import.meta.url === `file://${process.argv[1]}`) {
  runMetricsTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('예기치 않은 오류:', error);
      process.exit(1);
    });
} 