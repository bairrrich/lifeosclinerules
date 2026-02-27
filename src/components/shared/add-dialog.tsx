"use client"

import { useRouter } from "@/lib/navigation"
import { useTranslations } from "next-intl"
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
    label: "food",
    icon: Utensils,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    type: "workout" as LogType,
    label: "workout",
    icon: Dumbbell,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    type: "finance" as LogType,
    label: "finance",
    icon: Wallet,
    color: "bg-green-500/10 text-green-500",
  },
]

// Options for items
const itemOptions = [
  {
    type: "vitamin" as ItemType,
    label: "vitamins",
    icon: Pill,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    type: "medicine" as ItemType,
    label: "medicine",
    icon: Bandage,
    color: "bg-red-500/10 text-red-500",
  },
  { type: "herb" as ItemType, label: "herbs", icon: Leaf, color: "bg-green-500/10 text-green-500" },
  {
    type: "cosmetic" as ItemType,
    label: "cosmetics",
    icon: Sparkles,
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    type: "product" as ItemType,
    label: "products",
    icon: Package,
    color: "bg-yellow-500/10 text-yellow-500",
  },
]

// Options for books
const bookOptions = [
  {
    type: "book",
    label: "book",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-500",
    route: "/books/new",
  },
]

// Options for recipes
const recipeOptions = [
  {
    type: "food",
    label: "dish",
    icon: ChefHat,
    color: "bg-orange-500/10 text-orange-500",
    route: "/recipes/new?type=food",
  },
  {
    type: "drink",
    label: "drink",
    icon: Coffee,
    color: "bg-blue-500/10 text-blue-500",
    route: "/recipes/new?type=drink",
  },
  {
    type: "cocktail",
    label: "cocktail",
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
  const t = useTranslations("common.addDialog")

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
        return t("addLog")
      case "items":
        return t("addCatalog")
      case "books":
        return t("addBook")
      case "recipes":
        return t("addRecipe")
      default:
        return t("addLog")
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
                <span className="font-medium text-sm">{t(option.label)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
