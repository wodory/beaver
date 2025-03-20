import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

// 계정 데이터 인터페이스
export interface AccountFormData {
  id: string;
  username: string;
  type: string;
  url: string;
  apiUrl: string;
  token: string;
  email: string;
  company: string;
  org?: string;
}

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: AccountFormData) => void;
  initialData?: AccountFormData;
  isEdit?: boolean;
}

export function AccountDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  isEdit = false,
}: AccountDialogProps) {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<AccountFormData>({
    id: "",
    username: "",
    type: "github",
    url: "",
    apiUrl: "",
    token: "",
    email: "",
    company: "",
    org: "",
  });

  // 초기 데이터가 있을 경우 폼 데이터 초기화
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      });
    } else {
      // 초기화
      setFormData({
        id: "",
        username: "",
        type: "github",
        url: "",
        apiUrl: "",
        token: "",
        email: "",
        company: "",
        org: "",
      });
    }
  }, [initialData, open]);

  // 필드 변경 핸들러
  const handleChange = (
    field: keyof AccountFormData,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // 계정 유형에 따라 기본값 설정
      if (field === "type") {
        switch (value) {
          case "github":
            return {
              ...updated,
              url: "https://github.com",
              apiUrl: "https://api.github.com",
              // GitHub 계정의 경우 ID가 비어있으면 이메일 주소의 첫 부분을 기본값으로 설정
              id: updated.id || (updated.email ? updated.email.split('@')[0] : ""),
            };
          case "github_enterprise":
            return {
              ...updated,
              url: updated.url || "https://github.your-company.com",
              apiUrl: updated.apiUrl || "https://github.your-company.com/api/v3",
              // github_enterprise 계정의 경우 ID가 비어있으면 이메일 주소의 첫 부분을 기본값으로 설정
              id: updated.id || (updated.email ? updated.email.split('@')[0] : ""),
            };
          case "gitlab":
            return {
              ...updated,
              url: "https://gitlab.com",
              apiUrl: "https://gitlab.com/api/v4",
            };
          case "gitlab_self_hosted":
            return {
              ...updated,
              url: updated.url || "https://gitlab.your-company.com",
              apiUrl: updated.apiUrl || "https://gitlab.your-company.com/api/v4",
            };
          case "jira":
            return {
              ...updated,
              url: updated.url || "https://your-domain.atlassian.net",
              apiUrl: updated.apiUrl || "https://your-domain.atlassian.net/rest/api/3",
            };
          default:
            return updated;
        }
      }
      
      // URL 변경 시 id와 apiUrl 자동 설정 (GitHub 타입인 경우)
      if (field === "url" && value && (prev.type === "github" || prev.type === "github_enterprise")) {
        try {
          // URL 파싱
          const urlObj = new URL(value);
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          
          // GitHub/GitHub Enterprise 홈 디렉토리 URL 형식인 경우 (예: https://github.com/wodory)
          if (pathParts.length === 1) {
            const userId = pathParts[0];
            // GitHub의 경우 api.github.com, GitHub Enterprise의 경우 도메인/api/v3 형식으로 API URL 설정
            let apiUrl = "";
            if (prev.type === "github") {
              apiUrl = "https://api.github.com";
            } else {
              const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
              apiUrl = `${baseUrl}/api/v3`;
            }
            
            return {
              ...updated,
              id: userId,
              apiUrl: apiUrl
            };
          }
        } catch (error) {
          console.error("URL 파싱 실패:", error);
        }
      }
      
      // 이메일 변경 시 ID가 비어있는 경우 이메일 주소의 첫 부분을 ID로 설정 (github 또는 github_enterprise 타입인 경우)
      if (field === "email" && !prev.id && (prev.type === "github" || prev.type === "github_enterprise") && value) {
        const emailUsername = value.split('@')[0];
        if (emailUsername) {
          return {
            ...updated,
            id: emailUsername
          };
        }
      }
      
      return updated;
    });
  };

  // 저장 핸들러
  const handleSave = () => {
    // 필수 필드 검증
    if (!formData.id.trim()) {
      toast.error("계정 ID를 입력해주세요.");
      return;
    }
    
    if (!formData.username.trim()) {
      toast.error("사용자 이름을 입력해주세요.");
      return;
    }
    
    if (!formData.url.trim()) {
      toast.error("URL을 입력해주세요.");
      return;
    }
    
    if (!formData.apiUrl.trim()) {
      toast.error("API URL을 입력해주세요.");
      return;
    }
    
    if (!formData.token.trim()) {
      toast.error("토큰을 입력해주세요.");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("이메일을 입력해주세요.");
      return;
    }
    
    if (!formData.company.trim()) {
      toast.error("회사 정보를 입력해주세요.");
      return;
    }

    // 부모 컴포넌트로 저장 이벤트 전달
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "계정 수정" : "새 계정 추가"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="accountId">
              계정 ID
            </Label>
            <Input 
              id="accountId" 
              value={formData.id} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("id", e.target.value)}
              placeholder="계정 ID (영문으로 입력)"
              disabled={isEdit} // 수정 시에는 ID 변경 불가
            />
            <p className="text-xs text-muted-foreground">
              고유 식별자로 사용될 계정 ID (영문, 숫자, 언더스코어 사용)
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="username">
              사용자 이름
            </Label>
            <Input 
              id="username" 
              value={formData.username} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("username", e.target.value)}
              placeholder="사용자 이름 (한글, 영문 등 자유롭게)"
            />
            <p className="text-xs text-muted-foreground">
              서비스에서 사용하는 사용자 이름
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="accountType">
              계정 유형
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: string) => handleChange("type", value)}
            >
              <SelectTrigger id="accountType">
                <SelectValue placeholder="계정 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="github_enterprise">GitHub Enterprise</SelectItem>
                <SelectItem value="gitlab">GitLab</SelectItem>
                <SelectItem value="gitlab_self_hosted">GitLab 자체 호스팅</SelectItem>
                <SelectItem value="jira">Jira</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="url">
              URL
            </Label>
            <Input 
              id="url" 
              value={formData.url} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("url", e.target.value)}
              placeholder={formData.type === "github" || formData.type === "github_enterprise" 
                ? "https://your-domain.com/username" 
                : "웹사이트 URL"}
            />
            <p className="text-xs text-muted-foreground">
              {formData.type === "github" 
                ? "GitHub 사용자 홈 URL (예: https://github.com/wodory)"
                : formData.type === "github_enterprise" 
                  ? "GitHub Enterprise 사용자 홈 URL (예: https://oss.navercorp.com/wodory)"
                  : "서비스 웹사이트 URL (예: https://gitlab.com)"}
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="apiUrl">
              API URL
            </Label>
            <Input 
              id="apiUrl" 
              value={formData.apiUrl} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("apiUrl", e.target.value)}
              placeholder="API URL"
            />
            <p className="text-xs text-muted-foreground">
              {formData.type === "github" 
                ? "GitHub API URL (기본값: https://api.github.com)"
                : formData.type === "github_enterprise" 
                  ? "GitHub Enterprise API URL (URL에서 자동 생성됩니다만 수정 가능합니다)"
                  : "서비스 API URL (예: https://gitlab.com/api/v4)"}
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="token">
              토큰
            </Label>
            <Input 
              id="token" 
              type="password"
              value={formData.token} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("token", e.target.value)}
              placeholder="개인 액세스 토큰"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">
              이메일
            </Label>
            <Input 
              id="email" 
              type="email"
              value={formData.email} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("email", e.target.value)}
              placeholder="연결된 이메일"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="company">
              회사
            </Label>
            <Input 
              id="company" 
              value={formData.company} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("company", e.target.value)}
              placeholder="회사 이름"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="org">
              조직 (선택)
            </Label>
            <Input 
              id="org" 
              value={formData.org || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("org", e.target.value)}
              placeholder="조직/부서 이름 (선택)"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? "저장" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 