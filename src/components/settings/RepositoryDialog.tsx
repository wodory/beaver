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
  owner: string;
  ownerReference?: string;
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
    owner: ""
  });

  // URL 파싱 상태
  const [urlParsed, setUrlParsed] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  // 계정 선택 시 계정 타입 설정
  const selectedAccount = accounts.find(account => account.id === formData.owner);
  
  // 초기 데이터가 있을 경우 폼 데이터 초기화
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      });
      setUrlParsed(true);
    } else {
      // 계정 타입별로 필터링
      const filteredAccounts = accounts.filter(account => account.type === "github");
      
      // 해당 타입의 계정이 있으면 사용, 없으면 전체 계정 중 첫 번째 사용
      const defaultAccount = filteredAccounts.length > 0 ? filteredAccounts[0] : 
                           (accounts.length > 0 ? accounts[0] : null);
      
      setFormData({
        url: "",
        name: "",
        fullName: "",
        type: defaultAccount?.type || "github",
        owner: defaultAccount?.id || "",
        ownerReference: defaultAccount ? `${defaultAccount.id}@${defaultAccount.type}` : ""
      });
      setUrlParsed(false);
    }
    setParseError("");
  }, [initialData, open, accounts]);

  // 계정 변경 시 타입 업데이트
  useEffect(() => {
    if (selectedAccount) {
      setFormData(prev => ({
        ...prev,
        type: selectedAccount.type,
        ownerReference: `${selectedAccount.id}@${selectedAccount.type}`
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
      
      // 선택된 계정 가져오기
      const selectedAccount = accounts.find(account => account.id === formData.owner);
      
      if (!selectedAccount) {
        setParseError("계정을 먼저 선택해주세요.");
        toast.error("계정을 먼저 선택해주세요.");
        return;
      }
      
      // URL에서 정보 추출
      const url = new URL(formData.url);
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      // GitHub 또는 GitHub Enterprise 형식 파싱
      if (selectedAccount.type === "github" || selectedAccount.type === "github_enterprise") {
        if (pathParts.length >= 2) {
          const owner = pathParts[0];
          const repo = pathParts[1].replace('.git', '');
          
          setFormData(prev => ({
            ...prev,
            name: repo,
            fullName: `${owner}/${repo}`,
            type: selectedAccount.type
          }));
          
          setUrlParsed(true);
          toast.success("저장소 정보 파싱 완료");
        } else {
          setParseError("유효한 GitHub 저장소 URL이 아닙니다. (형식: https://domain/owner/repo)");
          toast.error("유효한 GitHub 저장소 URL이 아닙니다. (형식: https://domain/owner/repo)");
        }
      }
      // GitLab 형식 파싱 
      else if (selectedAccount.type === "gitlab" || selectedAccount.type === "gitlab_self_hosted") {
        if (pathParts.length >= 2) {
          const fullPath = pathParts.join('/').replace('.git', '');
          const repoName = pathParts[pathParts.length - 1].replace('.git', '');
          
          setFormData(prev => ({
            ...prev,
            name: repoName,
            fullName: fullPath,
            type: selectedAccount.type
          }));
          
          setUrlParsed(true);
          toast.success("저장소 정보 파싱 완료");
        } else {
          setParseError("유효한 GitLab 저장소 URL이 아닙니다.");
          toast.error("유효한 GitLab 저장소 URL이 아닙니다.");
        }
      }
      // Jira 형식에 대한 처리 - 예시
      else if (selectedAccount.type === "jira") {
        const projectKey = pathParts[pathParts.length - 1];
        
        setFormData(prev => ({
          ...prev,
          name: projectKey,
          fullName: projectKey,
          type: selectedAccount.type
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
    if (!formData.owner) {
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

    // 최종 데이터 생성 - ownerReference는 현재 폼의 owner와 type을 기반으로 생성
    const finalFormData = {
      ...formData,
      ownerReference: `${formData.owner}@${formData.type}`
    };

    // 부모 컴포넌트로 저장 이벤트 전달
    onSave(finalFormData);
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
              value={formData.owner} 
              onValueChange={(value: string) => handleChange("owner", value)}
              disabled={isEdit}
            >
              <SelectTrigger id="accountSelect">
                <SelectValue placeholder="계정 선택" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem 
                    key={`${account.id}-${account.type}`} 
                    value={account.id || ""}
                  >
                    {account.username} ({account.type})
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
                onBlur={() => formData.url && !parsing && !isEdit && handleParseUrl()}
                onKeyDown={(e) => e.key === 'Enter' && formData.url && !parsing && !isEdit && handleParseUrl()}
                placeholder="https://github.com/username/repo"
                className="flex-1"
                disabled={isEdit}
              />
            </div>
            {parsing && (
              <p className="text-xs text-muted-foreground">파싱 중...</p>
            )}
            {parseError && (
              <p className="text-xs text-red-500">{parseError}</p>
            )}
            {!isEdit && (
              <p className="text-xs text-muted-foreground">
                저장소 URL을 입력하면 자동으로 정보를 파싱합니다.
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