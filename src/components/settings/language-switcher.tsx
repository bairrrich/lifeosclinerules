"use client"

import { Globe } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/lib/navigation"
import { useTranslations } from "next-intl"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("language")
  const ts = useTranslations("settings")

  const languages = [
    { code: "en", label: t("en"), flag: "🇺🇸" },
    { code: "ru", label: t("ru"), flag: "🇷🇺" },
  ]

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ts("language.title")}</CardTitle>
        <CardDescription>{ts("language.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={locale === lang.code ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange(lang.code)}
                className="min-w-[120px]"
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
