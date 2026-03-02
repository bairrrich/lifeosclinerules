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
  },
  cardio: {
    light: "bg-[oklch(0.82_0.28_215)]",
    DEFAULT: "bg-[oklch(0.70_0.34_215)]",
    text: "text-[oklch(0.82_0.28_215)]",
  },
  yoga: {
    light: "bg-[oklch(0.84_0.26_122)]",
    DEFAULT: "bg-[oklch(0.72_0.32_122)]",
    text: "text-[oklch(0.84_0.26_122)]",
  },
  stretching: {
    light: "bg-[oklch(0.88_0.24_198)]",
    DEFAULT: "bg-[oklch(0.76_0.30_198)]",
    text: "text-[oklch(0.88_0.24_198)]",
  },
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
  },
  tea: {
    light: "bg-[oklch(0.88_0.22_78)]/15 text-[oklch(0.88_0.22_78)]",
    DEFAULT: "bg-[oklch(0.76_0.28_78)] text-white",
    text: "text-[oklch(0.88_0.22_78)]",
  },
  coffee: {
    light: "bg-[oklch(0.80_0.28_45)]/15 text-[oklch(0.80_0.28_45)]",
    DEFAULT: "bg-[oklch(0.68_0.34_45)] text-white",
    text: "text-[oklch(0.80_0.28_45)]",
  },
  other: {
    light: "bg-[oklch(0.78_0.26_285)]/15 text-[oklch(0.78_0.26_285)]",
    DEFAULT: "bg-[oklch(0.66_0.32_285)] text-white",
    text: "text-[oklch(0.78_0.26_285)]",
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
  },
  stress: {
    light: "bg-[oklch(0.80_0.28_18)]",
    DEFAULT: "bg-[oklch(0.68_0.34_18)]",
    text: "text-[oklch(0.80_0.28_18)]",
  },
}

/** Цвет для FAB кнопки — самый заметный элемент */
export const fabColor = {
  light: "bg-[oklch(0.82_0.28_40)]",
  DEFAULT: "bg-[oklch(0.70_0.34_40)]",
  text: "text-white",
  shadow: "shadow-[oklch(0.70_0.34_40)/0.45] hover:shadow-[oklch(0.70_0.34_40)/0.60]",
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
