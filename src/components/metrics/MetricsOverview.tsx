/**
 * 메트릭 개요 컴포넌트
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function MetricsOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">메트릭 대시보드</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>개발자 활동</CardTitle>
            <CardDescription>개발자별 활동 지표</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">메트릭 개요 화면은 현재 개발 중입니다.</p>
            <p className="text-sm text-muted-foreground mt-2">트렌드 분석 탭에서 트렌드 분석 기능을 사용해보세요.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>저장소 활동</CardTitle>
            <CardDescription>저장소별 활동 지표</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">메트릭 개요 화면은 현재 개발 중입니다.</p>
            <p className="text-sm text-muted-foreground mt-2">트렌드 분석 탭에서 트렌드 분석 기능을 사용해보세요.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>팀 성과</CardTitle>
            <CardDescription>팀별 성과 지표</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">메트릭 개요 화면은 현재 개발 중입니다.</p>
            <p className="text-sm text-muted-foreground mt-2">트렌드 분석 탭에서 트렌드 분석 기능을 사용해보세요.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 