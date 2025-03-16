import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ModeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  
  // 시스템 테마 감지
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setTheme(isDark ? "dark" : "light")
    
    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light")
    }
    
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])
  
  // 테마 토글
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-foreground"
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 