import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SyncHistoryItem {
  id: number;
  repositoryId: number;
  startTime: string;
  endTime: string | null;
  status: 'running' | 'completed' | 'failed';
  commitCount: number;
  pullRequestCount: number;
  reviewCount: number;
  error: string | null;
  createdAt: string;
}

interface SyncHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositoryId: string | null;
  repositoryName?: string;
}

export function SyncHistoryDialog({ open, onOpenChange, repositoryId, repositoryName }: SyncHistoryDialogProps) {
  const [history, setHistory] = useState<SyncHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (open && repositoryId) {
      loadSyncHistory();
    }
  }, [open, repositoryId]);
  
  const loadSyncHistory = async () => {
    if (!repositoryId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/settings/repositories/${repositoryId}/sync-history`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '동기화 이력을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('동기화 이력 로드 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '없음';
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm:ss', { locale: ko });
    } catch (e) {
      return '유효하지 않은 날짜';
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <Badge variant="outline" className="bg-blue-50">
            <Clock className="h-3 w-3 mr-1 text-blue-600 animate-pulse" />
            진행 중
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
            완료됨
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            실패
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>동기화 이력 - {repositoryName || '저장소'}</DialogTitle>
          <DialogDescription>
            이 저장소의 데이터 동기화 작업 이력을 보여줍니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={loadSyncHistory} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            동기화 이력이 없습니다.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>시작 시간</TableHead>
                <TableHead>종료 시간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>수집된 데이터</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.startTime)}</TableCell>
                  <TableCell>{formatDate(item.endTime)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    {item.status === 'completed' ? (
                      <div className="space-y-1">
                        <div>커밋: {item.commitCount}개</div>
                        <div>PR: {item.pullRequestCount}개</div>
                        <div>리뷰: {item.reviewCount}개</div>
                      </div>
                    ) : item.status === 'failed' && item.error ? (
                      <div className="text-red-500 text-sm">
                        {item.error}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        데이터 없음
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
} 