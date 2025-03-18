import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertCircle, Save, Github, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from '../ui/separator';

export function SystemSettings() {
  const {
    githubToken,
    jiraConfig,
    isSettingsLoading,
    settingsError,
    loadSettings,
    saveGitHubToken,
    saveJiraConfig
  } = useAdminStore();

  const [gitHubTokenInput, setGitHubTokenInput] = useState('');
  const [jiraBaseUrl, setJiraBaseUrl] = useState('');
  const [jiraUsername, setJiraUsername] = useState('');
  const [jiraApiToken, setJiraApiToken] = useState('');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (jiraConfig) {
      setJiraBaseUrl(jiraConfig.baseUrl);
      setJiraUsername(jiraConfig.username);
      setJiraApiToken(''); // 보안상 실제 토큰은 표시하지 않고 빈 값으로 설정
    }
  }, [jiraConfig]);

  const handleSaveGitHubToken = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveGitHubToken(gitHubTokenInput);
    if (!settingsError) {
      setGitHubTokenInput('');
    }
  };

  const handleSaveJiraConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    // API 토큰이 빈 값이면 기존 값 유지 (마스킹된 값이므로)
    const config = {
      baseUrl: jiraBaseUrl,
      username: jiraUsername,
      ...(jiraApiToken ? { apiToken: jiraApiToken } : {})
    };
    await saveJiraConfig(config);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">시스템 설정</h2>
      </div>

      <Tabs defaultValue="github" className="space-y-4">
        <TabsList>
          <TabsTrigger value="github">GitHub 설정</TabsTrigger>
          <TabsTrigger value="jira">JIRA 설정</TabsTrigger>
        </TabsList>
        
        <TabsContent value="github" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Github className="h-5 w-5 mr-2" />
                GitHub 액세스 토큰 설정
              </CardTitle>
              <CardDescription>
                GitHub API를 사용하기 위한 개인 액세스 토큰을 설정하세요. 
                이 토큰은 GitHub 저장소에 접근하는 데 사용됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSettingsLoading ? (
                <div className="flex items-center justify-center h-24">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {githubToken ? (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">현재 토큰 상태:</span>
                          {githubToken.isValid ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span>유효함</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <XCircle className="h-4 w-4 mr-1" />
                              <span>유효하지 않음</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">토큰:</span>
                            <div className="font-mono mt-1">{githubToken.token}</div>
                          </div>
                          {githubToken.scope && (
                            <div>
                              <span className="text-muted-foreground">권한 범위:</span>
                              <div className="mt-1">{githubToken.scope}</div>
                            </div>
                          )}
                          {githubToken.createdAt && (
                            <div>
                              <span className="text-muted-foreground">생성일:</span>
                              <div className="mt-1">{new Date(githubToken.createdAt).toLocaleDateString()}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>GitHub 토큰 미설정</AlertTitle>
                      <AlertDescription>
                        GitHub API를 사용하기 위한 토큰이 설정되지 않았습니다. 아래 양식을 사용하여 토큰을 설정하세요.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSaveGitHubToken}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="github-token">새 GitHub 토큰</Label>
                        <Input
                          id="github-token"
                          type="password"
                          placeholder="ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                          value={gitHubTokenInput}
                          onChange={(e) => setGitHubTokenInput(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          GitHub에서 "repo" 권한을 가진 개인 액세스 토큰을 생성하여 입력하세요.
                          <a 
                            href="https://github.com/settings/tokens" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline ml-1"
                          >
                            토큰 생성 방법 보기
                          </a>
                        </p>
                      </div>
                      
                      {settingsError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>오류</AlertTitle>
                          <AlertDescription>{settingsError}</AlertDescription>
                        </Alert>
                      )}
                      
                      <Button type="submit" className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        GitHub 토큰 저장
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="jira" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JIRA 연동 설정</CardTitle>
              <CardDescription>
                JIRA와 연동하기 위한 설정을 구성하세요. 
                JIRA API를 통해 이슈 데이터를 수집하고 팀 활동 지표를 보완합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSettingsLoading ? (
                <div className="flex items-center justify-center h-24">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {jiraConfig && jiraConfig.isConfigured ? (
                    <div className="p-4 border rounded-md mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">현재 JIRA 연동 상태:</span>
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>구성됨</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">JIRA URL:</span>
                          <div className="mt-1">{jiraConfig.baseUrl}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">사용자명:</span>
                          <div className="mt-1">{jiraConfig.username}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>JIRA 설정 미구성</AlertTitle>
                      <AlertDescription>
                        JIRA 연동이 구성되지 않았습니다. 아래 양식을 사용하여 JIRA 연동을 설정하세요.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSaveJiraConfig}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="jira-url">JIRA URL</Label>
                        <Input
                          id="jira-url"
                          placeholder="https://your-domain.atlassian.net"
                          value={jiraBaseUrl}
                          onChange={(e) => setJiraBaseUrl(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="jira-username">사용자 이메일</Label>
                        <Input
                          id="jira-username"
                          placeholder="your-email@example.com"
                          value={jiraUsername}
                          onChange={(e) => setJiraUsername(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="jira-token">API 토큰</Label>
                        <Input
                          id="jira-token"
                          type="password"
                          placeholder={jiraConfig?.isConfigured ? "•••••••••••••••••" : "API 토큰 입력"}
                          value={jiraApiToken}
                          onChange={(e) => setJiraApiToken(e.target.value)}
                          required={!jiraConfig?.isConfigured}
                        />
                        <p className="text-xs text-muted-foreground">
                          JIRA API 토큰은 JIRA 계정 설정에서 생성할 수 있습니다.
                          <a 
                            href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline ml-1"
                          >
                            토큰 생성 방법 보기
                          </a>
                        </p>
                      </div>
                      
                      {settingsError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>오류</AlertTitle>
                          <AlertDescription>{settingsError}</AlertDescription>
                        </Alert>
                      )}
                      
                      <Button type="submit" className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        JIRA 설정 저장
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 