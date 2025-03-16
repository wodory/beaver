import React from 'react';
import { useStore } from '@/store/dashboardStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type EventType = 'deployment' | 'incident' | 'recovery';

interface Event {
  id: string;
  type: EventType;
  timestamp: string;
  description: string;
  repository: string;
}

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'deployment':
      return '🚀';
    case 'incident':
      return '⚠️';
    case 'recovery':
      return '🔄';
    default:
      return '📝';
  }
};

const getEventColor = (type: EventType) => {
  switch (type) {
    case 'deployment':
      return 'text-blue-500 dark:text-blue-400';
    case 'incident':
      return 'text-red-500 dark:text-red-400';
    case 'recovery':
      return 'text-green-500 dark:text-green-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
};

const EventItem: React.FC<{ event: Event }> = ({ event }) => {
  const formattedDate = format(new Date(event.timestamp), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
  const eventIcon = getEventIcon(event.type);
  const eventColor = getEventColor(event.type);

  return (
    <div className="mb-4">
      <div className="flex items-start">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-3 ${eventColor}`}>
          <span className="text-lg">{eventIcon}</span>
        </div>
        <div className="flex-1">
          <div className="font-medium">{event.description}</div>
          <div className="text-sm text-muted-foreground">
            {formattedDate} • {event.repository}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventTimeline: React.FC = () => {
  const { events } = useStore();

  // 이벤트를 날짜 기준으로 내림차순 정렬
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>이벤트 타임라인</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                <EventItem event={event} />
                {index < sortedEvents.length - 1 && <Separator className="my-2" />}
              </React.Fragment>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              선택한 기간에 기록된 이벤트가 없습니다.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventTimeline; 