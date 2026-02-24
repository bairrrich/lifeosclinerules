"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  BookOpen,
  ChefHat,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/",
    label: "Главная",
    icon: LayoutDashboard,
  },
  {
    href: "/logs",
    label: "Учет",
    icon: ClipboardList,
  },
  {
    href: "/items",
    label: "Каталог",
    icon: Package,
  },
  {
    href: "/books",
    label: "Книги",
    icon: BookOpen,
  },
  {
    href: "/recipes",
    label: "Рецепты",
    icon: ChefHat,
  },
  {
    href: "/analytics",
    label: "Аналитика",
    icon: BarChart3,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-2">
      <nav className="w-full max-w-[960px] border border-border rounded-t-2xl border-b-0 bg-background safe-bottom">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}