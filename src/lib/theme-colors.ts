/**
 * Централизованная система цветов для модулей Life OS
 *
 * Использует OKLCH цвета для гармоничного восприятия
 * Формат: oklch(L C H) - L (lightness 0-1), C (chroma), H (hue 0-360)
 *
 * @example
 * import { moduleColors, getModuleColor } from "@/lib/theme-colors"
 *
 * <div className={moduleColors.food.light}>...</div>
 * <div className={getModuleColor('workout', 'DEFAULT')}>...</div>
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
  light: string
  DEFAULT: string
  text: string
  border: string
  shadow?: string
}

/**
 * Яркая насыщенная OKLCH-палитра 2026
 * chroma 0.18–0.34, lightness 66–90%
 */
export const moduleColors: Record<ModuleType, ModuleColorScheme> = {
  food: {
    light: "bg-[oklch(0.88_0.22_68)]",
    DEFAULT: "bg-[oklch(0.76_0.28_68)]",
    text: "text-[oklch(0.88_0.22_68)]",
    border: "border-[oklch(0.76_0.28_68)/0.45]",
    shadow: "shadow-[oklch(0.76_0.28_68)/0.32]",
  },
  workout: {
    light: "bg-[oklch(0.82_0.24_218)]",
    DEFAULT: "bg-[oklch(0.70_0.30_218)]",
    text: "text-[oklch(0.82_0.24_218)]",
    border: "border-[oklch(0.70_0.30_218)/0.45]",
    shadow: "shadow-[oklch(0.70_0.30_218)/0.32]",
  },
  finance: {
    light: "bg-[oklch(0.85_0.22_145)]",
    DEFAULT: "bg-[oklch(0.73_0.28_145)]",
    text: "text-[oklch(0.85_0.22_145)]",
    border: "border-[oklch(0.73_0.28_145)/0.45]",
    shadow: "shadow-[oklch(0.73_0.28_145)/0.32]",
  },
  water: {
    light: "bg-[oklch(0.90_0.20_208)]",
    DEFAULT: "bg-[oklch(0.78_0.26_208)]",
    text: "text-[oklch(0.90_0.20_208)]",
    border: "border-[oklch(0.78_0.26_208)/0.45]",
    shadow: "shadow-[oklch(0.78_0.26_208)/0.32]",
  },
  sleep: {
    light: "bg-[oklch(0.78_0.22_278)]",
    DEFAULT: "bg-[oklch(0.66_0.28_278)]",
    text: "text-[oklch(0.78_0.22_278)]",
    border: "border-[oklch(0.66_0.28_278)/0.45]",
    shadow: "shadow-[oklch(0.66_0.28_278)/0.32]",
  },
  mood: {
    light: "bg-[oklch(0.86_0.25_312)]",
    DEFAULT: "bg-[oklch(0.74_0.31_312)]",
    text: "text-[oklch(0.86_0.25_312)]",
    border: "border-[oklch(0.74_0.31_312)/0.45]",
    shadow: "shadow-[oklch(0.74_0.31_312)/0.32]",
  },
  books: {
    light: "bg-[oklch(0.82_0.18_48)]",
    DEFAULT: "bg-[oklch(0.70_0.24_48)]",
    text: "text-[oklch(0.82_0.18_48)]",
    border: "border-[oklch(0.70_0.24_48)/0.45]",
    shadow: "shadow-[oklch(0.70_0.24_48)/0.32]",
  },
  recipes: {
    light: "bg-[oklch(0.90_0.24_58)]",
    DEFAULT: "bg-[oklch(0.80_0.30_58)]",
    text: "text-[oklch(0.90_0.24_58)]",
    border: "border-[oklch(0.80_0.30_58)/0.45]",
    shadow: "shadow-[oklch(0.80_0.30_58)/0.32]",
  },
  habits: {
    light: "bg-[oklch(0.86_0.21_118)]",
    DEFAULT: "bg-[oklch(0.74_0.27_118)]",
    text: "text-[oklch(0.86_0.21_118)]",
    border: "border-[oklch(0.74_0.27_118)/0.45]",
    shadow: "shadow-[oklch(0.74_0.27_118)/0.32]",
  },
  goals: {
    light: "bg-[oklch(0.80_0.28_38)]",
    DEFAULT: "bg-[oklch(0.68_0.34_38)]",
    text: "text-[oklch(0.80_0.28_38)]",
    border: "border-[oklch(0.68_0.34_38)/0.45]",
    shadow: "shadow-[oklch(0.68_0.34_38)/0.38]",
  },
  logs: {
    light: "bg-[oklch(0.82_0.17_242)]",
    DEFAULT: "bg-[oklch(0.70_0.23_242)]",
    text: "text-[oklch(0.82_0.17_242)]",
    border: "border-[oklch(0.70_0.23_242)/0.45]",
    shadow: "shadow-[oklch(0.70_0.23_242)/0.28]",
  },
  settings: {
    light: "bg-[oklch(0.72_0.14_255)]",
    DEFAULT: "bg-[oklch(0.58_0.18_255)]",
    text: "text-[oklch(0.72_0.14_255)]",
    border: "border-[oklch(0.58_0.18_255)/0.45]",
    shadow: "shadow-[oklch(0.58_0.18_255)/0.22]",
  },
}

/** Цвета для финансовых операций */
export const financeColors = {
  income: {
    light: "bg-[oklch(0.86_0.26_138)]", // ↑ chroma до 0.26
    DEFAULT: "bg-[oklch(0.74_0.32_138)]", // 0.32 — как у goals/expense
    text: "text-[oklch(0.86_0.26_138)]",
  },
  expense: {
    light: "bg-[oklch(0.80_0.30_18)]", // было 0.28 → 0.30
    DEFAULT: "bg-[oklch(0.68_0.36_18)]", // было 0.34 → 0.36 для максимального акцента
    text: "text-[oklch(0.80_0.30_18)]",
  },
  transfer: {
    light: "bg-[oklch(0.82_0.26_208)]", // ↑ до 0.26
    DEFAULT: "bg-[oklch(0.70_0.32_208)]", // ↑ до 0.32
    text: "text-[oklch(0.82_0.26_208)]",
  },
}

/** Цвета для типов тренировок */
export const workoutColors = {
  strength: {
    light: "bg-[oklch(0.78_0.30_28)]", // ↑ chroma
    DEFAULT: "bg-[oklch(0.66_0.36_28)]", // агрессивный красный/оранж
    text: "text-[oklch(0.78_0.30_28)]",
    border: "border-[oklch(0.66_0.34_28)/0.45]",
  },
  cardio: {
    light: "bg-[oklch(0.82_0.28_215)]",
    DEFAULT: "bg-[oklch(0.70_0.34_215)]",
    text: "text-[oklch(0.82_0.28_215)]",
    border: "border-[oklch(0.70_0.32_215)/0.45]",
  },
  yoga: {
    light: "bg-[oklch(0.84_0.26_122)]",
    DEFAULT: "bg-[oklch(0.72_0.32_122)]",
    text: "text-[oklch(0.84_0.26_122)]",
    border: "border-[oklch(0.72_0.30_122)/0.45]",
  },
  stretching: {
    light: "bg-[oklch(0.88_0.24_198)]",
    DEFAULT: "bg-[oklch(0.76_0.30_198)]",
    text: "text-[oklch(0.88_0.24_198)]",
    border: "border-[oklch(0.76_0.28_198)/0.45]",
  },
  calories: "text-orange-500",
}

/** Цвета для типов еды */
export const foodColors = {
  breakfast: {
    light: "bg-[oklch(0.90_0.26_78)]", // ↑ chroma для утренней свежести
    DEFAULT: "bg-[oklch(0.80_0.32_78)]",
    text: "text-[oklch(0.90_0.26_78)]",
  },
  lunch: {
    light: "bg-[oklch(0.88_0.28_65)]",
    DEFAULT: "bg-[oklch(0.76_0.34_65)]",
    text: "text-[oklch(0.88_0.28_65)]",
  },
  dinner: {
    light: "bg-[oklch(0.82_0.28_45)]",
    DEFAULT: "bg-[oklch(0.70_0.34_45)]",
    text: "text-[oklch(0.82_0.28_45)]",
  },
  snack: {
    light: "bg-[oklch(0.86_0.24_110)]",
    DEFAULT: "bg-[oklch(0.74_0.30_110)]",
    text: "text-[oklch(0.86_0.24_110)]",
  },
}

/** Цвета для типов рецептов */
export const recipeColors = {
  food: {
    light: "bg-[oklch(0.88_0.22_68)]/15 text-[oklch(0.88_0.22_68)]",
    DEFAULT: "bg-[oklch(0.76_0.28_68)] text-white",
    text: "text-[oklch(0.88_0.22_68)]",
  },
  drink: {
    light: "bg-[oklch(0.82_0.24_208)]/15 text-[oklch(0.82_0.24_208)]",
    DEFAULT: "bg-[oklch(0.70_0.30_208)] text-white",
    text: "text-[oklch(0.82_0.24_208)]",
  },
  cocktail: {
    light: "bg-[oklch(0.80_0.26_38)]/15 text-[oklch(0.80_0.26_38)]",
    DEFAULT: "bg-[oklch(0.68_0.32_38)] text-white",
    text: "text-[oklch(0.80_0.26_38)]",
  },
  rating: {
    DEFAULT: "text-yellow-500",
    fill: "fill-yellow-500",
  },
  calories: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  protein: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  fat: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  carbs: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  sugar: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  fiber: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  spicy: {
    active: "bg-red-500",
    inactive: "bg-gray-200",
  },
  alcoholic: {
    yes: "bg-purple-500/10 text-purple-500",
    no: "bg-green-500/10 text-green-500",
  },
  carbonated: {
    yes: "bg-purple-50 text-purple-700 border-purple-200",
    no: "bg-gray-50 text-gray-700 border-gray-200",
  },
  // Additional badge colors for recipe metadata
  cuisine: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  courseType: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  cookingMethod: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  servingTemperature: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  dietary: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  drinkType: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  base: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  cocktailMethod: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  glassType: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  iceType: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  garnish: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  tools: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  caffeine: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  baseSpirit: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  color: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
}

/** Цвета для статусов книг */
export const bookStatusColors = {
  planned: {
    light: "bg-[oklch(0.82_0.17_242)]/15 text-[oklch(0.82_0.17_242)]",
    DEFAULT: "bg-[oklch(0.70_0.23_242)] text-white",
    text: "text-[oklch(0.82_0.17_242)]",
  },
  reading: {
    light: "bg-[oklch(0.82_0.24_208)]/15 text-[oklch(0.82_0.24_208)]",
    DEFAULT: "bg-[oklch(0.70_0.30_208)] text-white",
    text: "text-[oklch(0.82_0.24_208)]",
  },
  completed: {
    light: "bg-[oklch(0.86_0.24_138)]/15 text-[oklch(0.86_0.24_138)]",
    DEFAULT: "bg-[oklch(0.74_0.30_138)] text-white",
    text: "text-[oklch(0.86_0.24_138)]",
  },
  paused: {
    light: "bg-[oklch(0.86_0.25_312)]/15 text-[oklch(0.86_0.25_312)]",
    DEFAULT: "bg-[oklch(0.74_0.31_312)] text-white",
    text: "text-[oklch(0.86_0.25_312)]",
  },
  dropped: {
    light: "bg-[oklch(0.80_0.28_18)]/15 text-[oklch(0.80_0.28_18)]",
    DEFAULT: "bg-[oklch(0.68_0.34_18)] text-white",
    text: "text-[oklch(0.80_0.28_18)]",
  },
}

/** Цвета для приоритетов */
export const priorityColors = {
  low: {
    light: "bg-[oklch(0.82_0.17_242)]/15 text-[oklch(0.82_0.17_242)]",
    DEFAULT: "bg-[oklch(0.70_0.23_242)] text-white",
    text: "text-[oklch(0.82_0.17_242)]",
  },
  medium: {
    light: "bg-[oklch(0.82_0.24_208)]/15 text-[oklch(0.82_0.24_208)]",
    DEFAULT: "bg-[oklch(0.70_0.30_208)] text-white",
    text: "text-[oklch(0.82_0.24_208)]",
  },
  high: {
    light: "bg-[oklch(0.88_0.22_68)]/15 text-[oklch(0.88_0.22_68)]",
    DEFAULT: "bg-[oklch(0.76_0.28_68)] text-white",
    text: "text-[oklch(0.88_0.22_68)]",
  },
  critical: {
    light: "bg-[oklch(0.80_0.28_18)]/15 text-[oklch(0.80_0.28_18)]",
    DEFAULT: "bg-[oklch(0.68_0.34_18)] text-white",
    text: "text-[oklch(0.80_0.28_18)]",
  },
}

/** Цвета для типов items (витамины, лекарства и т.д.) */
export const itemColors = {
  vitamin: {
    light: "bg-[oklch(0.88_0.22_68)]/15 text-[oklch(0.88_0.22_68)]",
    DEFAULT: "bg-[oklch(0.76_0.28_68)] text-white",
    text: "text-[oklch(0.88_0.22_68)]",
  },
  medicine: {
    light: "bg-[oklch(0.80_0.28_18)]/15 text-[oklch(0.80_0.28_18)]",
    DEFAULT: "bg-[oklch(0.68_0.34_18)] text-white",
    text: "text-[oklch(0.80_0.28_18)]",
  },
  herb: {
    light: "bg-[oklch(0.84_0.24_122)]/15 text-[oklch(0.84_0.24_122)]",
    DEFAULT: "bg-[oklch(0.72_0.30_122)] text-white",
    text: "text-[oklch(0.84_0.24_122)]",
  },
  cosmetic: {
    light: "bg-[oklch(0.86_0.25_312)]/15 text-[oklch(0.86_0.25_312)]",
    DEFAULT: "bg-[oklch(0.74_0.31_312)] text-white",
    text: "text-[oklch(0.86_0.25_312)]",
  },
  product: {
    light: "bg-[oklch(0.90_0.20_208)]/15 text-[oklch(0.90_0.20_208)]",
    DEFAULT: "bg-[oklch(0.78_0.26_208)] text-white",
    text: "text-[oklch(0.90_0.20_208)]",
  },
}

/** Цвета для типов еды (breakfast, lunch, dinner, snack) */
export const foodTypeColors: Record<string, string> = {
  breakfast: "data-[state=active]:bg-[oklch(0.90_0.055_70)] data-[state=active]:text-white",
  lunch: "data-[state=active]:bg-[oklch(0.87_0.06_150)] data-[state=active]:text-white",
  dinner: "data-[state=active]:bg-[oklch(0.68_0.16_330)] data-[state=active]:text-white",
  snack: "data-[state=active]:bg-[oklch(0.85_0.065_200)] data-[state=active]:text-white",
}

/** Цвета для типов тренировок (strength, cardio, yoga, stretching) */
export const workoutTypeColors: Record<string, string> = {
  strength: "data-[state=active]:bg-[oklch(0.82_0.075_25)] data-[state=active]:text-white",
  cardio: "data-[state=active]:bg-[oklch(0.80_0.065_200)] data-[state=active]:text-white",
  yoga: "data-[state=active]:bg-[oklch(0.83_0.045_125)] data-[state=active]:text-white",
  stretching: "data-[state=active]:bg-[oklch(0.89_0.065_320)] data-[state=active]:text-white",
}

/** Цвета для финансовых типов (income, expense, transfer) */
export const financeTypeColors: Record<string, string> = {
  income: "data-[state=active]:bg-[oklch(0.87_0.06_150)] data-[state=active]:text-white",
  expense: "data-[state=active]:bg-[oklch(0.82_0.075_25)] data-[state=active]:text-white",
  transfer: "data-[state=active]:bg-[oklch(0.85_0.065_200)] data-[state=active]:text-white",
}

/** Цвета для прогресса (goals) */
export const progressColors = {
  complete: {
    DEFAULT: "bg-[oklch(0.74_0.30_138)]",
  },
  almost: {
    DEFAULT: "bg-[oklch(0.80_0.28_78)]",
  },
  halfway: {
    DEFAULT: "bg-[oklch(0.70_0.30_208)]",
  },
  low: {
    DEFAULT: "bg-[oklch(0.70_0.23_242)]",
  },
}

/** Цвета для статусов привычек */
export const habitStatusColors = {
  completed: {
    light: "bg-[oklch(0.86_0.24_138)]",
    DEFAULT: "bg-[oklch(0.74_0.30_138)]",
    text: "text-[oklch(0.86_0.24_138)]",
  },
  skipped: {
    light: "bg-[oklch(0.88_0.22_68)]/30 text-[oklch(0.88_0.22_68)]",
    DEFAULT: "bg-[oklch(0.76_0.28_68)]",
    text: "text-[oklch(0.88_0.22_68)]",
  },
  negative: {
    light: "bg-[oklch(0.80_0.28_18)]/15 text-[oklch(0.80_0.28_18)]",
    DEFAULT: "bg-[oklch(0.68_0.34_18)]",
    text: "text-[oklch(0.80_0.28_18)]",
  },
  weekend: {
    light: "bg-[oklch(0.88_0.22_68)]/10",
    DEFAULT: "",
    text: "text-[oklch(0.88_0.22_68)/0.70]",
  },
}

/** Цвета для типов контента (book, recipe) */
export const contentTypeColors = {
  book: {
    light: "bg-[oklch(0.82_0.18_48)]/15 text-[oklch(0.82_0.18_48)]",
    DEFAULT: "bg-[oklch(0.70_0.24_48)] text-white",
  },
  recipe: {
    light: "bg-[oklch(0.90_0.24_58)]/15 text-[oklch(0.90_0.24_58)]",
    DEFAULT: "bg-[oklch(0.80_0.30_58)] text-white",
  },
}

/** Цвета для источников еды (custom, recipe, product) */
export const foodSourceColors = {
  custom: {
    light: "bg-[oklch(0.88_0.22_68)]/15 text-[oklch(0.88_0.22_68)]",
    DEFAULT: "bg-[oklch(0.76_0.28_68)] text-white",
    text: "text-[oklch(0.88_0.22_68)]",
  },
  recipe: {
    light: "bg-[oklch(0.90_0.24_58)]/15 text-[oklch(0.90_0.24_58)]",
    DEFAULT: "bg-[oklch(0.80_0.30_58)] text-white",
    text: "text-[oklch(0.90_0.24_58)]",
  },
  product: {
    light: "bg-[oklch(0.86_0.24_138)]/15 text-[oklch(0.86_0.24_138)]",
    DEFAULT: "bg-[oklch(0.74_0.30_138)] text-white",
    text: "text-[oklch(0.86_0.24_138)]",
  },
}

/** Цвета для типов напитков (вода, чай, кофе, другое) */
export const waterDrinkColors = {
  water: {
    light: "bg-[oklch(0.90_0.20_208)]/15 text-[oklch(0.90_0.20_208)]",
    DEFAULT: "bg-[oklch(0.78_0.26_208)] text-white",
    text: "text-[oklch(0.90_0.20_208)]",
    border: "border-[oklch(0.78_0.26_208)/0.45]",
  },
  tea: {
    light: "bg-[oklch(0.88_0.22_78)]/15 text-[oklch(0.88_0.22_78)]",
    DEFAULT: "bg-[oklch(0.76_0.28_78)] text-white",
    text: "text-[oklch(0.88_0.22_78)]",
    border: "border-[oklch(0.76_0.28_78)/0.45]",
  },
  coffee: {
    light: "bg-[oklch(0.80_0.28_45)]/15 text-[oklch(0.80_0.28_45)]",
    DEFAULT: "bg-[oklch(0.68_0.34_45)] text-white",
    text: "text-[oklch(0.80_0.28_45)]",
    border: "border-[oklch(0.68_0.34_45)/0.45]",
  },
  other: {
    light: "bg-[oklch(0.78_0.26_285)]/15 text-[oklch(0.78_0.26_285)]",
    DEFAULT: "bg-[oklch(0.66_0.32_285)] text-white",
    text: "text-[oklch(0.78_0.26_285)]",
    border: "border-[oklch(0.66_0.32_285)/0.45]",
  },
}

/** Цвета для типов логов (иконки в списках) */
export const logTypeColors = {
  food: {
    DEFAULT: "bg-[oklch(0.76_0.28_68)] text-white",
    light: "bg-[oklch(0.88_0.22_68)]/10 text-[oklch(0.88_0.22_68)]",
  },
  workout: {
    DEFAULT: "bg-[oklch(0.70_0.30_218)] text-white",
    light: "bg-[oklch(0.82_0.24_218)]/10 text-[oklch(0.82_0.24_218)]",
  },
  finance: {
    DEFAULT: "bg-[oklch(0.73_0.28_145)] text-white",
    light: "bg-[oklch(0.85_0.22_145)]/10 text-[oklch(0.85_0.22_145)]",
  },
  finance_income: {
    DEFAULT: "bg-[oklch(0.74_0.30_138)] text-white",
    light: "bg-[oklch(0.86_0.24_138)]/10 text-[oklch(0.86_0.24_138)]",
  },
  finance_expense: {
    DEFAULT: "bg-[oklch(0.68_0.34_18)] text-white",
    light: "bg-[oklch(0.80_0.28_18)]/10 text-[oklch(0.80_0.28_18)]",
  },
  finance_transfer: {
    DEFAULT: "bg-[oklch(0.70_0.30_208)] text-white",
    light: "bg-[oklch(0.82_0.24_208)]/10 text-[oklch(0.82_0.24_208)]",
  },
}

/** Цвета для шаблонов (вкладки в templates/page.tsx) */
export const templateTypeColors = {
  food: {
    text: "text-[oklch(0.76_0.28_68)]",
    light: "bg-[oklch(0.88_0.22_68)]",
    DEFAULT: "bg-[oklch(0.76_0.28_68)]",
  },
  workout: {
    text: "text-[oklch(0.70_0.30_218)]",
    light: "bg-[oklch(0.82_0.24_218)]",
    DEFAULT: "bg-[oklch(0.70_0.30_218)]",
  },
  water: {
    text: "text-[oklch(0.78_0.26_208)]",
    light: "bg-[oklch(0.90_0.20_208)]",
    DEFAULT: "bg-[oklch(0.78_0.26_208)]",
  },
  sleep: {
    text: "text-[oklch(0.66_0.28_278)]",
    light: "bg-[oklch(0.78_0.22_278)]",
    DEFAULT: "bg-[oklch(0.66_0.28_278)]",
  },
  mood: {
    text: "text-[oklch(0.74_0.31_312)]",
    light: "bg-[oklch(0.86_0.25_312)]",
    DEFAULT: "bg-[oklch(0.74_0.31_312)]",
  },
}

/** Цвета для энергии и стресса (mood) */
export const moodLevelColors = {
  energy: {
    light: "bg-[oklch(0.88_0.22_135)]",
    DEFAULT: "bg-[oklch(0.74_0.27_135)]",
    text: "text-[oklch(0.88_0.22_135)]",
    border: "border-[oklch(0.74_0.27_135)/0.45]",
  },
  stress: {
    light: "bg-[oklch(0.80_0.28_18)]",
    DEFAULT: "bg-[oklch(0.68_0.34_18)]",
    text: "text-[oklch(0.80_0.28_18)]",
    border: "border-[oklch(0.68_0.34_18)/0.45]",
  },
}

/** Цвета для качества сна */
export const sleepQualityColors = {
  DEFAULT: {
    bg: "bg-[oklch(0.66_0.28_278)]", // indigo-500 equivalent
    text: "text-white",
    border: "border-[oklch(0.66_0.28_278)/0.45]",
  },
}

/** Цвет для FAB кнопки — самый заметный элемент */
export const fabColor = {
  light: "bg-[oklch(0.82_0.28_40)]",
  DEFAULT: "bg-[oklch(0.70_0.34_40)]",
  text: "text-white",
  shadow: "shadow-[oklch(0.70_0.34_40)/0.45] hover:shadow-[oklch(0.70_0.34_40)/0.60]",
}

/** Цвета для аналитики (графики) */
export const analyticsColors = {
  calories: "oklch(0.76_0.28_68)", // food.DEFAULT
  protein: "oklch(0.70_0.30_218)", // workout.DEFAULT
  fat: "oklch(0.80_0.30_58)", // recipes.DEFAULT
  carbs: "oklch(0.74_0.30_138)", // financeColors.income.DEFAULT
  income: "oklch(0.74_0.30_138)",
  expense: "oklch(0.68_0.36_18)", // financeColors.expense.DEFAULT
  workout: "oklch(0.70_0.32_218)", // workout.DEFAULT
  pie: [
    "oklch(0.76_0.28_68)", // food
    "oklch(0.70_0.30_218)", // workout
    "oklch(0.74_0.30_138)", // income
    "oklch(0.80_0.30_58)", // recipes
    "oklch(0.68_0.34_38)", // goals
    "oklch(0.70_0.26_208)", // water
  ],
}

/** Цвета для BMI категорий */
export const bmiColors = {
  underweight: {
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    DEFAULT: "bg-blue-500/10",
  },
  normal: {
    text: "text-green-500",
    bg: "bg-green-500/10",
    DEFAULT: "bg-green-500/10",
  },
  overweight: {
    text: "text-yellow-500",
    bg: "bg-yellow-500/10",
    DEFAULT: "bg-yellow-500/10",
  },
  obese: {
    text: "text-red-500",
    bg: "bg-red-500/10",
    DEFAULT: "bg-red-500/10",
  },
}

/** Цвета для тегов и меток (50-оттенки) */
export const tagColors = {
  orange: {
    light: "bg-orange-50",
    DEFAULT: "bg-orange-500 text-white",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  green: {
    light: "bg-green-50",
    DEFAULT: "bg-green-500 text-white",
    text: "text-green-700",
    border: "border-green-200",
  },
  blue: {
    light: "bg-blue-50",
    DEFAULT: "bg-blue-500 text-white",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  red: {
    light: "bg-red-50",
    DEFAULT: "bg-red-500 text-white",
    text: "text-red-700",
    border: "border-red-200",
  },
  purple: {
    light: "bg-purple-50",
    DEFAULT: "bg-purple-500 text-white",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  cyan: {
    light: "bg-cyan-50",
    DEFAULT: "bg-cyan-500 text-white",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  sky: {
    light: "bg-sky-50",
    DEFAULT: "bg-sky-500 text-white",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  pink: {
    light: "bg-pink-50",
    DEFAULT: "bg-pink-500 text-white",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  slate: {
    light: "bg-slate-50",
    DEFAULT: "bg-slate-500 text-white",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  amber: {
    light: "bg-amber-50",
    DEFAULT: "bg-amber-500 text-white",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  lime: {
    light: "bg-lime-50",
    DEFAULT: "bg-lime-500 text-white",
    text: "text-lime-700",
    border: "border-lime-200",
  },
  emerald: {
    light: "bg-emerald-50",
    DEFAULT: "bg-emerald-500 text-white",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  violet: {
    light: "bg-violet-50",
    DEFAULT: "bg-violet-500 text-white",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  fuchsia: {
    light: "bg-fuchsia-50",
    DEFAULT: "bg-fuchsia-500 text-white",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
  },
  indigo: {
    light: "bg-indigo-50",
    DEFAULT: "bg-indigo-500 text-white",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  teal: {
    light: "bg-teal-50",
    DEFAULT: "bg-teal-500 text-white",
    text: "text-teal-700",
    border: "border-teal-200",
  },
}

/** Цвета для типов напоминаний */
export const reminderTypeColors = {
  reminder: {
    icon: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  scheduled: {
    icon: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  completed: {
    icon: "text-green-500",
    bg: "bg-green-500/10",
  },
  overdue: {
    icon: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500",
  },
  stats: {
    icon: "text-purple-500",
    bg: "bg-purple-500/10",
  },
}

/** Цвета для статусов (уведомления, синхронизация) */
export const statusColors = {
  success: {
    icon: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500",
  },
  error: {
    icon: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500",
  },
  info: {
    icon: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500",
  },
  warning: {
    icon: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500",
  },
  syncing: {
    icon: "text-blue-500",
    bg: "bg-blue-500/10",
  },
}

/** Цвета для стриков и трофеев */
export const streakColors = {
  trophy: {
    bg: "bg-amber-500/10",
    icon: "text-amber-500",
  },
  flame: {
    icon: "text-orange-500",
  },
  first: {
    bg: "bg-amber-500 text-white",
  },
  second: {
    bg: "bg-gray-300 text-gray-700",
  },
  third: {
    bg: "bg-amber-700 text-white",
  },
  gradient: "bg-gradient-to-r from-orange-500 to-amber-500",
}

/** Цвета для статистики напоминаний */
export const reminderStatsColors = {
  streak: "text-[oklch(0.80_0.28_90)]", // orange/yellow
  longestStreak: "text-[oklch(0.74_0.30_138)]", // green
  totalCompleted: "text-[oklch(0.70_0.30_218)]", // blue
  overdue: "text-red-500",
  chart: "text-purple-500",
}

/** Цвета для качества сна */
export const sleepColors = {
  veryPoor: "text-red-500",
  poor: "text-orange-500",
  okay: "text-yellow-500",
  good: "text-lime-500",
  excellent: "text-green-500",
}

/** Цвета для модуля body (BMI, вес) */
export const bodyColors = {
  bmi: bmiColors, // underweight, normal, overweight, obese
  trend: {
    up: "text-red-500", // weight increase
    down: "text-green-500", // weight decrease
  },
  stats: {
    max: "text-red-500",
    avg: "text-blue-500",
    min: "text-green-500",
  },
  bar: "bg-blue-500",
}

/** Цвета для статистики книг */
export const bookColors = {
  reading: "text-[oklch(0.70_0.30_218)]", // workout blue
  completed: "text-[oklch(0.74_0.30_138)]", // finance green
  paused: "text-[oklch(0.80_0.28_90)]", // yellow
  rating: "text-yellow-500", // star rating
  ratingFill: "fill-yellow-500",
}

/** Цвета для UI элементов (избранное, удаление, успех) */
export const uiColors = {
  favorite: {
    DEFAULT: "text-yellow-500",
    fill: "fill-yellow-500",
  },
  delete: {
    DEFAULT: "text-red-500",
    hover: "hover:text-red-500",
  },
  success: {
    DEFAULT: "text-green-600",
  },
}

/** Цвета для настроений */
export const moodColors = {
  great: "text-[oklch(0.74_0.30_138)]", // green
  good: "text-lime-500", // lime
  okay: "text-yellow-500", // yellow
  bad: "text-[oklch(0.80_0.28_18)]", // brownish
  terrible: "text-red-500", // red
}

/** Цвета для статистики (карточки с числами) */
export const statColors = {
  food: "text-[oklch(0.76_0.28_68)]",
  workout: "text-[oklch(0.70_0.30_218)]",
  finance: "text-[oklch(0.74_0.30_138)]",
  water: "text-[oklch(0.78_0.26_208)]",
  sleep: "text-[oklch(0.66_0.28_278)]",
  mood: "text-[oklch(0.74_0.31_312)]",
  books: "text-[oklch(0.70_0.24_48)]",
  recipes: "text-[oklch(0.80_0.30_58)]",
  habits: "text-[oklch(0.74_0.27_118)]",
  goals: "text-[oklch(0.68_0.34_38)]",
  logs: "text-[oklch(0.70_0.23_242)]",
  settings: "text-[oklch(0.58_0.18_255)]",
}

/** Палитра для выбора цвета привычек (8 насыщенных вариантов) */
export const habitPalette = [
  {
    bg: "bg-[oklch(0.72_0.30_30)]",
    light: "bg-[oklch(0.82_0.24_30)]",
    text: "text-[oklch(0.78_0.28_30)]",
    name: "Терракот",
  },
  {
    bg: "bg-[oklch(0.76_0.28_65)]",
    light: "bg-[oklch(0.86_0.22_65)]",
    text: "text-[oklch(0.82_0.26_65)]",
    name: "Персик",
  },
  {
    bg: "bg-[oklch(0.82_0.26_90)]",
    light: "bg-[oklch(0.90_0.20_90)]",
    text: "text-[oklch(0.86_0.24_90)]",
    name: "Жёлтый",
  },
  {
    bg: "bg-[oklch(0.78_0.28_135)]",
    light: "bg-[oklch(0.88_0.22_135)]",
    text: "text-[oklch(0.84_0.26_135)]",
    name: "Зелёный",
  },
  {
    bg: "bg-[oklch(0.74_0.30_195)]",
    light: "bg-[oklch(0.84_0.24_195)]",
    text: "text-[oklch(0.80_0.28_195)]",
    name: "Бирюза",
  },
  {
    bg: "bg-[oklch(0.70_0.32_230)]",
    light: "bg-[oklch(0.80_0.26_230)]",
    text: "text-[oklch(0.76_0.30_230)]",
    name: "Синий",
  },
  {
    bg: "bg-[oklch(0.72_0.30_285)]",
    light: "bg-[oklch(0.82_0.24_285)]",
    text: "text-[oklch(0.78_0.28_285)]",
    name: "Фиолетовый",
  },
  {
    bg: "bg-[oklch(0.76_0.28_330)]",
    light: "bg-[oklch(0.86_0.22_330)]",
    text: "text-[oklch(0.82_0.26_330)]",
    name: "Розовый",
  },
] as const

/** Alias для habitPalette */
export const habitColors = habitPalette

/** Карта соответствия типов логов к модулям */
export const logTypeToModule: Record<string, ModuleType> = {
  food: "food",
  workout: "workout",
  finance: "finance",
  water: "water",
  sleep: "sleep",
  mood: "mood",
}

/** Хелперы */

export function getModuleColor(
  module: ModuleType,
  variant: "light" | "DEFAULT" | "text" | "border" | "shadow" = "light"
): string {
  const scheme = moduleColors[module]
  return scheme[variant] || ""
}

export function useModuleColors(module: ModuleType) {
  return moduleColors[module]
}

export function cnModuleCard(module: ModuleType, extraClasses?: string) {
  const colors = moduleColors[module]
  return cn(
    colors.light,
    "border border-transparent hover:border-[--border] transition-all duration-200 hover:scale-[1.02] hover:shadow-xl",
    extraClasses
  )
}

export function cnModuleButton(module: ModuleType, extraClasses?: string) {
  const colors = moduleColors[module]
  return cn(
    colors.DEFAULT,
    "text-white transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95",
    extraClasses
  )
}

export function cnModuleIcon(module: ModuleType, extraClasses?: string) {
  const colors = moduleColors[module]
  return cn(colors.DEFAULT, "text-white", extraClasses)
}

/** Получить цвет модуля по типу лога */
export function getModuleByLogType(logType: string): ModuleType {
  return logTypeToModule[logType] || "logs"
}
