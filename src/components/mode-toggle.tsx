import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

// 로컬 스토리지 키
const THEME_STORAGE_KEY = "beaver-theme-preference"

export function ModeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  
  // 초기 테마 설정
  useEffect(() => {
    // 로컬 스토리지에서 테마 가져오기
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as "light" | "dark" | null
    
    // 저장된 테마가 있으면 사용, 없으면 라이트 모드가 기본값
    const initialTheme = savedTheme || "light"
    
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])
  
  // 테마 적용 함수
  const applyTheme = (newTheme: "light" | "dark") => {
    // 문서에 data-theme 속성 설정
    document.documentElement.setAttribute("data-theme", newTheme)
    
    // dark 클래스 토글
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    
    // 로컬 스토리지에 테마 저장
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }
  
  // 테마 변경 함수
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    applyTheme(newTheme)
  }
  
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="테마 전환"
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-foreground"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">테마 전환</span>
    </Button>
  )
} 