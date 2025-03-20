import { useState, useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserSettings, useGitHubSettings, useJiraSettings } from "../../hooks/useSettings"
import { toast } from "sonner"

export function SettingsPage() {
  // 사용자 설정 훅 사용
  const {
    settings: userSettings,
    loading: userLoading,
    error: userError,
    updateSettings: updateUserSettings
  } = useUserSettings();

  // GitHub 설정 훅 사용
  const {
    settings: githubSettings,
    loading: githubLoading,
    error: githubError,
    updateSettings: updateGitHubSettings
  } = useGitHubSettings();

  // Jira 설정 훅 사용
  const {
    settings: jiraSettings,
    loading: jiraLoading,
    error: jiraError,
    updateSettings: updateJiraSettings
  } = useJiraSettings();

  // GitHub 저장소 상태 관리
  const [repositoriesText, setRepositoriesText] = useState(() => {
    return githubSettings?.repositories?.join('\n') || '';
  });

  // 저장소 목록 변경 시 텍스트 업데이트
  useEffect(() => {
    if (githubSettings && githubSettings.repositories) {
      setRepositoriesText(githubSettings.repositories.join('\n'));
    }
  }, [githubSettings]);

  // 사용자 설정 저장 핸들러
  const handleSaveUserSettings = useCallback(async () => {
    if (!userSettings) return;
    
    const success = await updateUserSettings(userSettings);
    if (success) {
      toast.success("설정이 저장되었습니다.");
    } else {
      toast.error("설정 저장에 실패했습니다.");
    }
  }, [userSettings, updateUserSettings]);

  // GitHub 설정 저장 핸들러
  const handleSaveGitHubSettings = useCallback(async () => {
    if (!githubSettings) return;
    
    // 저장소 텍스트를 배열로 변환
    const repositories = repositoriesText
      .split('\n')
      .map(repo => repo.trim())
      .filter(Boolean);

    const success = await updateGitHubSettings({
      ...githubSettings,
      repositories
    });

    if (success) {
      toast.success("GitHub 설정이 저장되었습니다.");
    } else {
      toast.error("GitHub 설정 저장에 실패했습니다.");
    }
  }, [githubSettings, repositoriesText, updateGitHubSettings]);

  // Jira 설정 저장 핸들러
  const handleSaveJiraSettings = useCallback(async () => {
    if (!jiraSettings) return;
    
    const success = await updateJiraSettings(jiraSettings);
    if (success) {
      toast.success("Jira 설정이 저장되었습니다.");
    } else {
      toast.error("Jira 설정 저장에 실패했습니다.");
    }
  }, [jiraSettings, updateJiraSettings]);

  // 데이터 로딩 표시
  if (userLoading || githubLoading || jiraLoading) {
    return <div className="p-4">설정을 불러오는 중...</div>;
  }

  // 오류 표시
  if (userError || githubError || jiraError) {
    return (
      <div className="p-4 text-red-500">
        설정을 불러오는 중 오류가 발생했습니다.
        {userError && <p>{userError.message}</p>}
        {githubError && <p>{githubError.message}</p>}
        {jiraError && <p>{jiraError.message}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">설정 및 관리</h1>
        <p className="text-muted-foreground">
          애플리케이션 설정을 관리하고 사용자 정보를 업데이트합니다.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">일반</TabsTrigger>
          <TabsTrigger value="account">계정</TabsTrigger>
          <TabsTrigger value="github">GitHub 연동</TabsTrigger>
          <TabsTrigger value="jira">Jira 연동</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>일반 설정</CardTitle>
              <CardDescription>
                애플리케이션의 기본 동작 방식을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!userSettings ? (
                <div>설정 정보를 불러올 수 없습니다.</div>
              ) : (
                <>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="notifications" className="flex flex-col space-y-1">
                      <span>알림</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        알림 및 업데이트 수신 여부를 설정합니다.
                      </span>
                    </Label>
                    <Switch
                      id="notifications"
                      checked={userSettings.notificationsEnabled}
                      onCheckedChange={(checked) => updateUserSettings({ notificationsEnabled: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="darkmode" className="flex flex-col space-y-1">
                      <span>다크 모드</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        화면 테마를 어둡게 설정합니다.
                      </span>
                    </Label>
                    <Switch
                      id="darkmode"
                      checked={userSettings.darkModeEnabled}
                      onCheckedChange={(checked) => updateUserSettings({ darkModeEnabled: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="autoupdate" className="flex flex-col space-y-1">
                      <span>자동 업데이트</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        데이터를 자동으로 업데이트합니다.
                      </span>
                    </Label>
                    <Switch
                      id="autoupdate"
                      checked={userSettings.autoUpdateEnabled}
                      onCheckedChange={(checked) => updateUserSettings({ autoUpdateEnabled: checked })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="refreshInterval">데이터 갱신 주기</Label>
                    <Select 
                      value={userSettings.refreshInterval.toString()} 
                      onValueChange={(value) => updateUserSettings({ refreshInterval: parseInt(value, 10) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="갱신 주기 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1분</SelectItem>
                        <SelectItem value="5">5분</SelectItem>
                        <SelectItem value="15">15분</SelectItem>
                        <SelectItem value="30">30분</SelectItem>
                        <SelectItem value="60">1시간</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveUserSettings} disabled={userLoading || !userSettings}>변경사항 저장</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>계정 정보</CardTitle>
              <CardDescription>
                사용자 계정 정보를 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!userSettings ? (
                <div>계정 정보를 불러올 수 없습니다.</div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input id="name" defaultValue="사용자" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input id="email" type="email" defaultValue="user@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">언어 설정</Label>
                    <Select 
                      value={userSettings.language} 
                      onValueChange={(value) => updateUserSettings({ language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="언어 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveUserSettings} disabled={userLoading || !userSettings}>계정 정보 업데이트</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="github" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>GitHub 연동 설정</CardTitle>
              <CardDescription>
                GitHub 계정 연결 및 권한 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!githubSettings ? (
                <div>GitHub 설정을 불러올 수 없습니다.</div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="githubToken">GitHub 개인 액세스 토큰</Label>
                    <Input 
                      id="githubToken" 
                      type="password" 
                      value={githubSettings.token} 
                      onChange={(e) => updateGitHubSettings({ token: e.target.value })}
                      placeholder="GitHub 개인 액세스 토큰을 입력하세요"
                    />
                    <p className="text-sm text-muted-foreground">
                      GitHub API를 사용하기 위한 토큰입니다. 
                      <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"> 토큰 생성하기</a>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organization">조직 이름</Label>
                    <Input 
                      id="organization" 
                      value={githubSettings.organization} 
                      onChange={(e) => updateGitHubSettings({ organization: e.target.value })}
                      placeholder="GitHub 조직 이름을 입력하세요"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="repositories">저장소 목록</Label>
                    <Textarea 
                      id="repositories" 
                      value={repositoriesText} 
                      onChange={(e) => setRepositoriesText(e.target.value)}
                      placeholder="각 줄에 저장소 이름을 입력하세요"
                      rows={5}
                    />
                    <p className="text-sm text-muted-foreground">
                      각 줄에 하나의 저장소 이름을 입력하세요. 예: owner/repository
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGitHubSettings} disabled={githubLoading || !githubSettings}>GitHub 설정 저장</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="jira" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Jira 연동 설정</CardTitle>
              <CardDescription>
                Jira 계정 연결 및 프로젝트 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!jiraSettings ? (
                <div>Jira 설정을 불러올 수 없습니다.</div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="jiraUrl">Jira URL</Label>
                    <Input 
                      id="jiraUrl" 
                      value={jiraSettings.url} 
                      onChange={(e) => updateJiraSettings({ url: e.target.value })}
                      placeholder="https://your-domain.atlassian.net"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jiraEmail">Jira 계정 이메일</Label>
                    <Input 
                      id="jiraEmail" 
                      type="email" 
                      value={jiraSettings.email} 
                      onChange={(e) => updateJiraSettings({ email: e.target.value })}
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jiraToken">API 토큰</Label>
                    <Input 
                      id="jiraToken" 
                      type="password" 
                      value={jiraSettings.apiToken} 
                      onChange={(e) => updateJiraSettings({ apiToken: e.target.value })}
                      placeholder="Jira API 토큰을 입력하세요"
                    />
                    <p className="text-sm text-muted-foreground">
                      Jira API를 사용하기 위한 토큰입니다. 
                      <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"> 토큰 생성하기</a>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jiraProject">프로젝트 키</Label>
                    <Input 
                      id="jiraProject" 
                      value={jiraSettings.projectKey} 
                      onChange={(e) => updateJiraSettings({ projectKey: e.target.value })}
                      placeholder="Jira 프로젝트 키를 입력하세요 (예: PROJ)"
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveJiraSettings} disabled={jiraLoading || !jiraSettings}>Jira 설정 저장</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 