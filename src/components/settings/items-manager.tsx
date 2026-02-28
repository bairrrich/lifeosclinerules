"use client"

import { FolderOpen, Pill, Bandage, Leaf, Sparkles, Package } from "@/lib/icons"
import { useTranslations } from "next-intl"
import { StatsGrid } from "@/components/shared"
import { useItemTypeLabels } from "./settings-context"

export function ItemsManager() {
  const t = useTranslations("settings")
  const itemTypeLabels = useItemTypeLabels()

  return (
    <StatsGrid
      title={t("items.title")}
      description={t("items.description")}
      icon={FolderOpen}
      stats={Object.entries(itemTypeLabels).map(([type, { label, icon: Icon }]) => ({
        value: "—",
        label,
        icon: Icon,
      }))}
      columns={3}
    />
  )
}
