"use client"

import { Sun, Moon, Monitor } from "@/lib/icons"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useSettings } from "./settings-context"
import { useTranslations } from "next-intl"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { mounted } = useSettings()
  const t = useTranslations("settings")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("theme.title")}</CardTitle>
        <CardDescription>{t("theme.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t("theme.title")}</Label>
          <div className="flex gap-2">
            <Button
              variant={mounted && theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4 mr-2" />
              {t("theme.light")}
            </Button>
            <Button
              variant={mounted && theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4 mr-2" />
              {t("theme.dark")}
            </Button>
            <Button
              variant={mounted && theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("system")}
            >
              <Monitor className="h-4 w-4 mr-2" />
              {t("theme.system")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
