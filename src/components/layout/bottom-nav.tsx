"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ClipboardList, Package, BookOpen, ChefHat, BarChart3 } from "@/lib/icons"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/",
    label: "Главная",
    icon: LayoutDashboard,
    shortLabel: "Главная",
  },
  {
    href: "/logs",
    label: "Учёт",
    icon: ClipboardList,
    shortLabel: "Учёт",
  },
  {
    href: "/items",
    label: "Каталог",
    icon: Package,
    shortLabel: "Каталог",
  },
  {
    href: "/books",
    label: "Книги",
    icon: BookOpen,
    shortLabel: "Книги",
  },
  {
    href: "/recipes",
    label: "Рецепты",
    icon: ChefHat,
    shortLabel: "Рецепты",
  },
  {
    href: "/analytics",
    label: "Аналитика",
    icon: BarChart3,
    shortLabel: "Статист.",
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-2">
      <nav className="w-full max-w-[960px] border border-border rounded-t-2xl border-b-0 bg-background safe-bottom">
        <div className="flex h-16 items-center justify-around px-1 sm:px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-xl transition-colors",
                  "min-w-0 flex-1 py-2 px-1 sm:px-3", // Гибкая ширина с min-width
                  "min-h-[48px]", // Минимальный touch target 48px
                  "active:scale-95", // tactile feedback
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium truncate max-w-full">
                  {item.shortLabel}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
