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
import { navigationColors } from "@/lib/theme-colors"

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
  food: {
    icon: Utensils,
    color: navigationColors.food,
    href: "/logs/food",
    translationKey: "food",
  },
  workout: {
    icon: Dumbbell,
    color: navigationColors.workout,
    href: "/logs/workout",
    translationKey: "workout",
  },
  finance: {
    icon: Wallet,
    color: navigationColors.finance,
    href: "/logs/finance",
    translationKey: "finance",
  },
  book: { icon: BookOpen, color: navigationColors.book, href: "/books", translationKey: "books" },
  recipe: {
    icon: ChefHat,
    color: navigationColors.recipe,
    href: "/recipes",
    translationKey: "recipes",
  },
  water: { icon: Droplet, color: navigationColors.water, href: "/water", translationKey: "water" },
  sleep: { icon: Moon, color: navigationColors.sleep, href: "/sleep", translationKey: "sleep" },
  mood: { icon: Smile, color: navigationColors.mood, href: "/mood", translationKey: "mood" },
  habit: { icon: Flame, color: navigationColors.habit, href: "/habits", translationKey: "habits" },
  goal: { icon: Target, color: navigationColors.goal, href: "/goals", translationKey: "goals" },
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
    color: navigationColors.food,
  },
  {
    translationKey: "addWorkout",
    href: "/logs/workout/new",
    icon: Dumbbell,
    color: navigationColors.workout,
  },
  {
    translationKey: "addExpense",
    href: "/logs/finance/new",
    icon: Wallet,
    color: navigationColors.finance,
  },
  {
    translationKey: "addBook",
    href: "/books/new",
    icon: BookOpen,
    color: navigationColors.book,
  },
  {
    translationKey: "addRecipe",
    href: "/recipes/new",
    icon: ChefHat,
    color: navigationColors.recipe,
  },
  {
    translationKey: "logWater",
    href: "/water",
    icon: Droplet,
    color: navigationColors.water,
  },
  {
    translationKey: "logSleep",
    href: "/sleep",
    icon: Moon,
    color: navigationColors.sleep,
  },
  {
    translationKey: "logMood",
    href: "/mood",
    icon: Smile,
    color: navigationColors.mood,
  },
  {
    translationKey: "analytics",
    href: "/analytics",
    icon: Search,
    color: navigationColors.analytics,
  },
  {
    translationKey: "settings",
    href: "/settings",
    icon: Settings,
    color: navigationColors.settings,
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
