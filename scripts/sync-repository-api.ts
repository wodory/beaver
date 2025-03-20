import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3001';

/**
 * 저장소 동기화 API를 호출하는 스크립트
 */
async function main() {
  try {
    console.log('저장소 목록 가져오는 중...');
    const repositoriesResponse = await axios.get(`${API_URL}/repositories`);
    const repositories = repositoriesResponse.data;
    
    console.log(`총 ${repositories.length}개의 저장소를 찾았습니다.`);
    
    for (const repo of repositories) {
      console.log(`저장소 [${repo.name}] 동기화 시작...`);
      
      try {
        // 저장소 동기화 API 호출
        const syncResponse = await axios.post(`${API_URL}/repositories/${repo.id}/sync`, {
          forceFull: true,
          syncJira: true
        });
        
        console.log(`저장소 [${repo.name}] 동기화 요청 완료:`, syncResponse.data);
        
      } catch (repoError) {
        console.error(`저장소 [${repo.name}] 동기화 실패:`, repoError.message);
        if (repoError.response) {
          console.error(`  상태 코드: ${repoError.response.status}`);
          console.error(`  응답 데이터:`, repoError.response.data);
        }
      }
    }
    
    console.log('모든 저장소 동기화 요청 완료');
    
    // 메트릭스 계산 API 호출
    console.log('메트릭스 계산 시작...');
    
    for (const repo of repositories) {
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const metricsResponse = await axios.get(`${API_URL}/metrics/projects/${repo.id}`, {
          params: {
            from: thirtyDaysAgo.toISOString(),
            to: now.toISOString()
          }
        });
        
        console.log(`저장소 [${repo.name}] 메트릭스 계산 완료:`, 
          `커밋 수: ${metricsResponse.data.commitCount || 'N/A'}, ` +
          `PR 수: ${metricsResponse.data.prCount || 'N/A'}`
        );
        
      } catch (metricsError) {
        console.error(`저장소 [${repo.name}] 메트릭스 계산 실패:`, metricsError.message);
      }
    }
    
    console.log('모든 저장소 메트릭스 계산 완료');
    
    process.exit(0);
  } catch (error) {
    console.error('스크립트 실행 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main().catch(err => {
  console.error('치명적 오류 발생:', err);
  process.exit(1);
}); 