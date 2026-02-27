"use client"

import { ChefHat } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { useSettings } from "./settings-context"

export function RecipesManager() {
  const { stats } = useSettings()
  const t = useTranslations("settings")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          {t("recipes.title")}
        </CardTitle>
        <CardDescription>{t("recipes.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.recipes}</div>
            <div className="text-xs text-muted-foreground">{t("recipes.totalRecipes")}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.content - stats.recipes}</div>
            <div className="text-xs text-muted-foreground">{t("recipes.otherContent")}</div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{t("recipes.comingSoon")}</p>
      </CardContent>
    </Card>
  )
}
