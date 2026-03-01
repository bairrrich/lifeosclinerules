/**
 * Конфигурация навигации приложения
 * Централизованное хранилище для элементов меню и быстрых действий
 */

import {
  LayoutDashboard,
  ClipboardList,
  Package,
  BookOpen,
  ChefHat,
  BarChart3,
  Utensils,
  Dumbbell,
  Wallet,
  Droplet,
  Moon,
  Smile,
  Flame,
  Target,
  Search,
  Settings,
} from "@/lib/icons"
import type { ElementType } from "react"

// ============================================
// BOTTOM NAVIGATION
// ============================================

export interface NavItem {
  href: string
  translationKey: string
  icon: ElementType
}

export const bottomNavItems: NavItem[] = [
  {
    href: "/",
    translationKey: "home",
    icon: LayoutDashboard,
  },
  {
    href: "/logs",
    translationKey: "logs",
    icon: ClipboardList,
  },
  {
    href: "/items",
    translationKey: "catalog",
    icon: Package,
  },
  {
    href: "/books",
    translationKey: "books",
    icon: BookOpen,
  },
  {
    href: "/recipes",
    translationKey: "recipes",
    icon: ChefHat,
  },
  {
    href: "/analytics",
    translationKey: "analytics",
    icon: BarChart3,
  },
]

// ============================================
// GLOBAL SEARCH - TYPE CONFIG
// ============================================

export interface SearchTypeConfig {
  icon: ElementType
  color: string
  href: string
  translationKey: string
}

export const searchTypeConfig: Record<string, SearchTypeConfig> = {
  food: { icon: Utensils, color: "text-orange-500", href: "/logs/food", translationKey: "food" },
  workout: {
    icon: Dumbbell,
    color: "text-blue-500",
    href: "/logs/workout",
    translationKey: "workout",
  },
  finance: {
    icon: Wallet,
    color: "text-green-500",
    href: "/logs/finance",
    translationKey: "finance",
  },
  book: { icon: BookOpen, color: "text-amber-500", href: "/books", translationKey: "books" },
  recipe: { icon: ChefHat, color: "text-rose-500", href: "/recipes", translationKey: "recipes" },
  water: { icon: Droplet, color: "text-cyan-500", href: "/water", translationKey: "water" },
  sleep: { icon: Moon, color: "text-indigo-500", href: "/sleep", translationKey: "sleep" },
  mood: { icon: Smile, color: "text-yellow-500", href: "/mood", translationKey: "mood" },
  habit: { icon: Flame, color: "text-red-500", href: "/habits", translationKey: "habits" },
  goal: { icon: Target, color: "text-emerald-500", href: "/goals", translationKey: "goals" },
}

// ============================================
// GLOBAL SEARCH - QUICK ACTIONS
// ============================================

export interface QuickAction {
  translationKey: string
  href: string
  icon: ElementType
  color: string
}

export const quickActions: QuickAction[] = [
  {
    translationKey: "addFood",
    href: "/logs/food/new",
    icon: Utensils,
    color: "text-orange-500",
  },
  {
    translationKey: "addWorkout",
    href: "/logs/workout/new",
    icon: Dumbbell,
    color: "text-blue-500",
  },
  {
    translationKey: "addExpense",
    href: "/logs/finance/new",
    icon: Wallet,
    color: "text-green-500",
  },
  {
    translationKey: "addBook",
    href: "/books/new",
    icon: BookOpen,
    color: "text-amber-500",
  },
  {
    translationKey: "addRecipe",
    href: "/recipes/new",
    icon: ChefHat,
    color: "text-rose-500",
  },
  {
    translationKey: "logWater",
    href: "/water",
    icon: Droplet,
    color: "text-cyan-500",
  },
  {
    translationKey: "logSleep",
    href: "/sleep",
    icon: Moon,
    color: "text-indigo-500",
  },
  {
    translationKey: "logMood",
    href: "/mood",
    icon: Smile,
    color: "text-yellow-500",
  },
  {
    translationKey: "analytics",
    href: "/analytics",
    icon: Search,
    color: "text-purple-500",
  },
  {
    translationKey: "settings",
    href: "/settings",
    icon: Settings,
    color: "text-gray-500",
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Получить элемент навигации по href
 */
export function getNavItem(href: string): NavItem | undefined {
  return bottomNavItems.find(
    (item) => item.href === href || (item.href !== "/" && href.startsWith(item.href))
  )
}

/**
 * Получить конфигурацию типа для поиска
 */
export function getSearchTypeConfig(type: string): SearchTypeConfig | undefined {
  return searchTypeConfig[type]
}

/**
 * Получить быстрое действие по href
 */
export function getQuickAction(href: string): QuickAction | undefined {
  return quickActions.find((action) => action.href === href)
}
