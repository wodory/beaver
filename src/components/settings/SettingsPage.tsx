import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true)

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
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notifications" className="flex flex-col space-y-1">
                  <span>알림</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    알림 및 업데이트 수신 여부를 설정합니다.
                  </span>
                </Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
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
                  checked={darkModeEnabled}
                  onCheckedChange={setDarkModeEnabled}
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
                  checked={autoUpdateEnabled}
                  onCheckedChange={setAutoUpdateEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refreshInterval">데이터 갱신 주기</Label>
                <Select defaultValue="5">
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
            </CardContent>
            <CardFooter>
              <Button>변경사항 저장</Button>
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
                <Select defaultValue="ko">
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
            </CardContent>
            <CardFooter>
              <Button>계정 정보 업데이트</Button>
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
              <div className="space-y-2">
                <Label htmlFor="github-token">GitHub 토큰</Label>
                <Input id="github-token" type="password" defaultValue="••••••••••••••••" />
                <p className="text-sm text-muted-foreground">
                  GitHub Personal Access Token을 입력하세요. 
                  <a href="https://github.com/settings/tokens" target="_blank" className="underline ml-1">토큰 생성하기</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github-organization">조직 설정</Label>
                <Input id="github-organization" placeholder="조직 이름을 입력하세요" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github-repos">저장소 설정</Label>
                <Textarea 
                  id="github-repos" 
                  placeholder="분석할 저장소 이름을 줄바꿈으로 구분하여 입력하세요"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>GitHub 설정 저장</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="jira" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Jira 연동 설정</CardTitle>
              <CardDescription>
                Jira 계정 연결 및 동기화 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jira-url">Jira URL</Label>
                <Input id="jira-url" placeholder="https://your-domain.atlassian.net" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jira-email">Jira 이메일</Label>
                <Input id="jira-email" type="email" placeholder="이메일을 입력하세요" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jira-token">API 토큰</Label>
                <Input id="jira-token" type="password" placeholder="Jira API 토큰을 입력하세요" />
                <p className="text-sm text-muted-foreground">
                  Jira API 토큰이 필요합니다. 
                  <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" className="underline ml-1">토큰 생성하기</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jira-project">프로젝트 키</Label>
                <Input id="jira-project" placeholder="Jira 프로젝트 키를 입력하세요 (예: PROJ)" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Jira 설정 저장</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 