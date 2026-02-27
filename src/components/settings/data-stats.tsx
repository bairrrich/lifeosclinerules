"use client"

import { Book, ChefHat, BookOpen, CheckCircle, Bookmark } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSettings, logTypeLabels } from "./settings-context"
import { LogType } from "@/types"

export function DataStats() {
  const { stats } = useSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Данные</CardTitle>
        <CardDescription>Статистика хранилища</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Основные счётчики */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.logs}</div>
            <div className="text-xs text-muted-foreground">Записей</div>
          </div>
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.items}</div>
            <div className="text-xs text-muted-foreground">Каталог</div>
          </div>
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.content}</div>
            <div className="text-xs text-muted-foreground">Контент</div>
          </div>
        </div>

        {/* Детализация по логам */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Записи по типам</div>
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
          <div className="text-sm font-medium text-muted-foreground">Контент</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Book className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-semibold">{stats.books}</div>
                <div className="text-xs text-muted-foreground">Книги</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <ChefHat className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-semibold">{stats.recipes}</div>
                <div className="text-xs text-muted-foreground">Рецепты</div>
              </div>
            </div>
          </div>

          {/* Статусы книг */}
          {stats.books > 0 && (
            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Читаю: {stats.booksReading}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Прочитано: {stats.booksCompleted}
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="h-3 w-3" /> Запланировано: {stats.booksPlanned}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
