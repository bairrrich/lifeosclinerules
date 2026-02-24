"use client"

import { ChefHat } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSettings } from "./settings-context"

export function RecipesManager() {
  const { stats } = useSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Рецепты
        </CardTitle>
        <CardDescription>Управление справочниками для рецептов</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.recipes}</div>
            <div className="text-xs text-muted-foreground">Всего рецептов</div>
          </div>
          <div className="p-3 rounded-xl bg-muted">
            <div className="text-2xl font-bold">{stats.content - stats.recipes}</div>
            <div className="text-xs text-muted-foreground">Другой контент</div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Управление ингредиентами и категориями рецептов будет доступно в следующей версии.
        </p>
      </CardContent>
    </Card>
  )
}