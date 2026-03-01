"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Pill, Bandage, Leaf, Sparkles, Package, Search } from "@/lib/icons"
import type { LucideIcon } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, initializeDatabase } from "@/lib/db"
import { ItemType } from "@/types"
import type { Item } from "@/types"

export default function ItemsPage() {
  const t = useTranslations("items")
  const tCommon = useTranslations("common")
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeType, setActiveType] = useState<ItemType | "all">("all")

  const itemTypes = [
    { type: ItemType.VITAMIN, label: t("list.types.vitamin"), icon: Pill },
    { type: ItemType.MEDICINE, label: t("list.types.medicine"), icon: Bandage },
    { type: ItemType.HERB, label: t("list.types.herb"), icon: Leaf },
    { type: ItemType.COSMETIC, label: t("list.types.cosmetic"), icon: Sparkles },
    { type: ItemType.PRODUCT, label: t("list.types.product"), icon: Package },
  ]

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
        return Bandage
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
    <AppLayout title={t("list.title")}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Статистика */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">{t("list.stats.total")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.vitamin}</div>
            <div className="text-xs text-muted-foreground">{t("list.types.vitamin")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.medicine}</div>
            <div className="text-xs text-muted-foreground">{t("list.types.medicine")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.herb}</div>
            <div className="text-xs text-muted-foreground">{t("list.types.herb")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-pink-500">{stats.cosmetic}</div>
            <div className="text-xs text-muted-foreground">{t("list.types.cosmetic")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.product}</div>
            <div className="text-xs text-muted-foreground">{t("list.types.product")}</div>
          </Card>
        </div>

        {/* Type Filters */}
        <Tabs
          value={activeType}
          onValueChange={(value) => setActiveType(value as ItemType | "all")}
        >
          <TabsList className="grid grid-cols-6 w-full h-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              <Search className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">{t("list.filters.all")}</span>
            </TabsTrigger>
            {itemTypes.map((it) => (
              <TabsTrigger
                key={it.type}
                value={it.type}
                className="text-xs sm:text-sm px-1 sm:px-3 py-2"
              >
                <it.icon className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:ml-1">{it.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("list.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Items List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {tCommon("loading")}
            </CardContent>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {items.length === 0 ? t("list.empty.noItems") : tCommon("noResults")}
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
      </div>
    </AppLayout>
  )
}
