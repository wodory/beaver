import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  PlusCircle, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Database,
  AlertTriangle,
  History
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SyncHistoryDialog } from './SyncHistoryDialog';

export function RepositoriesManagement() {
  const {
    repositories,
    isRepositoriesLoading,
    repositoriesError,
    isSyncing,
    syncProgress,
    syncError,
    loadRepositories,
    loadRepositoryStatus,
    addRepository,
    removeRepository,
    toggleRepositoryActive,
    syncRepository,
    syncAllRepositories
  } = useAdminStore();

  const [newRepoUrl, setNewRepoUrl] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [deleteRepo, setDeleteRepo] = useState<string | null>(null);
  const [syncHistoryRepo, setSyncHistoryRepo] = useState<{ id: string, name: string } | null>(null);

  // 컴포넌트 마운트 시 저장소 목록 로드
  useEffect(() => {
    loadRepositories();
    
    // 주기적으로 상태 확인 (30초마다)
    const interval = setInterval(() => {
      if (!isSyncing) {
        loadRepositoryStatus();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadRepositories, loadRepositoryStatus, isSyncing]);

  const handleAddRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRepository(newRepoUrl);
    if (!repositoriesError) {
      setNewRepoUrl('');
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteRepository = async (id: string) => {
    await removeRepository(id);
    setDeleteRepo(null);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await toggleRepositoryActive(id, isActive);
  };

  const handleSync = async (id: string) => {
    await syncRepository(id);
  };
  
  const handleSyncAll = async () => {
    await syncAllRepositories();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '없음';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch (e) {
      return '유효하지 않은 날짜';
    }
  };
  
  // 데이터 상태에 따른 뱃지 렌더링
  const renderDataStatusBadge = (repo: any) => {
    if (!repo.hasData) {
      return (
        <Badge variant="destructive" className="ml-2">
          <AlertTriangle className="h-3 w-3 mr-1" />
          데이터 없음
        </Badge>
      );
    } else if (repo.dataStats && (repo.dataStats.commitCount === 0 || repo.dataStats.prCount === 0)) {
      return (
        <Badge variant="outline" className="ml-2">
          <AlertCircle className="h-3 w-3 mr-1" />
          일부 데이터 누락
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="ml-2 bg-green-50">
          <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
          데이터 수집됨
        </Badge>
      );
    }
  };

  const openSyncHistory = (repo: any) => {
    setSyncHistoryRepo({ id: repo.id, name: repo.fullName });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">저장소 관리</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSyncAll} disabled={isSyncing || repositories.length === 0}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            모든 저장소 동기화
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                새 저장소 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>GitHub 저장소 추가</DialogTitle>
                <DialogDescription>
                  추가할 GitHub 저장소의 URL을 입력하세요. 저장소를 추가하면 초기 동기화가 자동으로 시작됩니다.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddRepository}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="repo-url">GitHub 저장소 URL</Label>
                    <Input
                      id="repo-url"
                      value={newRepoUrl}
                      onChange={(e) => setNewRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="w-full"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      예: https://github.com/username/repository 또는 git@github.com:username/repository
                    </p>
                  </div>
                  {repositoriesError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>오류</AlertTitle>
                      <AlertDescription>{repositoriesError}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">취소</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isRepositoriesLoading}>
                    {isRepositoriesLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                    저장소 추가
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={Boolean(deleteRepo)} onOpenChange={(open) => !open && setDeleteRepo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>저장소 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 이 저장소를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 해당 저장소의 모든 메트릭 데이터가 손실될 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteRepo && handleDeleteRepository(deleteRepo)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SyncHistoryDialog 
        open={Boolean(syncHistoryRepo)} 
        onOpenChange={(open) => !open && setSyncHistoryRepo(null)}
        repositoryId={syncHistoryRepo?.id || null}
        repositoryName={syncHistoryRepo?.name}
      />

      {isRepositoriesLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>저장소 목록 불러오는 중...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : repositoriesError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{repositoriesError}</AlertDescription>
        </Alert>
      ) : repositories.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>등록된 저장소 없음</CardTitle>
            <CardDescription>
              아직 등록된 저장소가 없습니다. "새 저장소 추가" 버튼을 클릭하여 GitHub 저장소를 추가하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              저장소 추가하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>등록된 저장소 ({repositories.length}개)</CardTitle>
            <CardDescription>
              시스템에 등록된 저장소 목록입니다. 활성화 상태를 변경하거나 삭제할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>저장소</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>데이터</TableHead>
                  <TableHead>마지막 동기화</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repositories.map((repo) => (
                  <TableRow key={repo.id}>
                    <TableCell>
                      <div className="font-medium">{repo.fullName}</div>
                      <div className="text-sm text-muted-foreground">{repo.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <code>{repo.cloneUrl}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={repo.isActive}
                          onCheckedChange={(checked) => handleToggleActive(repo.id, checked)}
                        />
                        <span>{repo.isActive ? '활성' : '비활성'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderDataStatusBadge(repo)}
                      {repo.dataStats && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-xs text-muted-foreground mt-1 cursor-help">
                              <Database className="h-3 w-3 inline mr-1" />
                              커밋: {repo.dataStats.commitCount}, PR: {repo.dataStats.prCount}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>커밋 수: {repo.dataStats.commitCount}개</p>
                            <p>PR 수: {repo.dataStats.prCount}개</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(repo.lastSyncAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSyncHistory(repo)}
                        >
                          <History className="h-4 w-4 mr-2" />
                          이력
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(repo.id)}
                          disabled={isSyncing}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                          동기화
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(repo.cloneUrl.replace('.git', ''), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteRepo(repo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {isSyncing && (
            <CardFooter className="border-t pt-4">
              <div className="w-full space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">동기화 진행 중...</span>
                  <span className="text-sm font-semibold">{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="w-full" />
              </div>
            </CardFooter>
          )}
          {syncError && (
            <CardFooter className="border-t pt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>동기화 오류</AlertTitle>
                <AlertDescription>{syncError}</AlertDescription>
              </Alert>
            </CardFooter>
          )}
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>참고 사항</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>저장소를 추가하면 초기 동기화 작업이 시작됩니다. 저장소 크기에 따라 몇 분에서 몇 시간까지 소요될 수 있습니다.</li>
            <li>비활성화된 저장소는 자동 동기화에서 제외되지만, 기존 수집된 메트릭 데이터는 유지됩니다.</li>
            <li>저장소를 삭제하면 해당 저장소에 대한 모든 데이터가 시스템에서 제거됩니다.</li>
            <li>동기화 작업은 백그라운드에서 처리되며, 동기화 중에도 다른 기능을 사용할 수 있습니다.</li>
            <li><strong>모든 저장소 동기화</strong> 기능은 등록된 모든 저장소의 데이터를 일괄적으로 수집합니다. 다수의 저장소가 있는 경우 상당한 시간이 소요될 수 있습니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 