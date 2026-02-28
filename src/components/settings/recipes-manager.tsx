"use client"

import { ChefHat, Utensils, Coffee, Martini } from "@/lib/icons"
import { useTranslations } from "next-intl"
import { StatsGrid } from "@/components/shared"
import { useSettings } from "./settings-context"

export function RecipesManager() {
  const { stats } = useSettings()
  const t = useTranslations("settings")

  return (
    <StatsGrid
      title={t("recipes.title")}
      description={t("recipes.description")}
      icon={ChefHat}
      stats={[
        { value: stats.recipes, label: t("recipes.totalRecipes"), icon: Utensils },
        { value: stats.content - stats.recipes, label: t("recipes.otherContent"), icon: Coffee },
      ]}
      columns={2}
    />
  )
}
