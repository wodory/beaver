// 간단한 JIRA 테스트 파일
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// ESM 환경에서 __dirname, __filename 에뮬레이션
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('간단한 JIRA 테스트 시작...');

// 각 모듈을 개별적으로 임포트해서 문제 추적
try {
  console.log('IJiraAdapter 모듈 임포트 시도...');
  // import 자체는 top-level로 해야 하므로 dynamic import 사용
  const IJiraAdapterModule = await import('../services/jira/IJiraAdapter.js');
  console.log('IJiraAdapter 임포트 성공!');
  
  console.log('JiraConfigManager 모듈 임포트 시도...');
  const JiraConfigManagerModule = await import('../services/jira/JiraConfigManager.js');
  console.log('JiraConfigManager 임포트 성공!');
  
  console.log('MockJiraAdapter 모듈 임포트 시도...');
  const MockJiraAdapterModule = await import('../services/jira/MockJiraAdapter.js');
  console.log('MockJiraAdapter 임포트 성공!');
  
  console.log('JiraApiAdapter 모듈 임포트 시도...');
  const JiraApiAdapterModule = await import('../services/jira/JiraApiAdapter.js');
  console.log('JiraApiAdapter 임포트 성공!');
  
  console.log('JiraDataCollector 모듈 임포트 시도...');
  const JiraDataCollectorModule = await import('../services/jira/JiraDataCollector.js');
  console.log('JiraDataCollector 임포트 성공!');
  
  // 기본 기능 테스트
  console.log('모든 모듈 임포트 성공! 기본 기능 테스트...');
  const { JiraDataCollector } = JiraDataCollectorModule;
  const collector = new JiraDataCollector(true); // Mock 어댑터 사용
  
  console.log('JiraDataCollector 인스턴스 생성 성공!');
  console.log('테스트 종료');
} catch (error) {
  console.error('테스트 실패:', error);
} 