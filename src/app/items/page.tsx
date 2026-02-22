"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pill, Leaf, Sparkles, Package, Plus, Search, LucideIcon } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddDialog } from "@/components/shared/add-dialog"
import { db, initializeDatabase } from "@/lib/db"
import type { Item, ItemType } from "@/types"

const itemTypes = [
  { type: "vitamin" as ItemType, label: "Витамины", icon: Pill, color: "bg-purple-500/10 text-purple-500" },
  { type: "medicine" as ItemType, label: "Лекарства", icon: Pill, color: "bg-red-500/10 text-red-500" },
  { type: "herb" as ItemType, label: "Травы", icon: Leaf, color: "bg-green-500/10 text-green-500" },
  { type: "cosmetic" as ItemType, label: "Косметика", icon: Sparkles, color: "bg-pink-500/10 text-pink-500" },
  { type: "product" as ItemType, label: "Продукты", icon: Package, color: "bg-yellow-500/10 text-yellow-500" },
]

export default function ItemsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeType, setActiveType] = useState<ItemType | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()
        const allItems = await db.items.orderBy("name").toArray()
        setItems(allItems)
      } catch (error) {
        console.error("Failed to load items:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = activeType === null || item.type === activeType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: ItemType): LucideIcon => {
    switch (type) {
      case "vitamin":
        return Pill
      case "medicine":
        return Pill
      case "herb":
        return Leaf
      case "cosmetic":
        return Sparkles
      case "product":
        return Package
      default:
        return Package
    }
  }

  const getTypeColor = (type: ItemType) => {
    switch (type) {
      case "vitamin":
        return "bg-purple-500/10 text-purple-500"
      case "medicine":
        return "bg-red-500/10 text-red-500"
      case "herb":
        return "bg-green-500/10 text-green-500"
      case "cosmetic":
        return "bg-pink-500/10 text-pink-500"
      case "product":
        return "bg-yellow-500/10 text-yellow-500"
    }
  }

  return (
    <AppLayout title="Каталог">
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
          {itemTypes.map((it) => (
            <Button
              key={it.type}
              variant={activeType === it.type ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveType(it.type)}
            >
              <it.icon className="h-4 w-4 mr-2" />
              {it.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по каталогу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Items List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {items.length === 0
                ? "Каталог пуст. Добавьте первый элемент!"
                : "Ничего не найдено"}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const TypeIcon = getTypeIcon(item.type)
              return (
                <Link key={item.id} href={`/items/${item.type}/${item.id}`}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${getTypeColor(item.type)}`}
                      >
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.category || item.description || "Без описания"}
                        </p>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <Badge variant="secondary" className="hidden sm:flex">
                          {item.tags[0]}
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
          category="items"
        />
      </div>
    </AppLayout>
  )
}