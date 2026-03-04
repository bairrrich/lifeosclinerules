"use client"

import { useState } from "react"
import { useRouter } from "@/lib/navigation"
import { useTranslations } from "next-intl"
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
  Pill,
  PillBottle,
  Leaf,
  Sparkles,
  ShoppingCart,
  HeartPulse,
} from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { AddMoodDialog } from "../dialogs/add-mood-dialog"
import { moduleColors, itemColors, fabColor, type ModuleType } from "@/lib/theme-colors"
import { cn } from "@/lib/utils"
import type { ItemType } from "@/types"

interface FabAction {
  icon: React.ReactNode
  label: string
  href?: string
  module: ModuleType
  action?: "mood" | "navigate"
}

export function FAB() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false)
  const router = useRouter()
  const t = useTranslations("fab")

  const actions: FabAction[] = [
    {
      icon: <Utensils className="h-5 w-5" />,
      label: t("food"),
      href: "/logs/food/new",
      module: "food",
      action: "navigate" as const,
    },
    {
      icon: <Dumbbell className="h-5 w-5" />,
      label: t("workout"),
      href: "/logs/workout/new",
      module: "workout",
      action: "navigate" as const,
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: t("finance"),
      href: "/logs/finance/new",
      module: "finance",
      action: "navigate" as const,
    },
    {
      icon: <Droplets className="h-5 w-5" />,
      label: t("water"),
      href: "/water?add=true",
      module: "water",
      action: "navigate" as const,
    },
    {
      icon: <Moon className="h-5 w-5" />,
      label: t("sleep"),
      href: "/sleep?add=true",
      module: "sleep",
      action: "navigate" as const,
    },
    {
      icon: <Smile className="h-5 w-5" />,
      label: t("mood"),
      module: "mood",
      action: "mood" as const,
    },
    {
      icon: <Ruler className="h-5 w-5" />,
      label: t("measurements"),
      href: "/body?add=true",
      module: "goals",
      action: "navigate" as const,
    },
    {
      icon: <Flame className="h-5 w-5" />,
      label: t("habit"),
      href: "/habits?add=true",
      module: "habits",
      action: "navigate" as const,
    },
    {
      icon: <Target className="h-5 w-5" />,
      label: t("goal"),
      href: "/goals?add=true",
      module: "goals",
      action: "navigate" as const,
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: t("reminder"),
      href: "/reminders?add=true",
      module: "logs",
      action: "navigate" as const,
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: t("book"),
      href: "/books/new",
      module: "books",
      action: "navigate" as const,
    },
    {
      icon: <ChefHat className="h-5 w-5" />,
      label: t("recipe"),
      href: "/recipes/new",
      module: "recipes",
      action: "navigate" as const,
    },
    {
      icon: <Pill className="h-5 w-5" />,
      label: t("vitamins"),
      href: "/items/vitamin/new",
      module: "habits",
      action: "navigate" as const,
    },
    {
      icon: <PillBottle className="h-5 w-5" />,
      label: t("medicine"),
      href: "/items/medicine/new",
      module: "mood",
      action: "navigate" as const,
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      label: t("herbs"),
      href: "/items/herb/new",
      module: "food",
      action: "navigate" as const,
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      label: t("cosmetics"),
      href: "/items/cosmetic/new",
      module: "mood",
      action: "navigate" as const,
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      label: t("products"),
      href: "/items/product/new",
      module: "food",
      action: "navigate" as const,
    },
  ]

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

        {/* Action buttons - scrollable grid popup */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-card border rounded-2xl shadow-xl p-2 sm:p-3 z-50 w-[280px] sm:w-72 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto overscroll-contain">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {actions.map((action) => {
                // Determine color scheme: use itemColors for item-type actions, otherwise moduleColors
                const isItemAction = action.href?.startsWith("/items/")
                let bgColorClass: string

                if (isItemAction && action.href) {
                  // Extract item type from href (e.g., "/items/vitamin/new" -> "vitamin")
                  const hrefParts = action.href.split("/")
                  const itemType = hrefParts[2] as ItemType
                  bgColorClass = itemColors[itemType]?.DEFAULT || moduleColors[action.module].light
                } else {
                  bgColorClass = moduleColors[action.module].light
                }

                return (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action)}
                    className="flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl hover:bg-accent transition-colors min-h-[64px] sm:min-h-[72px]"
                  >
                    <div className={cn(bgColorClass, "text-white p-2 rounded-full")}>
                      {action.icon}
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                      {action.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Main FAB button */}
        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg z-40 transition-transform duration-200",
            isOpen ? "bg-destructive rotate-45" : fabColor.DEFAULT
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? t("closeMenu") : t("openMenu")}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {/* Quick Mood Dialog */}
      <AddMoodDialog open={isMoodDialogOpen} onOpenChange={setIsMoodDialogOpen} />
    </>
  )
}
