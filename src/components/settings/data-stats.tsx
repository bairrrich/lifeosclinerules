"use client"

import { useTranslations } from "next-intl"
import {
  Book,
  ChefHat,
  BookOpen,
  CheckCircle,
  Bookmark,
  Database,
  Package,
  FileText,
} from "@/lib/icons"
import { StatsGrid } from "@/components/shared"
import { useSettings, useLogTypeLabels } from "./settings-context"
import { LogType } from "@/types"

export function DataStats() {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")
  const { stats } = useSettings()
  const logTypeLabels = useLogTypeLabels()

  return (
    <StatsGrid
      title={t("dataStats.title")}
      description={t("dataStats.description")}
      icon={Database}
      stats={[
        {
          value: stats.logs,
          label: tCommon("records"),
          icon: FileText,
        },
        {
          value: stats.items,
          label: tCommon("catalog"),
          icon: Package,
        },
        {
          value: stats.content,
          label: tCommon("content"),
          icon: Book,
        },
      ]}
      columns={3}
    />
  )
}
