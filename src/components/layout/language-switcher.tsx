"use client"

import { useLocale } from "next-intl"
import { useRouter } from "@/lib/navigation"
import { useTranslations } from "next-intl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "@/lib/icons"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations("language")

  const handleLanguageChange = (newLocale: string) => {
    router.push("/", { locale: newLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-10 h-10">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t("select")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange("en")}>🇺🇸 {t("en")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("ru")}>🇷🇺 {t("ru")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
