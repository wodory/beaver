/**
 * 메트릭 대시보드 페이지
 */
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MetricsOverview } from '../../components/metrics/MetricsOverview';
import { TrendAnalysisView } from '../../components/metrics/TrendAnalysisView';
import { LineChart, TrendingUp } from 'lucide-react';

export default function MetricsPage() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="overview">
            <LineChart className="mr-2 h-4 w-4" />
            메트릭 대시보드
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="mr-2 h-4 w-4" />
            트렌드 분석
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <MetricsOverview />
        </TabsContent>
        
        <TabsContent value="trends" className="mt-0">
          <TrendAnalysisView />
        </TabsContent>
      </Tabs>
    </div>
  );
} 