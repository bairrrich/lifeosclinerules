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
    translationKey: "items",
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
  label: string
}

export const searchTypeConfig: Record<string, SearchTypeConfig> = {
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

// ============================================
// GLOBAL SEARCH - QUICK ACTIONS
// ============================================

export interface QuickAction {
  title: string
  href: string
  icon: ElementType
  color: string
}

export const quickActions: QuickAction[] = [
  { title: "Добавить питание", href: "/logs/food/new", icon: Utensils, color: "text-orange-500" },
  {
    title: "Добавить тренировку",
    href: "/logs/workout/new",
    icon: Dumbbell,
    color: "text-blue-500",
  },
  { title: "Добавить расход", href: "/logs/finance/new", icon: Wallet, color: "text-green-500" },
  { title: "Добавить книгу", href: "/books/new", icon: BookOpen, color: "text-amber-500" },
  { title: "Добавить рецепт", href: "/recipes/new", icon: ChefHat, color: "text-rose-500" },
  { title: "Записать воду", href: "/water", icon: Droplet, color: "text-cyan-500" },
  { title: "Записать сон", href: "/sleep", icon: Moon, color: "text-indigo-500" },
  { title: "Записать настроение", href: "/mood", icon: Smile, color: "text-yellow-500" },
  { title: "Аналитика", href: "/analytics", icon: Search, color: "text-purple-500" },
  { title: "Настройки", href: "/settings", icon: Settings, color: "text-gray-500" },
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
