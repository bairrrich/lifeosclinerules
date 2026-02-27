"use client"

import { Sun, Moon, Monitor } from "@/lib/icons"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useSettings } from "./settings-context"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { mounted } = useSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Оформление</CardTitle>
        <CardDescription>Настройте внешний вид приложения</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Тема</Label>
          <div className="flex gap-2">
            <Button
              variant={mounted && theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4 mr-2" />
              Светлая
            </Button>
            <Button
              variant={mounted && theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4 mr-2" />
              Темная
            </Button>
            <Button
              variant={mounted && theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("system")}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Системная
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
