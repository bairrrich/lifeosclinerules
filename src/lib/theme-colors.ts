/**
 * Централизованная система цветов для модулей Life OS
 *
 * Использует OKLCH цвета для гармоничного восприятия
 * Формат: oklch(L C H) - L (lightness 0-1), C (chroma), H (hue 0-360)
 *
 * @example
 * import { moduleColors } from "@/lib/theme-colors"
 *
 * <div className={moduleColors.food.light}>...</div>
 * <div className={moduleColors.workout.text}>...</div>
 */

import { cn } from "@/lib/utils"

/** Типы модулей в приложении */
export type ModuleType =
  | "food"
  | "workout"
  | "finance"
  | "water"
  | "sleep"
  | "mood"
  | "books"
  | "recipes"
  | "habits"
  | "goals"
  | "logs"
  | "settings"

/** Интерфейс цветовой схемы модуля */
export interface ModuleColorScheme {
  /** Фоновый цвет (обычно light версия) */
  light: string
  /** Основной фоновый цвет */
  DEFAULT: string
  /** Цвет текста */
  text: string
  /** Цвет границы */
  border: string
  /** Glow тень (опционально) */
  shadow?: string
}

/**
 * OKLCH цветовые схемы для модулей
 * oklch(L C H) - L: lightness (0-1), C: chroma, H: hue (0-360)
 */
export const moduleColors: Record<ModuleType, ModuleColorScheme> = {
  food: {
    // oklch(0.70 0.15 40) - сочный терракотовый
    light: "bg-[oklch(0.75_0.12_40)]",
    DEFAULT: "bg-[oklch(0.70_0.15_40)]",
    text: "text-[oklch(0.70_0.15_40)]",
    border: "border-[oklch(0.70_0.15_40)/0.3]",
    shadow: "shadow-[oklch(0.70_0.15_40)/0.15]",
  },
  workout: {
    // oklch(0.65 0.18 250) - яркий электрик
    light: "bg-[oklch(0.70_0.15_250)]",
    DEFAULT: "bg-[oklch(0.65_0.18_250)]",
    text: "text-[oklch(0.65_0.18_250)]",
    border: "border-[oklch(0.65_0.18_250)/0.3]",
    shadow: "shadow-[oklch(0.65_0.18_250)/0.15]",
  },
  finance: {
    // oklch(0.65 0.15 250) - информационный синий
    light: "bg-[oklch(0.70_0.12_250)]",
    DEFAULT: "bg-[oklch(0.65_0.15_250)]",
    text: "text-[oklch(0.65_0.15_250)]",
    border: "border-[oklch(0.65_0.15_250)/0.3]",
    shadow: "shadow-[oklch(0.65_0.15_250)/0.15]",
  },
  water: {
    // oklch(0.75 0.15 190) - насыщенный бирюзовый
    light: "bg-[oklch(0.80_0.12_190)]",
    DEFAULT: "bg-[oklch(0.75_0.15_190)]",
    text: "text-[oklch(0.75_0.15_190)]",
    border: "border-[oklch(0.75_0.15_190)/0.3]",
    shadow: "shadow-[oklch(0.75_0.15_190)/0.15]",
  },
  sleep: {
    // oklch(0.50 0.12 280) - индиго
    light: "bg-[oklch(0.60_0.08_280)]",
    DEFAULT: "bg-[oklch(0.50_0.12_280)]",
    text: "text-[oklch(0.50_0.12_280)]",
    border: "border-[oklch(0.50_0.12_280)/0.3]",
    shadow: "shadow-[oklch(0.50_0.12_280)/0.15]",
  },
  mood: {
    // oklch(0.80 0.20 90) - медово-жёлтый
    light: "bg-[oklch(0.85_0.15_90)]",
    DEFAULT: "bg-[oklch(0.80_0.20_90)]",
    text: "text-[oklch(0.80_0.20_90)]",
    border: "border-[oklch(0.80_0.20_90)/0.3]",
    shadow: "shadow-[oklch(0.80_0.20_90)/0.15]",
  },
  books: {
    // oklch(0.65 0.18 290) - фиолетовый
    light: "bg-[oklch(0.70_0.15_290)]",
    DEFAULT: "bg-[oklch(0.65_0.18_290)]",
    text: "text-[oklch(0.65_0.18_290)]",
    border: "border-[oklch(0.65_0.18_290)/0.3]",
    shadow: "shadow-[oklch(0.65_0.18_290)/0.15]",
  },
  recipes: {
    // oklch(0.70 0.18 10) - коралловый
    light: "bg-[oklch(0.75_0.15_10)]",
    DEFAULT: "bg-[oklch(0.70_0.18_10)]",
    text: "text-[oklch(0.70_0.18_10)]",
    border: "border-[oklch(0.70_0.18_10)/0.3]",
    shadow: "shadow-[oklch(0.70_0.18_10)/0.15]",
  },
  habits: {
    // oklch(0.80 0.15 135) - нежный зелёный
    light: "bg-[oklch(0.85_0.10_135)]",
    DEFAULT: "bg-[oklch(0.80_0.15_135)]",
    text: "text-[oklch(0.80_0.15_135)]",
    border: "border-[oklch(0.80_0.15_135)/0.3]",
    shadow: "shadow-[oklch(0.80_0.15_135)/0.15]",
  },
  goals: {
    // oklch(0.75 0.20 85) - золотистый янтарь
    light: "bg-[oklch(0.80_0.15_85)]",
    DEFAULT: "bg-[oklch(0.75_0.20_85)]",
    text: "text-[oklch(0.75_0.20_85)]",
    border: "border-[oklch(0.75_0.20_85)/0.3]",
    shadow: "shadow-[oklch(0.75_0.20_85)/0.15]",
  },
  logs: {
    // oklch(0.70 0.02 0) - современный серый
    light: "bg-[oklch(0.75_0.01_0)]",
    DEFAULT: "bg-[oklch(0.70_0.02_0)]",
    text: "text-[oklch(0.70_0.02_0)]",
    border: "border-[oklch(0.70_0.02_0)/0.3]",
    shadow: "shadow-[oklch(0.70_0.02_0)/0.08]",
  },
  settings: {
    // Muted/secondary - oklch(0.55 0.02 0)
    light: "bg-[oklch(0.65_0.01_0)]",
    DEFAULT: "bg-[oklch(0.55_0.02_0)]",
    text: "text-[oklch(0.55_0.02_0)]",
    border: "border-[oklch(0.55_0.02_0)/0.3]",
    shadow: "shadow-[oklch(0.55_0.02_0)/0.08]",
  },
}

/**
 * Цвета для финансовых операций
 */
export const financeColors = {
  income: {
    // oklch(0.70 0.20 145) - уверенный зелёный
    light: "bg-[oklch(0.75_0.15_145)]",
    DEFAULT: "bg-[oklch(0.70_0.20_145)]",
    text: "text-[oklch(0.70_0.20_145)]",
  },
  expense: {
    // oklch(0.65 0.22 30) - мягкий красный
    light: "bg-[oklch(0.70_0.18_30)]",
    DEFAULT: "bg-[oklch(0.65_0.22_30)]",
    text: "text-[oklch(0.65_0.22_30)]",
  },
  transfer: {
    // oklch(0.70 0.18 70) - тёплый оранжевый
    light: "bg-[oklch(0.75_0.14_70)]",
    DEFAULT: "bg-[oklch(0.70_0.18_70)]",
    text: "text-[oklch(0.70_0.18_70)]",
  },
} as const

/**
 * Цвета для типов тренировок
 */
export const workoutColors = {
  strength: {
    // oklch(0.60 0.22 25) - мощный красный
    light: "bg-[oklch(0.65_0.18_25)]",
    DEFAULT: "bg-[oklch(0.60_0.22_25)]",
    text: "text-[oklch(0.60_0.22_25)]",
  },
  cardio: {
    // oklch(0.65 0.18 250) - основной электрик
    light: "bg-[oklch(0.70_0.15_250)]",
    DEFAULT: "bg-[oklch(0.65_0.18_250)]",
    text: "text-[oklch(0.65_0.18_250)]",
  },
  yoga: {
    // oklch(0.70 0.15 300) - спокойный лавандовый
    light: "bg-[oklch(0.75_0.12_300)]",
    DEFAULT: "bg-[oklch(0.70_0.15_300)]",
    text: "text-[oklch(0.70_0.15_300)]",
  },
  stretching: {
    // oklch(0.75 0.15 180) - освежающий мятный
    light: "bg-[oklch(0.80_0.12_180)]",
    DEFAULT: "bg-[oklch(0.75_0.15_180)]",
    text: "text-[oklch(0.75_0.15_180)]",
  },
} as const

/**
 * Цвета для типов еды
 */
export const foodColors = {
  breakfast: {
    // oklch(0.78 0.18 85) - энергичный жёлтый
    light: "bg-[oklch(0.82_0.14_85)]",
    DEFAULT: "bg-[oklch(0.78_0.18_85)]",
    text: "text-[oklch(0.78_0.18_85)]",
  },
  lunch: {
    // oklch(0.70 0.15 40) - основной терракотовый
    light: "bg-[oklch(0.75_0.12_40)]",
    DEFAULT: "bg-[oklch(0.70_0.15_40)]",
    text: "text-[oklch(0.70_0.15_40)]",
  },
  dinner: {
    // oklch(0.48 0.10 30) - глубокий шоколадный
    light: "bg-[oklch(0.55_0.08_30)]",
    DEFAULT: "bg-[oklch(0.48_0.10_30)]",
    text: "text-[oklch(0.48_0.10_30)]",
  },
  snack: {
    // oklch(0.80 0.12 70) - лёгкий абрикосовый
    light: "bg-[oklch(0.84_0.10_70)]",
    DEFAULT: "bg-[oklch(0.80_0.12_70)]",
    text: "text-[oklch(0.80_0.12_70)]",
  },
} as const

/**
 * Цвета для типов рецептов
 */
export const recipeColors = {
  food: {
    // oklch(0.72 0.16 30) - персиковый
    light: "bg-[oklch(0.76_0.13_30)]",
    DEFAULT: "bg-[oklch(0.72_0.16_30)]",
    text: "text-[oklch(0.72_0.16_30)]",
  },
  drink: {
    // oklch(0.75 0.14 170) - аквамариновый
    light: "bg-[oklch(0.79_0.11_170)]",
    DEFAULT: "bg-[oklch(0.75_0.14_170)]",
    text: "text-[oklch(0.75_0.14_170)]",
  },
  cocktail: {
    // oklch(0.68 0.16 330) - сиреневый
    light: "bg-[oklch(0.73_0.13_330)]",
    DEFAULT: "bg-[oklch(0.68_0.16_330)]",
    text: "text-[oklch(0.68_0.16_330)]",
  },
} as const

/**
 * Цвет для FAB - яркий терракотовый (oklch(0.70 0.25 40))
 */
export const fabColor = {
  light: "bg-[oklch(0.75_0.20_40)]",
  DEFAULT: "bg-[oklch(0.70_0.25_40)]",
  text: "text-white",
  shadow: "shadow-[oklch(0.70_0.25_40)/0.25]",
}

/**
 * Цвета привычек (мягкие, приятные)
 * oklch(0.80 0.15 135) - нежный зелёный как основа
 * Дополнительные цвета для разнообразия привычек
 */
export const habitColors = [
  {
    // oklch(0.65 0.22 30) - мягкий красный
    bg: "bg-[oklch(0.60_0.22_30)]",
    light: "bg-[oklch(0.70_0.18_30)]",
    text: "text-[oklch(0.65_0.22_30)]",
    name: "Красный",
  },
  {
    // oklch(0.70 0.18 70) - тёплый оранжевый
    bg: "bg-[oklch(0.65_0.18_70)]",
    light: "bg-[oklch(0.75_0.14_70)]",
    text: "text-[oklch(0.70_0.18_70)]",
    name: "Оранжевый",
  },
  {
    // oklch(0.78 0.18 85) - энергичный жёлтый
    bg: "bg-[oklch(0.73_0.18_85)]",
    light: "bg-[oklch(0.82_0.14_85)]",
    text: "text-[oklch(0.78_0.18_85)]",
    name: "Жёлтый",
  },
  {
    // oklch(0.80 0.15 135) - нежный зелёный
    bg: "bg-[oklch(0.75_0.15_135)]",
    light: "bg-[oklch(0.85_0.10_135)]",
    text: "text-[oklch(0.80_0.15_135)]",
    name: "Зелёный",
  },
  {
    // oklch(0.75 0.15 190) - бирюзовый
    bg: "bg-[oklch(0.70_0.15_190)]",
    light: "bg-[oklch(0.80_0.12_190)]",
    text: "text-[oklch(0.75_0.15_190)]",
    name: "Бирюзовый",
  },
  {
    // oklch(0.65 0.18 250) - электрик
    bg: "bg-[oklch(0.60_0.18_250)]",
    light: "bg-[oklch(0.70_0.15_250)]",
    text: "text-[oklch(0.65_0.18_250)]",
    name: "Синий",
  },
  {
    // oklch(0.70 0.15 300) - лавандовый
    bg: "bg-[oklch(0.65_0.15_300)]",
    light: "bg-[oklch(0.75_0.12_300)]",
    text: "text-[oklch(0.70_0.15_300)]",
    name: "Лавандовый",
  },
  {
    // oklch(0.68 0.16 330) - сиреневый
    bg: "bg-[oklch(0.63_0.16_330)]",
    light: "bg-[oklch(0.73_0.13_330)]",
    text: "text-[oklch(0.68_0.16_330)]",
    name: "Сиреневый",
  },
] as const

/** Интерфейс для хелпера создания классов модуля */
export interface ModuleColorHelperOptions {
  module: ModuleType
  variant?: "light" | "DEFAULT" | "text" | "border" | "shadow"
  custom?: string
}

/**
 * Хелпер для получения классов цвета модуля
 *
 * @example
 * // Простой способ
 * <div className={getModuleColor('food', 'light')}>
 *
 * @example
 * // С дополнительными классами
 * <div className={cn(getModuleColor('food', 'light'), "p-4")}>
 */
export function getModuleColor(
  module: ModuleType,
  variant: ModuleColorHelperOptions["variant"] = "light"
): string {
  const scheme = moduleColors[module]
  return scheme[variant === "DEFAULT" ? "DEFAULT" : variant] || ""
}

/**
 * Компонентный хелпер для применения цветов модуля
 */
export function useModuleColors(module: ModuleType) {
  return moduleColors[module]
}

/**
 * Утилита для создания унифицированного стиля карточки модуля
 */
export function cnModuleCard(module: ModuleType, extraClasses?: string) {
  const colors = moduleColors[module]
  return cn(
    colors.light,
    "border border-transparent hover:border-[--border]",
    "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
    extraClasses
  )
}

/**
 * Утилита для создания унифицированного стиля кнопки действия модуля
 */
export function cnModuleButton(module: ModuleType, extraClasses?: string) {
  const colors = moduleColors[module]
  return cn(
    colors.DEFAULT,
    "text-white",
    "transition-all duration-200 hover:scale-105 hover:brightness-110",
    "active:scale-95",
    extraClasses
  )
}

/**
 * Утилита для создания стиля иконки модуля
 */
export function cnModuleIcon(module: ModuleType, extraClasses?: string) {
  const colors = moduleColors[module]
  return cn(colors.DEFAULT, "text-white", extraClasses)
}

/**
 * Карта соответствия типов логов к модулям
 */
export const logTypeToModule: Record<string, ModuleType> = {
  food: "food",
  workout: "workout",
  finance: "finance",
  water: "water",
  sleep: "sleep",
  mood: "mood",
}

/**
 * Получить цвет модуля по типу лога
 */
export function getModuleByLogType(logType: string): ModuleType {
  return logTypeToModule[logType] || "logs"
}
