"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, ChefHat, Plus, Search, Star, LucideIcon } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddDialog } from "@/components/shared/add-dialog"
import { db, initializeDatabase } from "@/lib/db"
import type { Content, ContentType } from "@/types"

const contentTypes = [
  { type: "book" as ContentType, label: "Книги", icon: BookOpen, color: "bg-blue-500/10 text-blue-500" },
  { type: "recipe" as ContentType, label: "Рецепты", icon: ChefHat, color: "bg-amber-500/10 text-amber-500" },
]

export default function ContentPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [contents, setContents] = useState<Content[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeType, setActiveType] = useState<ContentType | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()
        const allContent = await db.content.orderBy("title").toArray()
        setContents(allContent)
      } catch (error) {
        console.error("Failed to load content:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredContent = contents.filter((content) => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = activeType === null || content.type === activeType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: ContentType): LucideIcon => {
    switch (type) {
      case "book":
        return BookOpen
      case "recipe":
        return ChefHat
      default:
        return BookOpen
    }
  }

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case "book":
        return "bg-blue-500/10 text-blue-500"
      case "recipe":
        return "bg-amber-500/10 text-amber-500"
    }
  }

  return (
    <AppLayout title="Контент">
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
          {contentTypes.map((ct) => (
            <Button
              key={ct.type}
              variant={activeType === ct.type ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveType(ct.type)}
            >
              <ct.icon className="h-4 w-4 mr-2" />
              {ct.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по контенту..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        ) : filteredContent.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {contents.length === 0
                ? "Контент пуст. Добавьте первую запись!"
                : "Ничего не найдено"}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredContent.map((content) => {
              const TypeIcon = getTypeIcon(content.type)
              return (
                <Link key={content.id} href={`/content/${content.type}/${content.id}`}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${getTypeColor(content.type)}`}
                      >
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{content.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {content.description || "Без описания"}
                        </p>
                      </div>
                      {content.rating !== undefined && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm">{content.rating}</span>
                        </div>
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
          category="content"
        />
      </div>
    </AppLayout>
  )
}