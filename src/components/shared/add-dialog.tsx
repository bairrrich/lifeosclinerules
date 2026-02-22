"use client"

import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import {
  Utensils,
  Dumbbell,
  Wallet,
  Pill,
  Leaf,
  Sparkles,
  Package,
  BookOpen,
  ChefHat,
} from "lucide-react"

// Types for different categories
type LogType = "food" | "workout" | "finance"
type ItemType = "vitamin" | "medicine" | "herb" | "cosmetic" | "product"
type ContentType = "book" | "recipe"

// Options for logs
const logOptions = [
  { type: "food" as LogType, label: "Питание", icon: Utensils, color: "bg-orange-500/10 text-orange-500" },
  { type: "workout" as LogType, label: "Тренировка", icon: Dumbbell, color: "bg-blue-500/10 text-blue-500" },
  { type: "finance" as LogType, label: "Финансы", icon: Wallet, color: "bg-green-500/10 text-green-500" },
]

// Options for items
const itemOptions = [
  { type: "vitamin" as ItemType, label: "Витамины", icon: Pill, color: "bg-purple-500/10 text-purple-500" },
  { type: "medicine" as ItemType, label: "Лекарства", icon: Pill, color: "bg-red-500/10 text-red-500" },
  { type: "herb" as ItemType, label: "Травы", icon: Leaf, color: "bg-green-500/10 text-green-500" },
  { type: "cosmetic" as ItemType, label: "Косметика", icon: Sparkles, color: "bg-pink-500/10 text-pink-500" },
  { type: "product" as ItemType, label: "Продукты", icon: Package, color: "bg-yellow-500/10 text-yellow-500" },
]

// Options for content
const contentOptions = [
  { type: "book" as ContentType, label: "Книга", icon: BookOpen, color: "bg-blue-500/10 text-blue-500" },
  { type: "recipe" as ContentType, label: "Рецепт", icon: ChefHat, color: "bg-amber-500/10 text-amber-500" },
]

type CategoryType = "logs" | "items" | "content"

interface AddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryType
}

export function AddDialog({ open, onOpenChange, category }: AddDialogProps) {
  const router = useRouter()

  const options = category === "logs" 
    ? logOptions 
    : category === "items" 
      ? itemOptions 
      : contentOptions

  const title = category === "logs" 
    ? "Добавить запись" 
    : category === "items" 
      ? "Добавить в каталог" 
      : "Добавить контент"

  const handleSelect = (type: string) => {
    onOpenChange(false)
    router.push(`/${category}/${type}/new`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {options.map((option) => (
            <Card
              key={option.type}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleSelect(option.type)}
            >
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${option.color}`}>
                  <option.icon className="h-6 w-6" />
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