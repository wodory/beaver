import React from 'react';
import { createRoot } from 'react-dom/client';
import { TimelineChart, TimelineEvent } from '../components/metrics/TimelineChart';
import { addDays, subDays, format } from 'date-fns';

// 현재 날짜 기준 테스트 데이터 생성
const generateMockEvents = (): TimelineEvent[] => {
  const today = new Date();
  const events: TimelineEvent[] = [];

  // 커밋 이벤트 생성
  for (let i = 30; i >= 0; i -= Math.floor(Math.random() * 3) + 1) {
    const date = subDays(today, i);
    events.push({
      id: `commit-${i}`,
      date: date.toISOString(),
      type: 'commit',
      value: Math.floor(Math.random() * 10) + 1,
      label: `${Math.floor(Math.random() * 10) + 1}개의 커밋`,
      description: `파일 ${Math.floor(Math.random() * 20) + 1}개 변경됨`
    });
  }

  // PR 이벤트 생성
  for (let i = 28; i >= 2; i -= Math.floor(Math.random() * 5) + 3) {
    const date = subDays(today, i);
    events.push({
      id: `pr-${i}`,
      date: date.toISOString(),
      type: 'pr',
      value: Math.floor(Math.random() * 3) + 1,
      label: `PR #${Math.floor(Math.random() * 100) + 1}`,
      description: '기능 구현 및 버그 수정'
    });
  }

  // 이슈 이벤트 생성
  for (let i = 25; i >= 5; i -= Math.floor(Math.random() * 7) + 4) {
    const date = subDays(today, i);
    events.push({
      id: `issue-${i}`,
      date: date.toISOString(),
      type: 'issue',
      value: Math.floor(Math.random() * 4) + 1,
      label: `이슈 #${Math.floor(Math.random() * 100) + 1}`,
      description: '새로운 이슈 등록'
    });
  }

  // 리뷰 이벤트 생성
  for (let i = 27; i >= 3; i -= Math.floor(Math.random() * 6) + 3) {
    const date = subDays(today, i);
    events.push({
      id: `review-${i}`,
      date: date.toISOString(),
      type: 'review',
      value: Math.floor(Math.random() * 5) + 1,
      label: `PR #${Math.floor(Math.random() * 100) + 1} 리뷰`,
      description: '코드 리뷰 완료'
    });
  }

  // 릴리스 이벤트 생성
  for (let i = 20; i >= 0; i -= 10) {
    const date = subDays(today, i);
    events.push({
      id: `release-${i}`,
      date: date.toISOString(),
      type: 'release',
      value: Math.floor(Math.random() * 3) + 3,
      label: `v1.${Math.floor(i/10)}.${i % 10} 릴리스`,
      description: '새로운 버전 배포'
    });
  }

  return events;
};

// TimelineChart 테스트 함수
function testTimelineChart() {
  const mockEvents = generateMockEvents();
  const today = new Date();
  
  console.log(`생성된 이벤트 수: ${mockEvents.length}`);
  
  // 루트 엘리먼트 생성
  const rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
  
  const root = createRoot(rootElement);
  
  // 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 
        'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    
    #root {
      max-width: 1200px;
      margin: 0 auto;
    }
  `;
  document.head.appendChild(style);
  
  // 컴포넌트 렌더링
  root.render(
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>타임라인 차트 테스트</h1>
      
      <TimelineChart
        title="개발 활동 타임라인"
        description="최근 30일간의 개발 활동 기록"
        events={mockEvents}
        height={400}
        referenceDate={subDays(today, 10).toISOString()}
      />
      
      <TimelineChart
        title="커밋 및 PR 활동"
        description="커밋과 PR 활동만 필터링된 타임라인"
        events={mockEvents.filter(e => e.type === 'commit' || e.type === 'pr')}
        height={300}
        showLegend={false}
      />
    </div>
  );
}

// 테스트 실행
testTimelineChart(); 