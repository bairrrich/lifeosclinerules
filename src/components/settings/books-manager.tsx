"use client"

import { Book } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSettings } from "./settings-context"

export function BooksManager() {
  const { stats } = useSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          Книги
        </CardTitle>
        <CardDescription>Управление справочниками для книг</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.books}</div>
            <div className="text-xs text-muted-foreground">Всего книг</div>
          </div>
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.booksReading}</div>
            <div className="text-xs text-muted-foreground">Читаю</div>
          </div>
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.booksCompleted}</div>
            <div className="text-xs text-muted-foreground">Прочитано</div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Управление жанрами, авторами и сериями будет доступно в следующей версии.
        </p>
      </CardContent>
    </Card>
  )
}
