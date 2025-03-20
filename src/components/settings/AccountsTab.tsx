import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccounts } from "@/hooks/useAccounts";
import { AccountDialog, AccountFormData } from "./AccountDialog";
import { RepositoryDialog, RepositoryFormData } from "./RepositoryDialog";
import { Account, Repository, AccountType } from "@/types/settings";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGitHubSettings } from "../../hooks/useSettings";
import { ScrollArea } from "../ui/scroll-area";

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

  // 계정 저장 핸들러
  const handleSaveAccount = async (accountData: AccountFormData) => {
    try {
      let success = false;
      
      if (currentAccount) {
        // 계정 업데이트
        // 타입 변환 처리
        success = await updateAccount(currentAccount.id, {
          ...accountData,
          type: accountData.type as AccountType
        });
        if (success) {
          toast.success("계정이 업데이트되었습니다.");
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
    if (confirm(`계정 "${account.name}"을(를) 삭제하시겠습니까?`)) {
      try {
        const success = await deleteAccount(account.id);
        if (success) {
          toast.success("계정이 삭제되었습니다.");
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
    return settings.repositories.filter(repo => accountIds.includes(repo.accountId));
  };

  // 계정 ID로 계정 정보 가져오기
  const getAccountById = (accountId: string) => {
    return settings?.accounts.find(account => account.id === accountId);
  };

  // GitHub 설정에서 계정 및 저장소 로드
  useEffect(() => {
    console.log('[DEBUG] AccountsTab - githubSettings 변경됨:', githubSettings);
    if (githubSettings) {
      if (githubSettings.domains) {
        // 도메인 정보 로드
        console.log('[DEBUG] AccountsTab - 도메인 정보 로드됨:', githubSettings.domains);
      }
    }
  }, [githubSettings]);

  // useAccounts hook의 결과 로깅
  useEffect(() => {
    console.log('[DEBUG] AccountsTab - settings 변경됨:', settings);
    console.log('[DEBUG] AccountsTab - loading 상태:', loading);
    console.log('[DEBUG] AccountsTab - error 상태:', error);
  }, [settings, loading, error]);

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
                          <h3 className="font-medium text-lg">{account.name}</h3>
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
                        {account.company && (
                          <div><span className="font-medium">회사/조직:</span> {account.company}</div>
                        )}
                        {account.email && (
                          <div><span className="font-medium">이메일:</span> {account.email}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  등록된 {getAccountTypeName(activeTab)} 계정이 없습니다.
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
            </CardHeader>
            <CardContent>
              {filteredRepositories.length > 0 ? (
                <div className="space-y-4">
                  {filteredRepositories.map(repository => {
                    const account = getAccountById(repository.accountId);
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
                                  {account.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
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
        accounts={settings.accounts}
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