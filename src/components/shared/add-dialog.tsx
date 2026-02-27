"use client"

import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import {
  Utensils,
  Dumbbell,
  Wallet,
  Pill,
  Bandage,
  Leaf,
  Sparkles,
  Package,
  BookOpen,
  ChefHat,
  Coffee,
  Martini,
} from "@/lib/icons"

// Types for different categories
type LogType = "food" | "workout" | "finance"
type ItemType = "vitamin" | "medicine" | "herb" | "cosmetic" | "product"

// Options for logs
const logOptions = [
  {
    type: "food" as LogType,
    label: "Питание",
    icon: Utensils,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    type: "workout" as LogType,
    label: "Тренировка",
    icon: Dumbbell,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    type: "finance" as LogType,
    label: "Финансы",
    icon: Wallet,
    color: "bg-green-500/10 text-green-500",
  },
]

// Options for items
const itemOptions = [
  {
    type: "vitamin" as ItemType,
    label: "Витамины",
    icon: Pill,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    type: "medicine" as ItemType,
    label: "Лекарства",
    icon: Bandage,
    color: "bg-red-500/10 text-red-500",
  },
  { type: "herb" as ItemType, label: "Травы", icon: Leaf, color: "bg-green-500/10 text-green-500" },
  {
    type: "cosmetic" as ItemType,
    label: "Косметика",
    icon: Sparkles,
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    type: "product" as ItemType,
    label: "Продукты",
    icon: Package,
    color: "bg-yellow-500/10 text-yellow-500",
  },
]

// Options for books
const bookOptions = [
  {
    type: "book",
    label: "Книга",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-500",
    route: "/books/new",
  },
]

// Options for recipes
const recipeOptions = [
  {
    type: "food",
    label: "Блюдо",
    icon: ChefHat,
    color: "bg-orange-500/10 text-orange-500",
    route: "/recipes/new?type=food",
  },
  {
    type: "drink",
    label: "Напиток",
    icon: Coffee,
    color: "bg-blue-500/10 text-blue-500",
    route: "/recipes/new?type=drink",
  },
  {
    type: "cocktail",
    label: "Коктейль",
    icon: Martini,
    color: "bg-purple-500/10 text-purple-500",
    route: "/recipes/new?type=cocktail",
  },
]

type CategoryType = "logs" | "items" | "books" | "recipes"

interface AddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryType
}

export function AddDialog({ open, onOpenChange, category }: AddDialogProps) {
  const router = useRouter()

  const getOptions = () => {
    switch (category) {
      case "logs":
        return logOptions
      case "items":
        return itemOptions
      case "books":
        return bookOptions
      case "recipes":
        return recipeOptions
      default:
        return []
    }
  }

  const getTitle = () => {
    switch (category) {
      case "logs":
        return "Добавить запись"
      case "items":
        return "Добавить в каталог"
      case "books":
        return "Добавить книгу"
      case "recipes":
        return "Добавить рецепт"
      default:
        return "Добавить"
    }
  }

  const handleSelect = (type: string) => {
    onOpenChange(false)

    if (category === "logs") {
      router.push(`/logs/${type}/new`)
    } else if (category === "items") {
      router.push(`/items/${type}/new`)
    } else if (category === "books") {
      router.push("/books/new")
    } else if (category === "recipes") {
      router.push("/recipes/new")
    }
  }

  const options = getOptions()
  const title = getTitle()

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div
          className={
            category === "recipes" ? "grid grid-cols-3 gap-3 mt-2" : "grid grid-cols-2 gap-3 mt-2"
          }
        >
          {options.map((option) => (
            <Card
              key={option.type}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleSelect(option.type)}
            >
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${option.color}`}
                >
                  {"icon" in option && <option.icon className="h-6 w-6" />}
                </div>
                <span className="font-medium text-sm">{option.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
