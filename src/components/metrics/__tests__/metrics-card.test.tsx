import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MetricsCard, MetricItem } from "../metrics-card";

// 목 차트 컴포넌트
const MockChartComponent = ({ data, color }: { data: any; color: string }) => (
  <div data-testid="mock-chart" style={{ color }}>
    차트 컴포넌트 (데이터 포인트: {data ? data.length : 0})
  </div>
);

// 테스트용 메트릭 데이터
const testMetrics: MetricItem[] = [
  {
    title: "테스트 메트릭 1",
    value: "값 1",
    subValue: "서브값 1",
    trend: {
      value: 10,
      direction: "up"
    },
    status: "Elite",
    color: "#10b981" // green-500
  },
  {
    title: "테스트 메트릭 2",
    value: "값 2",
    subValue: "서브값 2",
    trend: {
      value: 5,
      direction: "down"
    },
    status: "High",
    color: "#3b82f6" // blue-500
  }
];

describe("MetricsCard", () => {
  // 테스트 환경에서 필요한 DOM 요소 설정
  beforeEach(() => {
    // ShadCN Tooltip이 제대로 작동하기 위한 Portal 요소 추가
    const portalRoot = document.createElement('div')
    portalRoot.setAttribute('id', 'portal-root')
    document.body.appendChild(portalRoot)
  });

  afterEach(() => {
    // 테스트 후 Portal 요소 정리
    const portalRoot = document.getElementById('portal-root')
    if (portalRoot) {
      document.body.removeChild(portalRoot)
    }
  });

  it("메트릭 카드가 제대로 렌더링되어야 함", () => {
    render(
      <MetricsCard
        title="테스트 타이틀"
        subtitle="테스트 서브타이틀"
        metrics={testMetrics}
        activeMetricIndex={0}
        onMetricClick={() => {}}
        chartComponent={MockChartComponent}
      />
    );

    // 타이틀과 서브타이틀 확인
    expect(screen.getByText("테스트 타이틀")).toBeInTheDocument();
    expect(screen.getByText("테스트 서브타이틀")).toBeInTheDocument();

    // 메트릭 항목들 확인
    expect(screen.getByText("테스트 메트릭 1")).toBeInTheDocument();
    expect(screen.getByText("테스트 메트릭 2")).toBeInTheDocument();
    expect(screen.getByText("값 1")).toBeInTheDocument();
    expect(screen.getByText("값 2")).toBeInTheDocument();

    // 차트 컴포넌트 확인
    expect(screen.getByTestId("mock-chart")).toBeInTheDocument();
  });

  it("메트릭 클릭 이벤트가 제대로 호출되어야 함", () => {
    const handleClick = vi.fn();
    
    render(
      <MetricsCard
        title="테스트 타이틀"
        metrics={testMetrics}
        activeMetricIndex={0}
        onMetricClick={handleClick}
        chartComponent={MockChartComponent}
      />
    );

    // 두 번째 메트릭 클릭
    fireEvent.click(screen.getByText("테스트 메트릭 2"));
    
    // 클릭 핸들러가 index 1로 호출되었는지 확인
    expect(handleClick).toHaveBeenCalledWith(1);
  });

  it("활성화된 메트릭에 따라 차트가 변경되어야 함", () => {
    const { rerender } = render(
      <MetricsCard
        title="테스트 타이틀"
        metrics={testMetrics}
        activeMetricIndex={0}
        onMetricClick={() => {}}
        chartComponent={MockChartComponent}
      />
    );

    // 첫 번째 메트릭의 색상 스타일 확인
    const chart = screen.getByTestId("mock-chart");
    expect(chart).toHaveStyle({ color: "#10b981" });

    // 활성화된 메트릭 변경
    rerender(
      <MetricsCard
        title="테스트 타이틀"
        metrics={testMetrics}
        activeMetricIndex={1}
        onMetricClick={() => {}}
        chartComponent={MockChartComponent}
      />
    );

    // 두 번째 메트릭의 색상 스타일 확인
    expect(chart).toHaveStyle({ color: "#3b82f6" });
  });
}); 