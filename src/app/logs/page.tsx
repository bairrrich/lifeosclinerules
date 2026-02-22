"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Utensils, Dumbbell, Wallet, Plus, Search, LucideIcon } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddDialog } from "@/components/shared/add-dialog"
import { db, initializeDatabase } from "@/lib/db"
import type { Log, LogType } from "@/types"

const logTypes = [
  { type: "food" as LogType, label: "Питание", icon: Utensils, color: "bg-orange-500/10 text-orange-500" },
  { type: "workout" as LogType, label: "Тренировки", icon: Dumbbell, color: "bg-blue-500/10 text-blue-500" },
  { type: "finance" as LogType, label: "Финансы", icon: Wallet, color: "bg-green-500/10 text-green-500" },
]

export default function LogsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<Log[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeType, setActiveType] = useState<LogType | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()
        const allLogs = await db.logs.orderBy("date").reverse().toArray()
        setLogs(allLogs)
      } catch (error) {
        console.error("Failed to load logs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = activeType === null || log.type === activeType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: LogType): LucideIcon => {
    switch (type) {
      case "food":
        return Utensils
      case "workout":
        return Dumbbell
      case "finance":
        return Wallet
      default:
        return Wallet
    }
  }

  const getTypeColor = (type: LogType) => {
    switch (type) {
      case "food":
        return "bg-orange-500/10 text-orange-500"
      case "workout":
        return "bg-blue-500/10 text-blue-500"
      case "finance":
        return "bg-green-500/10 text-green-500"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <AppLayout title="Учет">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Type Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={activeType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveType(null)}
          >
            Все
          </Button>
          {logTypes.map((lt) => (
            <Button
              key={lt.type}
              variant={activeType === lt.type ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveType(lt.type)}
            >
              <lt.icon className="h-4 w-4 mr-2" />
              {lt.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск записей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Logs List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {logs.length === 0
                ? "Нет записей. Начните вести учет!"
                : "Ничего не найдено"}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const TypeIcon = getTypeIcon(log.type)
              return (
                <Link key={log.id} href={`/logs/${log.type}/${log.id}`}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${getTypeColor(log.type)}`}
                      >
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{log.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(log.date)}
                          {log.value !== undefined && ` • ${log.value}`}
                        </p>
                      </div>
                      {log.tags && log.tags.length > 0 && (
                        <Badge variant="secondary" className="hidden sm:flex">
                          {log.tags[0]}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {/* FAB */}
        <div className="fixed bottom-20 right-4 max-w-[960px] mx-auto left-0 right-0 pointer-events-none">
          <div className="flex justify-end">
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg pointer-events-auto"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Add Dialog */}
        <AddDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          category="logs"
        />
      </div>
    </AppLayout>
  )
}