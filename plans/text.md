/\*\*

- Централизованная система цветов для модулей Life OS
-
- Использует OKLCH цвета для гармоничного восприятия
- Формат: oklch(L C H) - L (lightness 0-1), C (chroma), H (hue 0-360)
-
- @example
- import { moduleColors } from "@/lib/theme-colors"
-
- <div className={moduleColors.food.light}>...</div>
- <div className={moduleColors.workout.text}>...</div>
  */

import { cn } from "@/lib/utils"

/\*_ Типы модулей в приложении _/
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

/** Интерфейс цветовой схемы модуля \*/
export interface ModuleColorScheme {
/** Фоновый цвет (обычно light версия) _/
light: string
/\*\* Основной фоновый цвет _/
DEFAULT: string
/** Цвет текста \*/
text: string
/** Цвет границы _/
border: string
/\*\* Glow тень (опционально) _/
shadow?: string
}

/\*\*

- OKLCH цветовые схемы для модулей
- oklch(L C H) - L: lightness (0-1), C: chroma, H: hue (0-360)
  \*/
  export const moduleColors: Record<ModuleType, ModuleColorScheme> = {
  food: {
  // oklch(90% 0.055 70) - высокая lightness, низкая chroma
  light: "bg-[oklch(0.90_0.055_70)]",
  DEFAULT: "bg-[oklch(0.85_0.055_70)]",
  text: "text-[oklch(0.90_0.055_70)]",
  border: "border-[oklch(0.90_0.055_70)/0.3]",
  shadow: "shadow-[oklch(0.90_0.055_70)/0.15]",
  },
  workout: {
  // oklch(84% 0.07 225)
  light: "bg-[oklch(0.84_0.07_225)]",
  DEFAULT: "bg-[oklch(0.79_0.07_225)]",
  text: "text-[oklch(0.84_0.07_225)]",
  border: "border-[oklch(0.84_0.07_225)/0.3]",
  shadow: "shadow-[oklch(0.84_0.07_225)/0.15]",
  },
  finance: {
  // oklch(85% 0.065 200) - информационный синий
  light: "bg-[oklch(0.85_0.065_200)]",
  DEFAULT: "bg-[oklch(0.80_0.065_200)]",
  text: "text-[oklch(0.85_0.065_200)]",
  border: "border-[oklch(0.85_0.065_200)/0.3]",
  shadow: "shadow-[oklch(0.85_0.065_200)/0.15]",
  },
  water: {
  // oklch(92% 0.04 210)
  light: "bg-[oklch(0.92_0.04_210)]",
  DEFAULT: "bg-[oklch(0.87_0.04_210)]",
  text: "text-[oklch(0.92_0.04_210)]",
  border: "border-[oklch(0.92_0.04_210)/0.3]",
  shadow: "shadow-[oklch(0.92_0.04_210)/0.15]",
  },
  sleep: {
  // oklch(80% 0.05 275) - индиго
  light: "bg-[oklch(0.80_0.05_275)]",
  DEFAULT: "bg-[oklch(0.75_0.05_275)]",
  text: "text-[oklch(0.80_0.05_275)]",
  border: "border-[oklch(0.80_0.05_275)/0.3]",
  shadow: "shadow-[oklch(0.80_0.05_275)/0.15]",
  },
  mood: {
  // oklch(89% 0.065 320)
  light: "bg-[oklch(0.89_0.065_320)]",
  DEFAULT: "bg-[oklch(0.84_0.065_320)]",
  text: "text-[oklch(0.89_0.065_320)]",
  border: "border-[oklch(0.89_0.065_320)/0.3]",
  shadow: "shadow-[oklch(0.89_0.065_320)/0.15]",
  },
  books: {
  // oklch(82% 0.035 45)
  light: "bg-[oklch(0.82_0.035_45)]",
  DEFAULT: "bg-[oklch(0.77_0.035_45)]",
  text: "text-[oklch(0.82_0.035_45)]",
  border: "border-[oklch(0.82_0.035_45)/0.3]",
  shadow: "shadow-[oklch(0.82_0.035_45)/0.15]",
  },
  recipes: {
  // oklch(93% 0.05 55)
  light: "bg-[oklch(0.93_0.05_55)]",
  DEFAULT: "bg-[oklch(0.88_0.05_55)]",
  text: "text-[oklch(0.93_0.05_55)]",
  border: "border-[oklch(0.93_0.05_55)/0.3]",
  shadow: "shadow-[oklch(0.93_0.05_55)/0.15]",
  },
  habits: {
  // oklch(88% 0.045 125)
  light: "bg-[oklch(0.88_0.045_125)]",
  DEFAULT: "bg-[oklch(0.83_0.045_125)]",
  text: "text-[oklch(0.88_0.045_125)]",
  border: "border-[oklch(0.88_0.045_125)/0.3]",
  shadow: "shadow-[oklch(0.88_0.045_125)/0.15]",
  },
  goals: {
  // oklch(83% 0.08 30)
  light: "bg-[oklch(0.83_0.08_30)]",
  DEFAULT: "bg-[oklch(0.78_0.08_30)]",
  text: "text-[oklch(0.83_0.08_30)]",
  border: "border-[oklch(0.83_0.08_30)/0.3]",
  shadow: "shadow-[oklch(0.83_0.08_30)/0.15]",
  },
  logs: {
  // oklch(86% 0.025 250)
  light: "bg-[oklch(0.86_0.025_250)]",
  DEFAULT: "bg-[oklch(0.81_0.025_250)]",
  text: "text-[oklch(0.86_0.025_250)]",
  border: "border-[oklch(0.86_0.025_250)/0.3]",
  shadow: "shadow-[oklch(0.86_0.025_250)/0.08]",
  },
  settings: {
  // oklch(55% 0.02 0) - нейтральный серый
  light: "bg-[oklch(0.65_0.01_0)]",
  DEFAULT: "bg-[oklch(0.55_0.02_0)]",
  text: "text-[oklch(0.55_0.02_0)]",
  border: "border-[oklch(0.55_0.02_0)/0.3]",
  shadow: "shadow-[oklch(0.55_0.02_0)/0.08]",
  },
  }

/\*\*

- Цвета для финансовых операций
  \*/
  export const financeColors = {
  income: {
  // oklch(87% 0.06 150) - зелёный
  light: "bg-[oklch(0.87_0.06_150)]",
  DEFAULT: "bg-[oklch(0.82_0.06_150)]",
  text: "text-[oklch(0.87_0.06_150)]",
  },
  expense: {
  // oklch(82% 0.075 25) - красный/розовато-оранжевый
  light: "bg-[oklch(0.82_0.075_25)]",
  DEFAULT: "bg-[oklch(0.77_0.075_25)]",
  text: "text-[oklch(0.82_0.075_25)]",
  },
  transfer: {
  // oklch(85% 0.065 200) - синий
  light: "bg-[oklch(0.85_0.065_200)]",
  DEFAULT: "bg-[oklch(0.80_0.065_200)]",
  text: "text-[oklch(0.85_0.065_200)]",
  },
  } as const

/\*\*

- Цвета для типов логов (food, workout, finance)
- Используются для иконок в списках
  \*/
  export const logTypeColors = {
  food: {
  DEFAULT: "bg-[oklch(0.90_0.055_70)] text-white",
  light: "bg-[oklch(0.90_0.055_70)]/10 text-[oklch(0.90_0.055_70)]",
  },
  workout: {
  DEFAULT: "bg-[oklch(0.84_0.07_225)] text-white",
  light: "bg-[oklch(0.84_0.07_225)]/10 text-[oklch(0.84_0.07_225)]",
  },
  finance: {
  DEFAULT: "bg-[oklch(0.85_0.065_200)] text-white",
  light: "bg-[oklch(0.85_0.065_200)]/10 text-[oklch(0.85_0.065_200)]",
  },
  finance_income: {
  DEFAULT: "bg-[oklch(0.87_0.06_150)] text-white",
  light: "bg-[oklch(0.87_0.06_150)]/10 text-[oklch(0.87_0.06_150)]",
  },
  finance_expense: {
  DEFAULT: "bg-[oklch(0.82_0.075_25)] text-white",
  light: "bg-[oklch(0.82_0.075_25)]/10 text-[oklch(0.82_0.075_25)]",
  },
  finance_transfer: {
  DEFAULT: "bg-[oklch(0.85_0.065_200)] text-white",
  light: "bg-[oklch(0.85_0.065_200)]/10 text-[oklch(0.85_0.065_200)]",
  },
  } as const

/\*\*

- Цвета для типов тренировок
  \*/
  export const workoutColors = {
  strength: {
  // oklch(82% 0.075 25) - красный
  light: "bg-[oklch(0.82_0.075_25)]",
  DEFAULT: "bg-[oklch(0.77_0.075_25)]",
  text: "text-[oklch(0.82_0.075_25)]",
  },
  cardio: {
  // oklch(84% 0.07 225) - синий
  light: "bg-[oklch(0.84_0.07_225)]",
  DEFAULT: "bg-[oklch(0.79_0.07_225)]",
  text: "text-[oklch(0.84_0.07_225)]",
  },
  yoga: {
  // oklch(88% 0.045 125) - зелёный
  light: "bg-[oklch(0.88_0.045_125)]",
  DEFAULT: "bg-[oklch(0.83_0.045_125)]",
  text: "text-[oklch(0.88_0.045_125)]",
  },
  stretching: {
  // oklch(92% 0.04 210) - бирюзовый
  light: "bg-[oklch(0.92_0.04_210)]",
  DEFAULT: "bg-[oklch(0.87_0.04_210)]",
  text: "text-[oklch(0.92_0.04_210)]",
  },
  } as const

/\*\*

- Цвета для типов еды
  \*/
  export const foodColors = {
  breakfast: {
  // oklch(89% 0.065 320) - жёлтый
  light: "bg-[oklch(0.89_0.065_320)]",
  DEFAULT: "bg-[oklch(0.84_0.065_320)]",
  text: "text-[oklch(0.89_0.065_320)]",
  },
  lunch: {
  // oklch(90% 0.055 70) - оранжевый
  light: "bg-[oklch(0.90_0.055_70)]",
  DEFAULT: "bg-[oklch(0.85_0.055_70)]",
  text: "text-[oklch(0.90_0.055_70)]",
  },
  dinner: {
  // oklch(83% 0.08 30) - тёмный оранжевый
  light: "bg-[oklch(0.83_0.08_30)]",
  DEFAULT: "bg-[oklch(0.78_0.08_30)]",
  text: "text-[oklch(0.83_0.08_30)]",
  },
  snack: {
  // oklch(88% 0.045 125) - зелёный
  light: "bg-[oklch(0.88_0.045_125)]",
  DEFAULT: "bg-[oklch(0.83_0.045_125)]",
  text: "text-[oklch(0.88_0.045_125)]",
  },
  } as const

/\*\*

- Цвета для типов рецептов
  \*/
  export const recipeColors = {
  food: {
  light: "bg-[oklch(0.90_0.055_70)]/10 text-[oklch(0.90_0.055_70)]",
  DEFAULT: "bg-[oklch(0.85_0.055_70)] text-white",
  text: "text-[oklch(0.90_0.055_70)]",
  },
  drink: {
  light: "bg-[oklch(0.85_0.065_200)]/10 text-[oklch(0.85_0.065_200)]",
  DEFAULT: "bg-[oklch(0.80_0.065_200)] text-white",
  text: "text-[oklch(0.85_0.065_200)]",
  },
  cocktail: {
  light: "bg-[oklch(0.83_0.08_30)]/10 text-[oklch(0.83_0.08_30)]",
  DEFAULT: "bg-[oklch(0.78_0.08_30)] text-white",
  text: "text-[oklch(0.83_0.08_30)]",
  },
  } as const

/\*\*

- Цвета для типов контента (book, recipe)
  \*/
  export const contentTypeColors = {
  book: {
  // oklch(82% 0.035 45) - коричневый
  light: "bg-[oklch(0.82_0.035_45)]/10 text-[oklch(0.82_0.035_45)]",
  DEFAULT: "bg-[oklch(0.82_0.035_45)] text-white",
  },
  recipe: {
  // oklch(93% 0.05 55) - жёлтый
  light: "bg-[oklch(0.93_0.05_55)]/10 text-[oklch(0.93_0.05_55)]",
  DEFAULT: "bg-[oklch(0.93_0.05_55)] text-white",
  },
  } as const

/\*\*

- Цвета для статусов книг
  \*/
  export const bookStatusColors = {
  planned: {
  light: "bg-[oklch(0.86_0.025_250)]/10 text-[oklch(0.86_0.025_250)]",
  DEFAULT: "bg-[oklch(0.81_0.025_250)] text-white",
  text: "text-[oklch(0.86_0.025_250)]",
  },
  reading: {
  light: "bg-[oklch(0.85_0.065_200)]/10 text-[oklch(0.85_0.065_200)]",
  DEFAULT: "bg-[oklch(0.80_0.065_200)] text-white",
  text: "text-[oklch(0.85_0.065_200)]",
  },
  completed: {
  light: "bg-[oklch(0.87_0.06_150)]/10 text-[oklch(0.87_0.06_150)]",
  DEFAULT: "bg-[oklch(0.82_0.06_150)] text-white",
  text: "text-[oklch(0.87_0.06_150)]",
  },
  paused: {
  light: "bg-[oklch(0.89_0.065_320)]/10 text-[oklch(0.89_0.065_320)]",
  DEFAULT: "bg-[oklch(0.84_0.065_320)] text-white",
  text: "text-[oklch(0.89_0.065_320)]",
  },
  dropped: {
  light: "bg-[oklch(0.82_0.075_25)]/10 text-[oklch(0.82_0.075_25)]",
  DEFAULT: "bg-[oklch(0.77_0.075_25)] text-white",
  text: "text-[oklch(0.82_0.075_25)]",
  },
  } as const

/\*\*

- Цвета для приоритетов
  \*/
  export const priorityColors = {
  low: {
  light: "bg-[oklch(0.86_0.025_250)]/10 text-[oklch(0.86_0.025_250)]",
  DEFAULT: "bg-[oklch(0.81_0.025_250)] text-white",
  text: "text-[oklch(0.86_0.025_250)]",
  },
  medium: {
  light: "bg-[oklch(0.85_0.065_200)]/10 text-[oklch(0.85_0.065_200)]",
  DEFAULT: "bg-[oklch(0.80_0.065_200)] text-white",
  text: "text-[oklch(0.85_0.065_200)]",
  },
  high: {
  light: "bg-[oklch(0.90_0.055_70)]/10 text-[oklch(0.90_0.055_70)]",
  DEFAULT: "bg-[oklch(0.85_0.055_70)] text-white",
  text: "text-[oklch(0.90_0.055_70)]",
  },
  critical: {
  light: "bg-[oklch(0.82_0.075_25)]/10 text-[oklch(0.82_0.075_25)]",
  DEFAULT: "bg-[oklch(0.77_0.075_25)] text-white",
  text: "text-[oklch(0.82_0.075_25)]",
  },
  } as const

/\*\*

- Цвета для типов items (витамины, лекарства, травы, косметика, средства)
  \*/
  export const itemColors = {
  vitamin: {
  light: "bg-[oklch(0.90_0.055_70)]/10 text-[oklch(0.90_0.055_70)]",
  DEFAULT: "bg-[oklch(0.85_0.055_70)] text-white",
  text: "text-[oklch(0.90_0.055_70)]",
  },
  medicine: {
  light: "bg-[oklch(0.82_0.075_25)]/10 text-[oklch(0.82_0.075_25)]",
  DEFAULT: "bg-[oklch(0.77_0.075_25)] text-white",
  text: "text-[oklch(0.82_0.075_25)]",
  },
  herb: {
  light: "bg-[oklch(0.88_0.045_125)]/10 text-[oklch(0.88_0.045_125)]",
  DEFAULT: "bg-[oklch(0.83_0.045_125)] text-white",
  text: "text-[oklch(0.88_0.045_125)]",
  },
  cosmetic: {
  light: "bg-[oklch(0.89_0.065_320)]/10 text-[oklch(0.89_0.065_320)]",
  DEFAULT: "bg-[oklch(0.84_0.065_320)] text-white",
  text: "text-[oklch(0.89_0.065_320)]",
  },
  product: {
  light: "bg-[oklch(0.90_0.08_90)]/10 text-[oklch(0.90_0.08_90)]",
  DEFAULT: "bg-[oklch(0.85_0.08_90)] text-white",
  text: "text-[oklch(0.90_0.08_90)]",
  },
  } as const

/\*\*

- Цвета для прогресса (goals)
  \*/
  export const progressColors = {
  complete: {
  DEFAULT: "bg-[oklch(0.87_0.06_150)]",
  },
  almost: {
  DEFAULT: "bg-[oklch(0.90_0.055_70)]",
  },
  halfway: {
  DEFAULT: "bg-[oklch(0.85_0.065_200)]",
  },
  low: {
  DEFAULT: "bg-[oklch(0.80_0.065_200)]",
  },
  } as const

/\*\*

- Цвета для статусов привычек
  \*/
  export const habitStatusColors = {
  completed: {
  light: "bg-[oklch(0.87_0.06_150)]",
  DEFAULT: "bg-[oklch(0.82_0.06_150)]",
  text: "text-[oklch(0.87_0.06_150)]",
  },
  skipped: {
  light: "bg-[oklch(0.90_0.055_70)]/30 text-[oklch(0.90_0.055_70)]",
  DEFAULT: "bg-[oklch(0.85_0.055_70)]",
  text: "text-[oklch(0.90_0.055_70)]",
  },
  negative: {
  light: "bg-[oklch(0.82_0.075_25)]/10 text-[oklch(0.82_0.075_25)]",
  DEFAULT: "bg-[oklch(0.77_0.075_25)]",
  text: "text-[oklch(0.82_0.075_25)]",
  },
  weekend: {
  light: "bg-[oklch(0.90_0.055_70)]/10",
  DEFAULT: "",
  text: "text-[oklch(0.90_0.055_70)]/70",
  },
  } as const

/\*\*

- Цвет для FAB - яркий терракотовый (oklch(0.70 0.25 40))
  \*/
  export const fabColor = {
  light: "bg-[oklch(0.75_0.20_40)]",
  DEFAULT: "bg-[oklch(0.70_0.25_40)]",
  text: "text-white",
  shadow: "shadow-[oklch(0.70_0.25_40)/0.25]",
  }

/\*\*

- Палитра цветов для привычек
  \*/
  export const habitPalette = [
  {
  bg: "bg-[oklch(0.60_0.22_30)]",
  light: "bg-[oklch(0.70_0.18_30)]",
  text: "text-[oklch(0.65_0.22_30)]",
  name: "Красный",
  },
  {
  bg: "bg-[oklch(0.65_0.18_70)]",
  light: "bg-[oklch(0.75_0.14_70)]",
  text: "text-[oklch(0.70_0.18_70)]",
  name: "Оранжевый",
  },
  {
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

/\*_ Alias для habitPalette - цвета для выбора в форме привычек _/
export const habitColors = habitPalette

/\*_ Интерфейс для хелпера создания классов модуля _/
export interface ModuleColorHelperOptions {
module: ModuleType
variant?: "light" | "DEFAULT" | "text" | "border" | "shadow"
custom?: string
}

/\*\*

- Хелпер для получения классов цвета модуля
-
- @example
- // Простой способ
- <div className={getModuleColor('food', 'light')}>
-
- @example
- // С дополнительными классами
- <div className={cn(getModuleColor('food', 'light'), "p-4")}>
   */
  export function getModuleColor(
    module: ModuleType,
    variant: ModuleColorHelperOptions["variant"] = "light"
  ): string {
    const scheme = moduleColors[module]
    return scheme[variant === "DEFAULT" ? "DEFAULT" : variant] || ""
  }

/\*\*

- Компонентный хелпер для применения цветов модуля
  \*/
  export function useModuleColors(module: ModuleType) {
  return moduleColors[module]
  }

/\*\*

- Утилита для создания унифицированного стиля карточки модуля
  \*/
  export function cnModuleCard(module: ModuleType, extraClasses?: string) {
  const colors = moduleColors[module]
  return cn(
  colors.light,
  "border border-transparent hover:border-[--border]",
  "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
  extraClasses
  )
  }

/\*\*

- Утилита для создания унифицированного стиля кнопки действия модуля
  \*/
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

/\*\*

- Утилита для создания стиля иконки модуля
  \*/
  export function cnModuleIcon(module: ModuleType, extraClasses?: string) {
  const colors = moduleColors[module]
  return cn(colors.DEFAULT, "text-white", extraClasses)
  }

/\*\*

- Карта соответствия типов логов к модулям
  \*/
  export const logTypeToModule: Record<string, ModuleType> = {
  food: "food",
  workout: "workout",
  finance: "finance",
  water: "water",
  sleep: "sleep",
  mood: "mood",
  }

/\*\*

- Получить цвет модуля по типу лога
  \*/
  export function getModuleByLogType(logType: string): ModuleType {
  return logTypeToModule[logType] || "logs"
  }
