import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, RefreshCw, ExternalLink, Database, Loader2, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccounts } from "@/hooks/useAccounts";
import { AccountDialog, AccountFormData } from "./AccountDialog";
import { RepositoryDialog, RepositoryFormData } from "./RepositoryDialog";
import { Account, Repository, AccountType } from "@/types/settings";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGitHubSettings } from "../../hooks/useSettings";
import { ScrollArea } from "../ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// 저장소 데이터 상태 인터페이스
interface RepositoryDataState {
  [key: string]: {
    loading: boolean;
    hasData: boolean;
  }
}

export function AccountsTab() {
  const {
    settings,
    loading,
    error,
    loadSettings,
    addAccount,
    updateAccount,
    deleteAccount,
    addRepository,
    updateRepository,
    deleteRepository,
    getAccountsByType
  } = useAccounts();

  const { 
    settings: githubSettings, 
    loading: githubLoading, 
    updateSettings: updateGitHubSettings 
  } = useGitHubSettings();

  const [activeTab, setActiveTab] = useState<AccountType>("github");
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showRepositoryDialog, setShowRepositoryDialog] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | undefined>(undefined);
  const [currentRepository, setCurrentRepository] = useState<Repository | undefined>(undefined);

  // 저장소 데이터 상태 관리
  const [repoDataState, setRepoDataState] = useState<RepositoryDataState>({});
  const [loadingWithoutData, setLoadingWithoutData] = useState(false);

  // 계정 저장 핸들러
  const handleSaveAccount = async (accountData: AccountFormData) => {
    try {
      let success = false;
      
      if (currentAccount) {
        // 계정 업데이트
        // 타입 변환 처리
        success = await updateAccount(
          currentAccount.id, 
          currentAccount.type as AccountType,
          {
            ...accountData,
            type: accountData.type as AccountType
          }
        );
        if (success) {
          toast.success("계정이 업데이트되었습니다.");
          // 설정 다시 로드하여 UI 갱신
          await loadSettings();
        }
      } else {
        // 새 계정 추가
        // 타입 변환 처리
        success = await addAccount({
          ...accountData,
          type: accountData.type as AccountType
        });
        if (success) {
          toast.success("새 계정이 추가되었습니다.");
          // 설정 다시 로드하여 UI 갱신
          await loadSettings();
        }
      }
      
      if (!success) {
        toast.error("계정 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("계정 저장 오류:", error);
      toast.error("계정 저장 중 오류가 발생했습니다.");
    }
  };

  // 계정 삭제 핸들러
  const handleDeleteAccount = async (account: Account) => {
    if (confirm(`계정 "${account.username}"을(를) 삭제하시겠습니까?`)) {
      try {
        const success = await deleteAccount(account.id, account.type);
        if (success) {
          toast.success("계정이 삭제되었습니다.");
          // 설정 다시 로드하여 UI 갱신
          await loadSettings();
        } else {
          toast.error("계정 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("계정 삭제 오류:", error);
        toast.error("계정 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 저장소 저장 핸들러
  const handleSaveRepository = async (repoData: RepositoryFormData) => {
    try {
      let success = false;
      
      if (currentRepository) {
        // 저장소 업데이트
        // ID 타입 변환 처리
        success = await updateRepository(currentRepository.id, {
          ...repoData,
          type: repoData.type as AccountType,
          id: repoData.id ? parseInt(repoData.id) : undefined
        });
        if (success) {
          toast.success("저장소가 업데이트되었습니다.");
          // 설정 다시 로드하여 UI 갱신
          await loadSettings();
        }
      } else {
        // 새 저장소 추가
        // 타입 변환 처리
        success = await addRepository({
          ...repoData,
          type: repoData.type as AccountType
        });
        if (success) {
          toast.success("새 저장소가 추가되었습니다.");
          // 설정 다시 로드하여 UI 갱신
          await loadSettings();
        }
      }
      
      if (!success) {
        toast.error("저장소 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장소 저장 오류:", error);
      toast.error("저장소 저장 중 오류가 발생했습니다.");
    }
  };

  // 저장소 삭제 핸들러
  const handleDeleteRepository = async (repository: Repository) => {
    if (confirm(`저장소 "${repository.fullName}"을(를) 삭제하시겠습니까?`)) {
      try {
        const success = await deleteRepository(repository.id);
        if (success) {
          toast.success("저장소가 삭제되었습니다.");
          // 설정 다시 로드하여 UI 갱신
          await loadSettings();
        } else {
          toast.error("저장소 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("저장소 삭제 오류:", error);
        toast.error("저장소 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 계정 유형별 저장소 필터링
  const getRepositoriesByType = (type: AccountType) => {
    if (!settings?.repositories) return [];
    
    // 해당 유형의 계정 ID 목록
    const accountIds = settings.accounts
      .filter(account => account.type === type)
      .map(account => account.id);
    
    // 해당 계정에 연결된 저장소만 필터링
    return settings.repositories.filter(repo => 
      accountIds.includes(repo.owner) && repo.type === type
    );
  };

  // 계정 ID와 타입으로 계정 정보 가져오기
  const getAccountById = (accountId: string, accountType?: AccountType) => {
    if (accountType) {
      // ID와 타입으로 복합 키 검색
      return settings?.accounts.find(account => account.id === accountId && account.type === accountType);
    } else {
      // 하위 호환성을 위해 ID만으로도 검색 가능하게 유지
      return settings?.accounts.find(account => account.id === accountId);
    }
  };

  // GitHub 설정에서 계정 및 저장소 로드
  useEffect(() => {
    console.log('[DEBUG] AccountsTab - githubSettings 변경됨:', githubSettings);
    // 주석 처리: domains 속성이 GitHubSettings 타입에 없음
    // if (githubSettings) {
    //   if (githubSettings.domains) {
    //     // 도메인 정보 로드
    //     console.log('[DEBUG] AccountsTab - 도메인 정보 로드됨:', githubSettings.domains);
    //   }
    // }
  }, [githubSettings]);

  // useAccounts hook의 결과 로깅
  useEffect(() => {
    console.log('[DEBUG] AccountsTab - settings 변경됨:', settings);
    console.log('[DEBUG] AccountsTab - loading 상태:', loading);
    console.log('[DEBUG] AccountsTab - error 상태:', error);
  }, [settings, loading, error]);

  // 데이터가 없는 저장소 목록 조회
  const loadRepositoriesWithoutData = async () => {
    try {
      setLoadingWithoutData(true);
      console.log('[DEBUG] 데이터가 없는 저장소 조회 요청 시작');
      
      const response = await fetch('/api/settings/repositories/without-data');
      console.log('[DEBUG] 응답 상태:', response.status, response.statusText);
      
      // 응답이 성공적이지 않은 경우 오류 처리
      if (!response.ok) {
        // 오류 응답 내용 확인 시도
        const errorText = await response.text();
        console.error(`API 응답 오류(${response.status}):`, errorText);
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }
      
      // 응답 타입 확인 (Content-Type: application/json)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const bodyText = await response.text();
        console.error('잘못된 응답 형식:', contentType, '\n응답 본문:', bodyText);
        throw new Error('API가 JSON 형식으로 응답하지 않았습니다: ' + contentType);
      }
      
      const data = await response.json();
      console.log('[DEBUG] 데이터가 없는 저장소 응답:', data);
      
      if (data.success && data.repositories) {
        const newState: RepositoryDataState = {};
        
        // 모든 저장소는 기본적으로 데이터를 가지고 있다고 가정
        if (settings?.repositories) {
          settings.repositories.forEach(repo => {
            newState[repo.id] = { loading: false, hasData: true };
          });
        }
        
        // 데이터가 없는 저장소 상태 업데이트
        data.repositories.forEach((repo: any) => {
          newState[repo.id] = { loading: false, hasData: false };
        });
        
        setRepoDataState(newState);
      } else {
        console.warn('API 응답에 예상된 데이터가 없습니다:', data);
        toast.warning('저장소 데이터 상태를 조회할 수 없습니다.');
      }
    } catch (error) {
      console.error('데이터가 없는 저장소 목록 조회 중 오류 발생:', error);
      toast.error('저장소 데이터 조회 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoadingWithoutData(false);
    }
  };

  // 저장소 데이터 동기화 요청
  const syncRepositoryData = async (repoId: string) => {
    try {
      // 로딩 상태 설정
      setRepoDataState(prev => ({
        ...prev,
        [repoId]: { ...prev[repoId], loading: true }
      }));
      
      const response = await fetch(`/api/settings/repositories/${repoId}/sync`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'started') {
        toast.success(`저장소 데이터 수집이 시작되었습니다.`);
      } else {
        toast.error(`저장소 데이터 수집 요청 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('저장소 데이터 동기화 요청 중 오류 발생:', error);
      toast.error('저장소 데이터 동기화 요청 중 오류가 발생했습니다.');
    } finally {
      // 로딩 상태 해제
      setTimeout(() => {
        setRepoDataState(prev => ({
          ...prev,
          [repoId]: { ...prev[repoId], loading: false }
        }));
      }, 2000);
    }
  };

  // 데이터가 없는 모든 저장소 동기화 요청
  const syncAllRepositoriesWithoutData = async () => {
    try {
      setLoadingWithoutData(true);
      console.log('[DEBUG] 데이터가 없는 모든 저장소 동기화 요청 시작', { activeTab });
      
      // GET 방식으로 변경하고 쿼리 파라미터로 서비스 타입 전달
      const response = await fetch(`/api/settings/repositories/sync-all-without-data?serviceType=${activeTab}`);
      
      console.log('[DEBUG] 응답 상태:', response.status, response.statusText);
      
      // 응답이 성공적이지 않은 경우 오류 처리
      if (!response.ok) {
        // 오류 응답 내용 확인 시도
        const errorText = await response.text();
        console.error(`API 응답 오류(${response.status}):`, errorText);
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }
      
      // 응답 타입 확인 (Content-Type: application/json)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const bodyText = await response.text();
        console.error('잘못된 응답 형식:', contentType, '\n응답 본문:', bodyText);
        throw new Error('API가 JSON 형식으로 응답하지 않았습니다: ' + contentType);
      }
      
      const data = await response.json();
      console.log('[DEBUG] 데이터가 없는 모든 저장소 동기화 응답:', data);
      
      if (response.ok && data.status === 'started') {
        toast.success(`데이터가 없는 ${data.repositoryIds.length}개 저장소 데이터 수집이 시작되었습니다.`);
        
        // 동기화 중인 저장소 상태 업데이트
        const newState = { ...repoDataState };
        data.repositoryIds.forEach((repoId: string) => {
          newState[repoId] = { loading: true, hasData: false };
        });
        
        setRepoDataState(newState);
        
        // 5초 후에 상태 업데이트 (로딩 표시 해제)
        setTimeout(() => {
          loadRepositoriesWithoutData();
        }, 5000);
        
      } else if (data.status === 'completed') {
        toast.info(data.message || '모든 저장소에 이미 데이터가 있습니다.');
      } else {
        console.warn('예상치 못한 API 응답:', data);
        toast.error(`저장소 데이터 수집 요청 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('데이터가 없는 저장소 동기화 요청 중 오류 발생:', error);
      toast.error('저장소 데이터 동기화 요청 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoadingWithoutData(false);
    }
  };

  // 설정이 변경될 때마다 데이터가 없는 저장소 목록 조회
  useEffect(() => {
    if (settings && settings.repositories && settings.repositories.length > 0) {
      loadRepositoriesWithoutData();
    }
  }, [settings]);

  if (loading) {
    console.log('[DEBUG] AccountsTab - 로딩 중 상태 표시');
    return <div className="py-4">계정 정보를 불러오는 중...</div>;
  }

  if (error) {
    console.log('[DEBUG] AccountsTab - 오류 상태 표시:', error);
    return (
      <div className="py-4 text-red-500">
        계정 정보를 불러오는 중 오류가 발생했습니다: {error.message}
      </div>
    );
  }

  if (!settings) {
    console.log('[DEBUG] AccountsTab - settings 없음 상태 표시');
    return <div className="py-4">계정 설정을 찾을 수 없습니다.</div>;
  }

  const filteredAccounts = getAccountsByType(activeTab);
  const filteredRepositories = getRepositoriesByType(activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">계정 관리</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button onClick={() => {
            setCurrentAccount(undefined);
            setShowAccountDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            새 계정 추가
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AccountType)}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="github_enterprise">GitHub Enterprise</TabsTrigger>
          <TabsTrigger value="jira">Jira</TabsTrigger>
          <TabsTrigger value="gitlab">GitLab</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 pt-4">
          {/* 계정 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>{getAccountTypeName(activeTab)} 계정</CardTitle>
              <CardDescription>
                {getAccountTypeDescription(activeTab)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAccounts.length > 0 ? (
                <div className="space-y-4">
                  {filteredAccounts.map(account => (
                    <div key={account.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{account.username}</h3>
                          <p className="text-sm text-muted-foreground">ID: {account.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setCurrentAccount(account);
                              setShowAccountDialog(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-1" /> 수정
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteAccount(account)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> 삭제
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div><span className="font-medium">URL:</span> {account.url}</div>
                        <div><span className="font-medium">API URL:</span> {account.apiUrl}</div>
                        <div><span className="font-medium">이메일:</span> {account.email}</div>
                        <div><span className="font-medium">회사:</span> {account.company}</div>
                        {account.org && (
                          <div><span className="font-medium">조직:</span> {account.org}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  등록된 {getAccountTypeName(activeTab)} 계정이 없습니다.
                  {activeTab === 'github_enterprise' && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => {
                          setCurrentAccount(undefined);
                          setShowAccountDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {getAccountTypeName(activeTab)} 계정 추가
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 저장소 목록 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{getAccountTypeName(activeTab)} 저장소</CardTitle>
                <CardDescription>
                  {getAccountTypeName(activeTab)}에 연결된 저장소 목록입니다.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={loadRepositoriesWithoutData}
                  disabled={loadingWithoutData}
                >
                  {loadingWithoutData ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  상태 확인
                </Button>
                <Button
                  variant="secondary"
                  onClick={syncAllRepositoriesWithoutData}
                  disabled={loadingWithoutData}
                >
                  {loadingWithoutData ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  데이터가 없는 모든 저장소 동기화
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentRepository(undefined);
                    setShowRepositoryDialog(true);
                  }}
                  disabled={filteredAccounts.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  저장소 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRepositories.length > 0 ? (
                <div className="space-y-4">
                  {filteredRepositories.map(repository => {
                    const account = getAccountById(repository.owner, repository.type);
                    const repoState = repoDataState[repository.id] || { loading: false, hasData: true };
                    
                    return (
                      <div key={repository.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{repository.fullName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground">
                                {repository.name}
                              </p>
                              {account && (
                                <Badge variant="outline" className="text-xs">
                                  {account.username}
                                </Badge>
                              )}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant={repoState.hasData ? "default" : "destructive"} 
                                      className="text-xs"
                                    >
                                      {repoState.hasData ? "데이터 있음" : "데이터 없음"}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {repoState.hasData 
                                      ? "이 저장소의 커밋, PR 데이터가 수집되어 있습니다."
                                      : "이 저장소의 데이터가 수집되지 않았습니다. 동기화 버튼을 클릭하여 데이터를 수집하세요."}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => syncRepositoryData(repository.id.toString())}
                              disabled={repoState.loading}
                            >
                              {repoState.loading ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Database className="h-4 w-4 mr-1" />
                              )}
                              {repoState.loading ? "동기화 중..." : "데이터 동기화"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setCurrentRepository(repository);
                                setShowRepositoryDialog(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-1" /> 수정
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteRepository(repository)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> 삭제
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <div><span className="font-medium">URL:</span> {repository.url}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {filteredAccounts.length === 0 
                    ? `먼저 ${getAccountTypeName(activeTab)} 계정을 추가하세요.` 
                    : `등록된 ${getAccountTypeName(activeTab)} 저장소가 없습니다.`}
                  {activeTab === 'github_enterprise' && filteredAccounts.length === 0 && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => {
                          setCurrentAccount(undefined);
                          setShowAccountDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {getAccountTypeName(activeTab)} 계정 추가
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 계정 다이얼로그 */}
      <AccountDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
        onSave={handleSaveAccount}
        initialData={currentAccount as AccountFormData}
        isEdit={!!currentAccount}
      />

      {/* 저장소 다이얼로그 */}
      <RepositoryDialog
        open={showRepositoryDialog}
        onOpenChange={setShowRepositoryDialog}
        onSave={handleSaveRepository}
        initialData={currentRepository ? {
          ...currentRepository,
          id: currentRepository.id.toString()
        } : undefined}
        isEdit={!!currentRepository}
        accounts={settings.accounts.filter(account => account.type === activeTab)}
      />
    </div>
  );
}

// 계정 유형별 이름 가져오기
function getAccountTypeName(type: AccountType): string {
  switch (type) {
    case 'github': return 'GitHub';
    case 'github_enterprise': return 'GitHub Enterprise';
    case 'jira': return 'Jira';
    case 'gitlab': return 'GitLab';
    default: return type;
  }
}

// 계정 유형별 설명 가져오기
function getAccountTypeDescription(type: AccountType): string {
  switch (type) {
    case 'github':
      return 'GitHub.com에 연결된 계정을 관리합니다.';
    case 'github_enterprise':
      return 'GitHub Enterprise 또는 사내 GitHub 서버에 연결된 계정을 관리합니다.';
    case 'jira':
      return 'Jira에 연결된 계정을 관리합니다.';
    case 'gitlab':
      return 'GitLab에 연결된 계정을 관리합니다.';
    default:
      return '';
  }
} 