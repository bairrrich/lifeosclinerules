"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { db, initializeDatabase } from "@/lib/db"
import type { Log, Book, Content } from "@/types"
import {
  Utensils,
  Dumbbell,
  Wallet,
  BookOpen,
  ChefHat,
  Search,
  Droplet,
  Moon,
  Smile,
  Flame,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  type: string
  href: string
  icon: React.ElementType
  color: string
  subtitle?: string
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; href: string; label: string }> = {
  food: { icon: Utensils, color: "text-orange-500", href: "/logs/food", label: "Питание" },
  workout: { icon: Dumbbell, color: "text-blue-500", href: "/logs/workout", label: "Тренировка" },
  finance: { icon: Wallet, color: "text-green-500", href: "/logs/finance", label: "Финансы" },
  book: { icon: BookOpen, color: "text-amber-500", href: "/books", label: "Книга" },
  recipe: { icon: ChefHat, color: "text-rose-500", href: "/recipes", label: "Рецепт" },
  water: { icon: Droplet, color: "text-cyan-500", href: "/water", label: "Вода" },
  sleep: { icon: Moon, color: "text-indigo-500", href: "/sleep", label: "Сон" },
  mood: { icon: Smile, color: "text-yellow-500", href: "/mood", label: "Настроение" },
  habit: { icon: Flame, color: "text-red-500", href: "/habits", label: "Привычка" },
  goal: { icon: Target, color: "text-emerald-500", href: "/goals", label: "Цель" },
}

const quickActions = [
  { title: "Добавить питание", href: "/logs/food/new", icon: Utensils, color: "text-orange-500" },
  { title: "Добавить тренировку", href: "/logs/workout/new", icon: Dumbbell, color: "text-blue-500" },
  { title: "Добавить расход", href: "/logs/finance/new", icon: Wallet, color: "text-green-500" },
  { title: "Добавить книгу", href: "/books/new", icon: BookOpen, color: "text-amber-500" },
  { title: "Добавить рецепт", href: "/recipes/new", icon: ChefHat, color: "text-rose-500" },
  { title: "Записать воду", href: "/water", icon: Droplet, color: "text-cyan-500" },
  { title: "Записать сон", href: "/sleep", icon: Moon, color: "text-indigo-500" },
  { title: "Записать настроение", href: "/mood", icon: Smile, color: "text-yellow-500" },
  { title: "Аналитика", href: "/analytics", icon: Search, color: "text-purple-500" },
  { title: "Настройки", href: "/settings", icon: Search, color: "text-gray-500" },
]

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Открытие по Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
      
      // Навигация по результатам
      if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
        } else if (e.key === "Enter" && results[selectedIndex]) {
          e.preventDefault()
          router.push(results[selectedIndex].href)
          setOpen(false)
          setQuery("")
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, results, selectedIndex, router])

  // Поиск при изменении запроса
  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setSelectedIndex(0)
      return
    }

    if (query.length === 0) {
      // Показываем быстрые действия
      setResults(
        quickActions.map((action) => ({
          id: action.href,
          title: action.title,
          type: "action",
          href: action.href,
          icon: action.icon,
          color: action.color,
        }))
      )
      return
    }

    const searchTimer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(searchTimer)
  }, [query, open])

  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    try {
      await initializeDatabase()
      
      const lowerQuery = searchQuery.toLowerCase()
      const searchResults: SearchResult[] = []

      // Ищем в логах
      const logs = await db.logs
        .filter((log: Log) => 
          !!(log.title?.toLowerCase().includes(lowerQuery) ||
          log.notes?.toLowerCase().includes(lowerQuery))
        )
        .limit(5)
        .toArray()

      logs.forEach((log: Log) => {
        const config = typeConfig[log.type] || typeConfig.food
        searchResults.push({
          id: log.id,
          title: log.title || "Без названия",
          type: log.type,
          href: `/logs/${log.type}/${log.id}`,
          icon: config.icon,
          color: config.color,
          subtitle: `${config.label} • ${new Date(log.date).toLocaleDateString('ru-RU')}`,
        })
      })

      // Ищем в книгах
      const books = await db.books
        .filter((book: Book) => 
          !!(book.title?.toLowerCase().includes(lowerQuery))
        )
        .limit(5)
        .toArray()

      books.forEach((book: Book) => {
        searchResults.push({
          id: book.id,
          title: book.title,
          type: "book",
          href: `/books/${book.id}`,
          icon: BookOpen,
          color: "text-amber-500",
          subtitle: "Книга",
        })
      })

      // Ищем в рецептах
      const recipes = await db.content
        .where("type")
        .equals("recipe")
        .filter((item: Content) => 
          !!(item.title?.toLowerCase().includes(lowerQuery))
        )
        .limit(5)
        .toArray()

      recipes.forEach((recipe: Content) => {
        searchResults.push({
          id: recipe.id,
          title: recipe.title,
          type: "recipe",
          href: `/recipes/${recipe.id}`,
          icon: ChefHat,
          color: "text-rose-500",
          subtitle: "Рецепт",
        })
      })

      // Ищем в привычках
      const habits = await db.habits
        .filter((habit: { name: string; id: string }) => 
          !!(habit.name?.toLowerCase().includes(lowerQuery))
        )
        .limit(3)
        .toArray()

      habits.forEach((habit: { name: string; id: string }) => {
        searchResults.push({
          id: habit.id,
          title: habit.name,
          type: "habit",
          href: `/habits`,
          icon: Flame,
          color: "text-red-500",
          subtitle: "Привычка",
        })
      })

      setResults(searchResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
    setQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 max-w-lg">
        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            placeholder="Поиск... (Cmd+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            autoFocus
          />
          {isLoading && (
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {results.length === 0 && query.length > 0 && !isLoading && (
            <div className="py-8 text-center text-muted-foreground">
              Ничего не найдено
            </div>
          )}
          
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors",
                index === selectedIndex && "bg-accent"
              )}
            >
              <div className={cn("p-2 rounded-lg bg-muted", result.color)}>
                <result.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{result.title}</div>
                {result.subtitle && (
                  <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground flex justify-between">
          <span>↑↓ для навигации</span>
          <span>Enter для выбора</span>
          <span>Esc для закрытия</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}