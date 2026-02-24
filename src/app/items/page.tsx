"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pill, Leaf, Sparkles, Package, Plus, Search, LucideIcon } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddDialog } from "@/components/shared/add-dialog"
import { db, initializeDatabase } from "@/lib/db"
import { ItemType } from "@/types"
import type { Item } from "@/types"

const itemTypes: { type: ItemType; label: string; icon: LucideIcon }[] = [
  { type: ItemType.VITAMIN, label: "Витамины", icon: Pill },
  { type: ItemType.MEDICINE, label: "Лекарства", icon: Pill },
  { type: ItemType.HERB, label: "Травы", icon: Leaf },
  { type: ItemType.COSMETIC, label: "Косметика", icon: Sparkles },
  { type: ItemType.PRODUCT, label: "Продукты", icon: Package },
]

export default function ItemsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeType, setActiveType] = useState<ItemType | "all">("all")
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
    const matchesType = activeType === "all" || item.type === activeType
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

  // Статистика
  const stats = {
    total: items.length,
    vitamin: items.filter((i) => i.type === ItemType.VITAMIN).length,
    medicine: items.filter((i) => i.type === ItemType.MEDICINE).length,
    herb: items.filter((i) => i.type === ItemType.HERB).length,
    cosmetic: items.filter((i) => i.type === ItemType.COSMETIC).length,
    product: items.filter((i) => i.type === ItemType.PRODUCT).length,
  }

  return (
    <AppLayout title="Каталог">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Статистика */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Всего</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.vitamin}</div>
            <div className="text-xs text-muted-foreground">Витамины</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.medicine}</div>
            <div className="text-xs text-muted-foreground">Лекарства</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.herb}</div>
            <div className="text-xs text-muted-foreground">Травы</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-pink-500">{stats.cosmetic}</div>
            <div className="text-xs text-muted-foreground">Косметика</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.product}</div>
            <div className="text-xs text-muted-foreground">Продукты</div>
          </Card>
        </div>

        {/* Type Filters */}
        <Tabs
          value={activeType}
          onValueChange={(value) => setActiveType(value as ItemType | "all")}
        >
          <TabsList className="grid grid-cols-6 w-full h-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              <span className="hidden sm:inline">Все</span>
              <span className="sm:hidden">Все</span>
            </TabsTrigger>
            {itemTypes.map((it) => (
              <TabsTrigger key={it.type} value={it.type} className="text-xs sm:text-sm px-1 sm:px-3 py-2">
                <it.icon className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{it.label}</span>
                <span className="sm:hidden text-[10px]">{it.label.slice(0, 4)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

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
          <div className="flex flex-col gap-2">
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