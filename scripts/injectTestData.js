#!/usr/bin/env node

/**
 * 테스트 데이터를 로컬 스토리지에 주입하는 스크립트
 * 브라우저 콘솔에서 실행하기 위한 코드입니다.
 * 복사하여 브라우저 콘솔에 붙여넣어 실행하세요.
 */

// 캐시 키 생성 함수
const generateCacheKey = (startDate, endDate, repo) => {
  const startDateStr = new Date(startDate).toISOString().split('T')[0];
  const endDateStr = new Date(endDate).toISOString().split('T')[0];
  return `metrics_cache_${repo}_${startDateStr}_${endDateStr}`;
};

// 고정 날짜 설정 (2025년 3월 1일 ~ 3월 16일)
const startDate = new Date('2025-03-01');
const endDate = new Date('2025-03-16');

console.log('테스트 데이터 날짜 범위:', {
  startDate: startDate.toISOString(),
  endDate: endDate.toISOString()
});

// d3 테스트 데이터
const d3TestData = {
  timestamp: new Date().toISOString(),
  expiresAt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1일 후 만료
  data: {
    metrics: {
      leadTimeForChanges: 48.5, // 48.5시간 (약 2일)
      deploymentFrequency: 0.8, // 0.8회/일 (거의 매일)
      changeFailureRate: 0.12, // 12%
      meanTimeToRestore: 3.5 // 3.5시간
    },
    events: [
      {
        id: 'deployment-1001',
        type: 'deployment',
        timestamp: '2025-03-01T10:00:00Z',
        description: '성공한 배포 (production)',
        repository: 'd3/d3'
      },
      {
        id: 'deployment-1002',
        type: 'incident',
        timestamp: '2025-03-03T11:00:00Z',
        description: '실패한 배포 (production)',
        repository: 'd3/d3'
      },
      {
        id: 'deployment-1003',
        type: 'deployment',
        timestamp: '2025-03-05T09:00:00Z',
        description: '성공한 배포 (production)',
        repository: 'd3/d3'
      }
    ],
    leadTimeData: [
      { date: '2025-03-01', leadTime: 50.2 },
      { date: '2025-03-05', leadTime: 48.7 },
      { date: '2025-03-10', leadTime: 45.3 },
      { date: '2025-03-15', leadTime: 46.8 }
    ],
    mttrData: [
      { date: '2025-03-01', mttr: 3.8 },
      { date: '2025-03-05', mttr: 3.5 },
      { date: '2025-03-10', mttr: 3.2 },
      { date: '2025-03-15', mttr: 3.4 }
    ]
  }
};

// react 테스트 데이터
const reactTestData = {
  timestamp: new Date().toISOString(),
  expiresAt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1일 후 만료
  data: {
    metrics: {
      leadTimeForChanges: 72.3, // 72.3시간 (약 3일)
      deploymentFrequency: 0.5, // 0.5회/일 (격일)
      changeFailureRate: 0.08, // 8%
      meanTimeToRestore: 2.1 // 2.1시간
    },
    events: [
      {
        id: 'deployment-2001',
        type: 'deployment',
        timestamp: '2025-03-02T15:00:00Z',
        description: '성공한 배포 (production)',
        repository: 'facebook/react'
      },
      {
        id: 'deployment-2002',
        type: 'deployment',
        timestamp: '2025-03-04T14:00:00Z',
        description: '성공한 배포 (production)',
        repository: 'facebook/react'
      },
      {
        id: 'deployment-2003',
        type: 'incident',
        timestamp: '2025-03-08T16:00:00Z',
        description: '실패한 배포 (production)',
        repository: 'facebook/react'
      },
      {
        id: 'deployment-2004',
        type: 'deployment',
        timestamp: '2025-03-10T12:00:00Z',
        description: '성공한 배포 (production)',
        repository: 'facebook/react'
      }
    ],
    leadTimeData: [
      { date: '2025-03-01', leadTime: 75.1 },
      { date: '2025-03-05', leadTime: 72.8 },
      { date: '2025-03-10', leadTime: 70.5 },
      { date: '2025-03-15', leadTime: 71.2 }
    ],
    mttrData: [
      { date: '2025-03-01', mttr: 2.3 },
      { date: '2025-03-05', mttr: 2.0 },
      { date: '2025-03-10', mttr: 2.2 },
      { date: '2025-03-15', mttr: 1.9 }
    ]
  }
};

// 캐시 키 생성
const d3CacheKey = generateCacheKey(startDate, endDate, 'd3/d3');
const reactCacheKey = generateCacheKey(startDate, endDate, 'facebook/react');

// 데이터 로컬 스토리지에 저장
localStorage.setItem(d3CacheKey, JSON.stringify(d3TestData));
localStorage.setItem(reactCacheKey, JSON.stringify(reactTestData));

console.log('캐시 키 및 데이터 정보:');
console.log('d3/d3 캐시 키:', d3CacheKey);
console.log('facebook/react 캐시 키:', reactCacheKey);
console.log('로컬 스토리지에 테스트 데이터가 성공적으로 저장되었습니다.');
console.log('사용 가능한 저장소:');
console.log('- d3/d3');
console.log('- facebook/react');
console.log('\n중요: 대시보드에서 다음 날짜를 선택하세요:');
console.log('- 시작일: 2025년 3월 1일');
console.log('- 종료일: 2025년 3월 16일'); 