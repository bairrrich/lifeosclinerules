"use client"

import { FolderOpen } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { useItemTypeLabels } from "./settings-context"

export function ItemsManager() {
  const t = useTranslations("settings")
  const itemTypeLabels = useItemTypeLabels()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          {t("items.title")}
        </CardTitle>
        <CardDescription>{t("items.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Статистика по типам */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {Object.entries(itemTypeLabels).map(([type, { label, icon: Icon }]) => (
            <div
              key={type}
              className="p-3 rounded-xl bg-muted flex items-center justify-center gap-2"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{t("items.comingSoon")}</p>
      </CardContent>
    </Card>
  )
}
