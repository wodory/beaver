import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

// 계정 데이터 인터페이스
export interface AccountFormData {
  id?: string;
  name: string;
  type: string;
  url: string;
  apiUrl: string;
  token: string;
  email?: string;
  company?: string;
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
    name: "",
    type: "github",
    url: "",
    apiUrl: "",
    token: "",
    email: "",
    company: "",
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
        name: "",
        type: "github",
        url: "",
        apiUrl: "",
        token: "",
        email: "",
        company: "",
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
            };
          case "github_enterprise":
            return {
              ...updated,
              url: updated.url || "https://github.your-company.com",
              apiUrl: updated.apiUrl || "https://github.your-company.com/api/v3",
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
      
      return updated;
    });
  };

  // 저장 핸들러
  const handleSave = () => {
    // 필수 필드 검증
    if (!formData.name.trim()) {
      toast.error("계정 이름을 입력해주세요.");
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
            <Label htmlFor="accountName">
              계정 이름
            </Label>
            <Input 
              id="accountName" 
              value={formData.name} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}
              placeholder="계정 이름 (예: 회사 GitHub)"
            />
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
              placeholder="웹사이트 URL"
            />
            <p className="text-xs text-muted-foreground">
              서비스 웹사이트 URL (예: https://github.com)
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
              서비스 API URL (예: https://api.github.com)
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
              이메일 (선택)
            </Label>
            <Input 
              id="email" 
              type="email"
              value={formData.email || ""} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("email", e.target.value)}
              placeholder="연결된 이메일 (선택)"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="company">
              회사/조직 (선택)
            </Label>
            <Input 
              id="company" 
              value={formData.company || ""} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("company", e.target.value)}
              placeholder="회사 또는 조직 이름 (선택)"
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