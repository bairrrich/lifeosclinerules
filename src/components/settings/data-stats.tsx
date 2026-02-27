"use client"

import { useTranslations } from "next-intl"
import { Book, ChefHat, BookOpen, CheckCircle, Bookmark } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSettings, useLogTypeLabels } from "./settings-context"
import { LogType } from "@/types"

export function DataStats() {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")
  const { stats } = useSettings()
  const logTypeLabels = useLogTypeLabels()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dataStats.title")}</CardTitle>
        <CardDescription>{t("dataStats.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Основные счётчики */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.logs}</div>
            <div className="text-xs text-muted-foreground">{tCommon("records")}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.items}</div>
            <div className="text-xs text-muted-foreground">{tCommon("catalog")}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.content}</div>
            <div className="text-xs text-muted-foreground">{tCommon("content")}</div>
          </div>
        </div>

        {/* Детализация по логам */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">{tCommon("logsByType")}</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(logTypeLabels).map(([type, { label, icon: Icon }]) => (
              <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-semibold">
                    {type === LogType.FOOD
                      ? stats.foodLogs
                      : type === LogType.WORKOUT
                        ? stats.workoutLogs
                        : stats.financeLogs}
                  </div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Книги и рецепты */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">{tCommon("content")}</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Book className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-semibold">{stats.books}</div>
                <div className="text-xs text-muted-foreground">{tCommon("books")}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <ChefHat className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-semibold">{stats.recipes}</div>
                <div className="text-xs text-muted-foreground">{tCommon("recipes")}</div>
              </div>
            </div>
          </div>

          {/* Статусы книг */}
          {stats.books > 0 && (
            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> {tCommon("reading")}: {stats.booksReading}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> {tCommon("completed")}: {stats.booksCompleted}
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="h-3 w-3" /> {tCommon("planned")}: {stats.booksPlanned}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
