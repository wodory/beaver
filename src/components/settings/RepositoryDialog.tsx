import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { toast } from "sonner";
import { AccountFormData } from "./AccountDialog";

// 저장소 데이터 인터페이스
export interface RepositoryFormData {
  id?: string;
  url: string;
  name: string;
  fullName: string;
  type: string;
  accountId: string;
}

interface RepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: RepositoryFormData) => void;
  initialData?: RepositoryFormData;
  isEdit?: boolean;
  accounts: AccountFormData[];
}

export function RepositoryDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  isEdit = false,
  accounts
}: RepositoryDialogProps) {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<RepositoryFormData>({
    url: "",
    name: "",
    fullName: "",
    type: "github",
    accountId: ""
  });

  // URL 파싱 상태
  const [urlParsed, setUrlParsed] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  // 계정 선택 시 계정 타입 설정
  const selectedAccount = accounts.find(account => account.id === formData.accountId);
  
  // 초기 데이터가 있을 경우 폼 데이터 초기화
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      });
      setUrlParsed(true);
    } else {
      // 초기화
      setFormData({
        url: "",
        name: "",
        fullName: "",
        type: selectedAccount?.type || "github",
        accountId: accounts.length > 0 ? accounts[0].id || "" : ""
      });
      setUrlParsed(false);
    }
    setParseError("");
  }, [initialData, open, accounts, selectedAccount]);

  // 계정 변경 시 타입 업데이트
  useEffect(() => {
    if (selectedAccount) {
      setFormData(prev => ({
        ...prev,
        type: selectedAccount.type
      }));
    }
  }, [selectedAccount]);

  // 필드 변경 핸들러
  const handleChange = (
    field: keyof RepositoryFormData,
    value: string
  ) => {
    // URL이 변경되면 파싱 상태 초기화
    if (field === "url") {
      setUrlParsed(false);
      setParseError("");
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // URL 파싱 핸들러
  const handleParseUrl = async () => {
    if (!formData.url) {
      toast.error("URL을 입력해주세요.");
      return;
    }

    try {
      setParsing(true);
      setParseError("");
      
      // URL에서 정보 추출
      const url = new URL(formData.url);
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      // GitHub 또는 GitHub Enterprise 형식 파싱
      if (formData.type === "github" || formData.type === "github_enterprise") {
        if (pathParts.length >= 2) {
          const owner = pathParts[0];
          const repo = pathParts[1].replace('.git', '');
          
          setFormData(prev => ({
            ...prev,
            name: repo,
            fullName: `${owner}/${repo}`
          }));
          
          setUrlParsed(true);
          toast.success("저장소 정보 파싱 완료");
        } else {
          setParseError("유효한 GitHub 저장소 URL이 아닙니다.");
          toast.error("유효한 GitHub 저장소 URL이 아닙니다.");
        }
      }
      // GitLab 형식 파싱 
      else if (formData.type === "gitlab" || formData.type === "gitlab_self_hosted") {
        if (pathParts.length >= 2) {
          const fullPath = pathParts.join('/').replace('.git', '');
          const repoName = pathParts[pathParts.length - 1].replace('.git', '');
          
          setFormData(prev => ({
            ...prev,
            name: repoName,
            fullName: fullPath
          }));
          
          setUrlParsed(true);
          toast.success("저장소 정보 파싱 완료");
        } else {
          setParseError("유효한 GitLab 저장소 URL이 아닙니다.");
          toast.error("유효한 GitLab 저장소 URL이 아닙니다.");
        }
      }
      // Jira 형식에 대한 처리 - 예시
      else if (formData.type === "jira") {
        const projectKey = pathParts[pathParts.length - 1];
        
        setFormData(prev => ({
          ...prev,
          name: projectKey,
          fullName: projectKey
        }));
        
        setUrlParsed(true);
        toast.success("프로젝트 정보 파싱 완료");
      }
      else {
        setParseError("지원하지 않는 저장소 유형입니다.");
        toast.error("지원하지 않는 저장소 유형입니다.");
      }
    } catch (error) {
      setParseError("URL 파싱 중 오류가 발생했습니다.");
      toast.error("URL 파싱 중 오류가 발생했습니다.");
      console.error("URL 파싱 오류:", error);
    } finally {
      setParsing(false);
    }
  };

  // 저장 핸들러
  const handleSave = () => {
    // 필수 필드 검증
    if (!formData.accountId) {
      toast.error("계정을 선택해주세요.");
      return;
    }
    
    if (!formData.url) {
      toast.error("URL을 입력해주세요.");
      return;
    }
    
    if (!urlParsed && !isEdit) {
      const confirm = window.confirm("URL 파싱을 하지 않았습니다. 계속 진행하시겠습니까?");
      if (!confirm) return;
    }

    // 부모 컴포넌트로 저장 이벤트 전달
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "저장소 수정" : "새 저장소 추가"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accountSelect">계정</Label>
            <Select 
              value={formData.accountId} 
              onValueChange={(value: string) => handleChange("accountId", value)}
              disabled={isEdit}
            >
              <SelectTrigger id="accountSelect">
                <SelectValue placeholder="계정 선택" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id || ""}>
                    {account.name} ({account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {accounts.length === 0 && (
              <p className="text-xs text-orange-500">
                먼저 계정을 추가해주세요.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repositoryUrl">저장소 URL</Label>
            <div className="flex gap-2">
              <Input 
                id="repositoryUrl" 
                value={formData.url} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("url", e.target.value)}
                placeholder="https://github.com/username/repo"
                className="flex-1"
                disabled={isEdit}
              />
              <Button 
                variant="outline" 
                onClick={handleParseUrl} 
                disabled={!formData.url || parsing || (isEdit && urlParsed)}
              >
                {parsing ? "파싱 중..." : "파싱"}
              </Button>
            </div>
            {parseError && (
              <p className="text-xs text-red-500">{parseError}</p>
            )}
            {!isEdit && (
              <p className="text-xs text-muted-foreground">
                저장소 URL을 입력하고 파싱 버튼을 눌러 정보를 자동으로 가져옵니다.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repositoryName">저장소 이름</Label>
            <Input 
              id="repositoryName" 
              value={formData.name} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}
              placeholder="저장소 이름"
              readOnly={!isEdit && !urlParsed}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">전체 이름</Label>
            <Input 
              id="fullName" 
              value={formData.fullName} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("fullName", e.target.value)}
              placeholder="소유자명/저장소명"
              readOnly={!isEdit && !urlParsed}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repoType">저장소 유형</Label>
            <Input 
              id="repoType" 
              value={formData.type} 
              readOnly
              disabled
            />
            <p className="text-xs text-muted-foreground">
              선택한 계정 유형에 따라 자동으로 설정됩니다.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button 
            onClick={handleSave}
            disabled={accounts.length === 0 || (!urlParsed && !isEdit)}
          >
            {isEdit ? "저장" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 