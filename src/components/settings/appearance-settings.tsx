"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "@/lib/navigation"
import { useSettings } from "./settings-context"
import { Globe, Sun, Moon, Monitor, Calendar } from "@/lib/icons"

const WEEK_STORAGE_KEY = "first-day-of-week"
type FirstDayOfWeek = "sunday" | "monday"

export function AppearanceSettings() {
  const t = useTranslations("settings")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { mounted } = useSettings()
  const [firstDay, setFirstDay] = useState<FirstDayOfWeek>("monday")

  useEffect(() => {
    const stored = localStorage.getItem(WEEK_STORAGE_KEY) as FirstDayOfWeek | null
    if (stored) {
      setFirstDay(stored)
    }
  }, [])

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  const handleFirstDayChange = (value: string | string[]) => {
    const newFirstDay = Array.isArray(value) ? value[0] : value
    setFirstDay(newFirstDay as FirstDayOfWeek)
    localStorage.setItem(WEEK_STORAGE_KEY, newFirstDay)

    window.dispatchEvent(
      new CustomEvent("first-day-of-week-change", { detail: { firstDay: newFirstDay } })
    )
  }

  const languageOptions = [
    { id: "en", label: "🇺🇸 English" },
    { id: "ru", label: "🇷🇺 Русский" },
  ]

  const themeOptions = [
    { id: "light", label: "🌞 " + t("theme.light") },
    { id: "dark", label: "🌙 " + t("theme.dark") },
    { id: "system", label: "🖥️ " + t("theme.system") },
  ]

  const weekDayOptions = [
    { id: "monday", label: t("firstDayOfWeek.monday") },
    { id: "sunday", label: t("firstDayOfWeek.sunday") },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("appearance.title")}</CardTitle>
        <CardDescription>{t("appearance.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Language */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Label>{t("language.title")}</Label>
            </div>
            <Combobox
              options={languageOptions}
              value={locale}
              onChange={(value) => handleLanguageChange(Array.isArray(value) ? value[0] : value)}
              allowCustom={false}
              searchable={false}
              placeholder={t("language.title")}
            />
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Label>{t("theme.title")}</Label>
            </div>
            <Combobox
              options={themeOptions}
              value={mounted ? theme : "system"}
              onChange={(value) => setTheme(Array.isArray(value) ? value[0] : value)}
              allowCustom={false}
              searchable={false}
              placeholder={t("theme.title")}
            />
          </div>

          {/* First Day of Week */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label>{t("firstDayOfWeek.title")}</Label>
            </div>
            <Combobox
              options={weekDayOptions}
              value={firstDay}
              onChange={handleFirstDayChange}
              allowCustom={false}
              searchable={false}
              placeholder={t("firstDayOfWeek.label")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
