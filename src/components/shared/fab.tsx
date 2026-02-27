"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  X,
  Utensils,
  Dumbbell,
  Wallet,
  Droplets,
  Moon,
  Smile,
  BookOpen,
  ChefHat,
  Ruler,
  Target,
  Bell,
  Flame,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuickMoodDialog } from "./quick-mood-dialog"

interface FabAction {
  icon: React.ReactNode
  label: string
  href?: string
  color: string
  action?: "mood" | "navigate"
}

const actions: FabAction[] = [
  {
    icon: <Utensils className="h-5 w-5" />,
    label: "Еда",
    href: "/logs/food/new",
    color: "bg-orange-500",
    action: "navigate",
  },
  {
    icon: <Dumbbell className="h-5 w-5" />,
    label: "Тренировка",
    href: "/logs/workout/new",
    color: "bg-purple-500",
    action: "navigate",
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    label: "Финансы",
    href: "/logs/finance/new",
    color: "bg-green-500",
    action: "navigate",
  },
  {
    icon: <Droplets className="h-5 w-5" />,
    label: "Вода",
    href: "/water",
    color: "bg-blue-500",
    action: "navigate",
  },
  {
    icon: <Moon className="h-5 w-5" />,
    label: "Сон",
    href: "/sleep",
    color: "bg-indigo-500",
    action: "navigate",
  },
  {
    icon: <Smile className="h-5 w-5" />,
    label: "Настроение",
    color: "bg-pink-500",
    action: "mood",
  },
  {
    icon: <Ruler className="h-5 w-5" />,
    label: "Измерения",
    href: "/body",
    color: "bg-cyan-500",
    action: "navigate",
  },
  {
    icon: <Flame className="h-5 w-5" />,
    label: "Привычка",
    href: "/habits",
    color: "bg-rose-500",
    action: "navigate",
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: "Цель",
    href: "/goals",
    color: "bg-emerald-500",
    action: "navigate",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: "Напоминание",
    href: "/reminders",
    color: "bg-yellow-500",
    action: "navigate",
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: "Книга",
    href: "/books/new",
    color: "bg-amber-500",
    action: "navigate",
  },
  {
    icon: <ChefHat className="h-5 w-5" />,
    label: "Рецепт",
    href: "/recipes/new",
    color: "bg-red-500",
    action: "navigate",
  },
]

export function FAB() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false)
  const router = useRouter()

  const handleAction = (action: FabAction) => {
    setIsOpen(false)

    if (action.action === "mood") {
      setIsMoodDialogOpen(true)
    } else if (action.href) {
      router.push(action.href)
    }
  }

  return (
    <>
      <div className="fixed bottom-24 right-4 z-40">
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Action buttons - simple grid popup */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-card border rounded-2xl shadow-xl p-3 z-50 w-64">
            <div className="grid grid-cols-3 gap-2">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleAction(action)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className={`${action.color} text-white p-2 rounded-full`}>{action.icon}</div>
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main FAB button */}
        <Button
          size="icon"
          className={`h-14 w-14 rounded-full shadow-lg z-40 transition-transform duration-200 ${
            isOpen ? "bg-destructive rotate-45" : "bg-primary"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {/* Quick Mood Dialog */}
      <QuickMoodDialog open={isMoodDialogOpen} onOpenChange={setIsMoodDialogOpen} />
    </>
  )
}
