import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DomainData {
  id?: number;
  name: string;
  company?: string;
  url: string;
  apiUrl: string;
}

interface DomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (domain: DomainData) => void;
  initialData?: DomainData;
  isEdit?: boolean;
}

export function DomainDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  isEdit = false
}: DomainDialogProps) {
  const [domain, setDomain] = useState<DomainData>({
    name: "",
    company: "",
    url: "",
    apiUrl: ""
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setDomain(initialData);
    } else {
      setDomain({
        name: "",
        company: "",
        url: "",
        apiUrl: ""
      });
    }
  }, [initialData, open]);

  // 필드 업데이트 핸들러
  const handleChange = (field: keyof DomainData, value: string) => {
    setDomain(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 저장 핸들러
  const handleSave = () => {
    if (!domain.name || !domain.url || !domain.apiUrl) {
      alert("도메인 이름, URL, API URL은 필수 항목입니다.");
      return;
    }

    onSave(domain);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "GitHub 도메인 수정" : "GitHub 도메인 추가"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">도메인 이름</Label>
            <Input
              id="name"
              value={domain.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="github 또는 github_enterprise"
            />
            <p className="text-sm text-muted-foreground">
              도메인 타입을 식별하는 고유 이름입니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">회사 이름 (Enterprise 전용)</Label>
            <Input
              id="company"
              value={domain.company || ""}
              onChange={(e) => handleChange("company", e.target.value)}
              placeholder="회사 이름 (선택 사항)"
            />
            <p className="text-sm text-muted-foreground">
              GitHub Enterprise를 사용하는 회사 이름입니다. 선택 사항입니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">GitHub URL</Label>
            <Input
              id="url"
              value={domain.url}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="https://github.com 또는 https://github.your-company.com"
            />
            <p className="text-sm text-muted-foreground">
              GitHub 웹사이트 URL입니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiUrl">GitHub API URL</Label>
            <Input
              id="apiUrl"
              value={domain.apiUrl}
              onChange={(e) => handleChange("apiUrl", e.target.value)}
              placeholder="https://api.github.com 또는 https://github.your-company.com/api/v3"
            />
            <p className="text-sm text-muted-foreground">
              GitHub API 엔드포인트 URL입니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 