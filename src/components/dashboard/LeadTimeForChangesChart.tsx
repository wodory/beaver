import React, { useMemo } from 'react';
import { useStore } from '@/store/dashboardStore';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LabelList,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { LeadTimeDataPoint } from '@/store/dashboardStore';

interface LeadTimeForChangesChartProps {
  multiRepoMode?: boolean;
  multiRepoData?: { [repo: string]: LeadTimeDataPoint[] };
  colorPalette?: string[];
}

const LeadTimeForChangesChart: React.FC<LeadTimeForChangesChartProps> = ({ 
  multiRepoMode = false, 
  multiRepoData = {},
  colorPalette = ['#007AFF', '#FF2D55', '#5AC8FA', '#FF9500', '#4CD964']
}) => {
  const { leadTimeData } = useStore();

  // 디버그 로깅 추가
  useMemo(() => {
    if (multiRepoMode) {
      console.log('LeadTimeForChangesChart - 다중 저장소 모드 데이터:', {
        저장소_수: Object.keys(multiRepoData).length,
        저장소_목록: Object.keys(multiRepoData),
        데이터_샘플: Object.entries(multiRepoData).map(([repo, data]) => ({
          repo,
          데이터개수: data.length,
          첫번째항목: data.length > 0 ? data[0] : '데이터 없음'
        }))
      });
    }
  }, [multiRepoMode, multiRepoData]);

  // 저장소별 평균값 계산 - 항상 호출되도록 수정
  const repoAverages = useMemo(() => {
    // multiRepoMode가 아니면 빈 객체 반환
    if (!multiRepoMode || Object.keys(multiRepoData).length === 0) {
      return {};
    }
    
    const result: Record<string, number> = {};
    
    Object.entries(multiRepoData).forEach(([repo, dataPoints]) => {
      // 데이터가 없어도 기본값 설정
      const repoName = repo.split('/')[1];
      if (dataPoints.length === 0) {
        result[repoName] = 0; // 빈 데이터인 경우 0으로 설정
        return;
      }
      
      const sum = dataPoints.reduce((acc, item) => acc + (item.leadTime || 0), 0);
      const avg = sum / dataPoints.length;
      result[repoName] = Number(avg.toFixed(1)); // 최소값 설정 제거
    });
    
    console.log('LeadTimeForChangesChart - 계산된 평균값:', result);
    return result;
  }, [multiRepoMode, multiRepoData]);
  
  // 바 차트용 데이터 포맷팅 - 빈 barData 방지
  const barData = useMemo(() => {
    if (!multiRepoMode || Object.keys(multiRepoData).length === 0) {
      return [];
    }
    
    // 데이터 정렬 (값이 큰 순서대로)
    const sortedEntries = Object.entries(repoAverages)
      .sort((a, b) => b[1] - a[1]); // 내림차순 정렬
    
    // 정렬된 데이터로 차트 데이터 생성
    return sortedEntries.map(([repoName, avg], index) => ({
      name: repoName,
      value: avg,
      fill: colorPalette[index % colorPalette.length]
    }));
  }, [multiRepoMode, repoAverages, colorPalette]);

  // 다중 저장소 모드일 때는 다른 데이터 처리
  if (multiRepoMode) {
    // 저장소별 데이터가 없는 경우
    if (Object.keys(multiRepoData).length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">저장소를 선택하세요.</p>
        </div>
      );
    }

    // 빈 barData 처리
    if (barData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">데이터가 없거나 모든 값이 0입니다.</p>
        </div>
      );
    }

    return (
      <div className="h-full">
        <p className="text-base font-medium mb-4 text-center">평균 리드 타임</p>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              stroke="hsl(var(--foreground))" 
              tick={{ fill: 'hsl(var(--foreground))' }}
              tickLine={false}
              axisLine={false}
              label={{ 
                value: '시간', 
                position: 'insideBottom',
                offset: -10,
                fill: 'hsl(var(--foreground))'
              }}
            />
            <YAxis 
              type="category"
              dataKey="name"
              stroke="hsl(var(--foreground))" 
              tick={{ fill: 'hsl(var(--foreground))' }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`${value} 시간`, '리드 타임']}
            />
            <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
            <Bar 
              dataKey="value" 
              name="평균 리드 타임" 
              radius={[0, 4, 4, 0]}
            >
              {
                barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))
              }
              <LabelList 
                dataKey="value" 
                position="right" 
                formatter={(value: number) => `${value}시간`}
                style={{ fill: 'hsl(var(--foreground))' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 단일 저장소 모드 (기존 코드)
  if (!leadTimeData || leadTimeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">데이터가 없습니다.</p>
      </div>
    );
  }

  // 평균값 계산
  const average = leadTimeData.reduce((sum, item) => sum + item.leadTime, 0) / leadTimeData.length;

  return (
    <div className="h-full">
      <p className="text-base font-medium mb-4 text-center">평균 리드 타임</p>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={[{ name: '평균 리드 타임', value: Number(average.toFixed(1)) }]}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--foreground))" 
            tick={{ fill: 'hsl(var(--foreground))' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--foreground))" 
            tick={{ fill: 'hsl(var(--foreground))' }}
            tickLine={false}
            axisLine={false}
            label={{ 
              value: '시간', 
              angle: -90, 
              position: 'insideLeft',
              fill: 'hsl(var(--foreground))'
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [`${value} 시간`, '리드 타임']}
          />
          <Bar 
            dataKey="value" 
            fill="hsl(var(--chart-0))" 
            name="평균 리드 타임"
            radius={[4, 4, 0, 0]}
          >
            <LabelList 
              dataKey="value" 
              position="top" 
              formatter={(value: number) => `${value}시간`}
              style={{ fill: 'hsl(var(--foreground))' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadTimeForChangesChart; 