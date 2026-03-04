"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Pill, PillBottle, Bandage, Leaf, Sparkles, ShoppingCart, Search } from "@/lib/icons"
import type { LucideIcon } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, initializeDatabase } from "@/lib/db"
import { cn } from "@/lib/utils"
import { ItemType } from "@/types"
import type { Item } from "@/types"
import { itemColors } from "@/lib/theme-colors"

export default function ItemsPage() {
  const t = useTranslations("items")
  const tCommon = useTranslations("common")
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeType, setActiveType] = useState<ItemType | "all">("all")

  const itemTypes = [
    { type: ItemType.VITAMIN, label: t("list.types.vitamin"), icon: Pill },
    { type: ItemType.MEDICINE, label: t("list.types.medicine"), icon: PillBottle },
    { type: ItemType.HERB, label: t("list.types.herb"), icon: Leaf },
    { type: ItemType.COSMETIC, label: t("list.types.cosmetic"), icon: Sparkles },
    { type: ItemType.PRODUCT, label: t("list.types.product"), icon: ShoppingCart },
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
        return PillBottle
      case "herb":
        return Leaf
      case "cosmetic":
        return Sparkles
      case "product":
        return ShoppingCart
      default:
        return ShoppingCart
    }
  }

  const getTypeColor = (type: ItemType) => {
    switch (type) {
      case "vitamin":
        return itemColors.vitamin.DEFAULT
      case "medicine":
        return itemColors.medicine.DEFAULT
      case "herb":
        return itemColors.herb.DEFAULT
      case "cosmetic":
        return itemColors.cosmetic.DEFAULT
      case "product":
        return itemColors.product.DEFAULT
    }
  }

  const getTabsListColor = (type: ItemType | "all"): string => {
    switch (type) {
      case "all":
        return ""
      case "vitamin":
        return "data-[state=active]:bg-[oklch(0.76_0.28_68)] data-[state=active]:text-white"
      case "medicine":
        return "data-[state=active]:bg-[oklch(0.68_0.34_18)] data-[state=active]:text-white"
      case "herb":
        return "data-[state=active]:bg-[oklch(0.72_0.30_122)] data-[state=active]:text-white"
      case "cosmetic":
        return "data-[state=active]:bg-[oklch(0.74_0.31_312)] data-[state=active]:text-white"
      case "product":
        return "data-[state=active]:bg-[oklch(0.78_0.26_208)] data-[state=active]:text-white"
      default:
        return ""
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
            <div className={cn("text-2xl font-bold", itemColors.vitamin.text)}>{stats.vitamin}</div>
            <div className="text-xs text-muted-foreground">{t("list.types.vitamin")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className={cn("text-2xl font-bold", itemColors.medicine.text)}>
              {stats.medicine}
            </div>
            <div className="text-xs text-muted-foreground">{t("list.types.medicine")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className={cn("text-2xl font-bold", itemColors.herb.text)}>{stats.herb}</div>
            <div className="text-xs text-muted-foreground">{t("list.types.herb")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className={cn("text-2xl font-bold", itemColors.cosmetic.text)}>
              {stats.cosmetic}
            </div>
            <div className="text-xs text-muted-foreground">{t("list.types.cosmetic")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className={cn("text-2xl font-bold", itemColors.product.text)}>{stats.product}</div>
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
                className={cn("text-xs sm:text-sm px-1 sm:px-3 py-2", getTabsListColor(it.type))}
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
                    <CardContent className="p-3 flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${getTypeColor(item.type)}`}
                      >
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
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
