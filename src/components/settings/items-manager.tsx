"use client"

import { FolderOpen } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { itemTypeLabels } from "./settings-context"

export function ItemsManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Каталог веществ
        </CardTitle>
        <CardDescription>Управление справочниками каталога</CardDescription>
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

        <p className="text-sm text-muted-foreground">
          Управление категориями и формами выпуска для каталога веществ будет доступно в следующей
          версии.
        </p>
      </CardContent>
    </Card>
  )
}
