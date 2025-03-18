import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

interface Team {
  id: string;
  name: string;
  memberCount: number;
  description?: string;
}

interface TeamListProps {
  onSelectTeam: (teamId: string, teamName: string) => void;
  selectedTeamId?: string;
  teams?: Team[];
  isLoading?: boolean;
  error?: string | null;
}

export function TeamList({ 
  onSelectTeam, 
  selectedTeamId,
  teams: externalTeams,
  isLoading: externalLoading,
  error: externalError
}: TeamListProps) {
  // 내부 상태나 외부에서 전달된 상태를 사용
  const teams = externalTeams || [];
  const isLoading = externalLoading !== undefined ? externalLoading : false;
  const error = externalError || null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>팀 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>팀 목록</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="space-y-2">
          {!teams || teams.length === 0 ? (
            <p className="text-muted-foreground">등록된 팀이 없습니다.</p>
          ) : (
            Array.isArray(teams) && teams.map((team) => (
              <div 
                key={team.id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-accent/50 ${
                  selectedTeamId === team.id ? 'bg-accent' : ''
                }`}
                onClick={() => onSelectTeam(team.id, team.name)}
              >
                <div>
                  <p className="font-medium">{team.name}</p>
                  {team.description && (
                    <p className="text-sm text-muted-foreground">{team.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    구성원 {team.memberCount}명
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTeam(team.id, team.name);
                    }}
                  >
                    보기
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 