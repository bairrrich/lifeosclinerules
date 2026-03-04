/**
 * Централизованный реестр конфигураций
 * Содержит все статические данные для форм и настроек
 */

import {
  Utensils,
  Dumbbell,
  Wallet,
  ChefHat,
  Package,
  Edit3,
  BookOpen,
  Bell,
  Target,
  Flame,
} from "@/lib/icons"
import { reminderPriorityColors } from "@/lib/theme-colors"

// ============================================
// FOOD CONFIGURATIONS
// ============================================

export const foodSourceTypes = (t: (key: string) => string) => [
  { value: "custom", label: t("food.sourceTypes.custom"), icon: Edit3 },
  { value: "recipe", label: t("food.sourceTypes.recipe"), icon: ChefHat },
  { value: "product", label: t("food.sourceTypes.product"), icon: Package },
]

export const foodProductCategories = (t: (key: string) => string) => ({
  [t("food.productCategories.dairy")]: {
    [t("food.products.dairy.milk32")]: { calories: 61, protein: 3, fat: 3.2, carbs: 4.7 },
    [t("food.products.dairy.milk25")]: { calories: 52, protein: 2.8, fat: 2.5, carbs: 4.7 },
    [t("food.products.dairy.milk15")]: { calories: 44, protein: 2.8, fat: 1.5, carbs: 4.7 },
    [t("food.products.dairy.hardCheese")]: { calories: 352, protein: 26, fat: 28, carbs: 0.1 },
    [t("food.products.dairy.softCheese")]: { calories: 300, protein: 20, fat: 24, carbs: 0.5 },
    [t("food.products.dairy.cottageCheese0")]: { calories: 71, protein: 16.5, fat: 0, carbs: 1.3 },
    [t("food.products.dairy.cottageCheese5")]: { calories: 121, protein: 17, fat: 5, carbs: 1.8 },
    [t("food.products.dairy.cottageCheese9")]: { calories: 159, protein: 16.7, fat: 9, carbs: 2 },
  },
  [t("food.productCategories.meat")]: {
    [t("food.products.meat.beefFillet")]: { calories: 170, protein: 20, fat: 9, carbs: 0 },
    [t("food.products.meat.beefBrisket")]: { calories: 217, protein: 18, fat: 16, carbs: 0 },
    [t("food.products.meat.chickenBreast")]: { calories: 113, protein: 23, fat: 1, carbs: 0 },
    [t("food.products.meat.chickenThigh")]: { calories: 185, protein: 19, fat: 11, carbs: 0 },
    [t("food.products.meat.turkeyBreast")]: { calories: 84, protein: 19, fat: 0.5, carbs: 0 },
  },
  [t("food.productCategories.fish")]: {
    [t("food.products.fish.troutFresh")]: { calories: 97, protein: 19, fat: 2, carbs: 0 },
    [t("food.products.fish.salmonFresh")]: { calories: 142, protein: 20, fat: 6, carbs: 0 },
    [t("food.products.fish.codFresh")]: { calories: 78, protein: 17, fat: 0.7, carbs: 0 },
    [t("food.products.fish.tunaCanned")]: { calories: 116, protein: 23, fat: 1, carbs: 0 },
  },
  [t("food.productCategories.vegetables")]: {
    [t("food.products.vegetables.potato")]: { calories: 77, protein: 2, fat: 0.4, carbs: 17 },
    [t("food.products.vegetables.carrot")]: { calories: 32, protein: 1.3, fat: 0.1, carbs: 7 },
    [t("food.products.vegetables.cucumber")]: { calories: 15, protein: 0.8, fat: 0.1, carbs: 3 },
    [t("food.products.vegetables.tomato")]: { calories: 18, protein: 0.9, fat: 0.2, carbs: 4 },
  },
  [t("food.productCategories.fruits")]: {
    [t("food.products.fruits.apple")]: { calories: 47, protein: 0.4, fat: 0.4, carbs: 10 },
    [t("food.products.fruits.banana")]: { calories: 89, protein: 1.1, fat: 0.3, carbs: 23 },
    [t("food.products.fruits.orange")]: { calories: 43, protein: 0.9, fat: 0.2, carbs: 9 },
  },
  [t("food.productCategories.grainsAndLegumes")]: {
    [t("food.products.grains.riceWhiteDry")]: { calories: 344, protein: 6.7, fat: 0.7, carbs: 78 },
    [t("food.products.grains.buckwheatDry")]: { calories: 313, protein: 12.6, fat: 3.3, carbs: 62 },
    [t("food.products.grains.oatmealDry")]: { calories: 342, protein: 12, fat: 6, carbs: 60 },
  },
})

// ============================================
// FINANCE CONFIGURATIONS
// ============================================

export const financeCategories = {
  income: {
    Зарплата: { subcategories: { Основная: [], Премия: [], Надбавка: [] } },
    Фриланс: { subcategories: { Разработка: [], Дизайн: [], Консультации: [] } },
    Инвестиции: { subcategories: { Дивиденды: [], Проценты: [], Купоны: [] } },
    Прочее: { subcategories: { Подарки: [], Возврат: [], Другое: [] } },
  },
  expense: {
    Продукты: {
      subcategories: {
        Молочные: ["Молоко", "Сыр", "Творог", "Сметана", "Кефир", "Йогурт"],
        Мясо: ["Говядина", "Свинина", "Курица", "Индейка"],
        Овощи: ["Картофель", "Морковь", "Лук", "Огурцы", "Помидоры", "Капуста"],
        Фрукты: ["Яблоки", "Бананы", "Апельсины", "Мандарины"],
      },
    },
    Транспорт: {
      subcategories: {
        Такси: ["Яндекс.Такси", "Uber"],
        Топливо: ["Лукойл", "Газпром", "Роснефть"],
      },
    },
    Развлечения: {
      subcategories: {
        Кино: [],
        Концерты: [],
        "Кафе/Рестораны": [],
        Подписки: ["Netflix", "Яндекс.Плюс"],
      },
    },
    Здоровье: {
      subcategories: { Аптека: ["Аптека.ру", "Ригла"], Врач: [], Спортзал: [] },
    },
  },
  transfer: {
    Перевод: {
      subcategories: {
        "На карту": ["Сбербанк", "Тинькофф", "Альфа"],
        "На счёт": [],
      },
    },
  },
}

export const financeSuppliers: Record<string, string[]> = {
  Продукты: ["Магнит", "Пятёрочка", "Азбука Вкуса", "Перекрёсток"],
  Транспорт: ["Яндекс.Такси", "Uber", "Лукойл", "Газпром"],
  Развлечения: ["Netflix", "Яндекс.Плюс", "Кинотеатр"],
  Здоровье: ["Аптека.ру", "Ригла", "Живика"],
  default: [],
}

// ============================================
// WORKOUT CONFIGURATIONS
// ============================================

export const workoutStrengthSubcategories = {
  Грудь: ["Жим лёжа", "Жим на наклонной", "Отжимания на брусьях"],
  Спина: ["Становая тяга", "Подтягивания", "Тяга штанги в наклоне"],
  Ноги: ["Приседания", "Жим ногами", "Выпады"],
  Плечи: ["Жим стоя", "Тяга к подбородку", "Махи гантелями"],
  Руки: ["Подъём на бицепс", "Французский жим", "Молотки"],
  Пресс: ["Скручивания", "Планка", "Подъём ног"],
}

export const workoutCardioSubcategories = {
  Бег: ["Тренировка", "Интервалы", "Длительный"],
  Велосипед: ["Тренировка", "Интервалы", "Прогулка"],
  Плавание: ["Тренировка", "Интервалы"],
  Ходьба: ["Прогулка", "Скандинавская"],
}

// ============================================
// RECIPE CONFIGURATIONS
// ============================================

export const recipeCourseTypes = (t: (key: string) => string) => [
  { value: "breakfast", label: t("recipes.courseTypes.breakfast") },
  { value: "lunch", label: t("recipes.courseTypes.lunch") },
  { value: "dinner", label: t("recipes.courseTypes.dinner") },
  { value: "snack", label: t("recipes.courseTypes.snack") },
  { value: "dessert", label: t("recipes.courseTypes.dessert") },
]

export const recipeCookingMethods = (t: (key: string) => string) => [
  { value: "boiled", label: t("recipes.cookingMethods.boiled") },
  { value: "fried", label: t("recipes.cookingMethods.fried") },
  { value: "baked", label: t("recipes.cookingMethods.baked") },
  { value: "steamed", label: t("recipes.cookingMethods.steamed") },
  { value: "grilled", label: t("recipes.cookingMethods.grilled") },
  { value: "raw", label: t("recipes.cookingMethods.raw") },
]

export const recipeCuisines = (t: (key: string) => string) => [
  { value: "russian", label: t("recipes.cuisines.russian") },
  { value: "european", label: t("recipes.cuisines.european") },
  { value: "asian", label: t("recipes.cuisines.asian") },
  { value: "mediterranean", label: t("recipes.cuisines.mediter ranean") },
  { value: "american", label: t("recipes.cuisines.american") },
]

// ============================================
// REMINDER CONFIGURATIONS
// ============================================

export const reminderTypes = (t: (key: string) => string) => [
  { value: "medication", label: t("reminders.types.medication"), icon: Bell },
  { value: "habit", label: t("reminders.types.habit"), icon: Flame },
  { value: "task", label: t("reminders.types.task"), icon: Target },
  { value: "event", label: t("reminders.types.event"), icon: BookOpen },
]

export const reminderPriorities = (t: (key: string) => string) => [
  { value: "low", label: t("reminders.priorities.low"), color: reminderPriorityColors.low },
  {
    value: "medium",
    label: t("reminders.priorities.medium"),
    color: reminderPriorityColors.medium,
  },
  { value: "high", label: t("reminders.priorities.high"), color: reminderPriorityColors.high },
]

export const reminderAdvanceOptions = (t: (key: string) => string) => [
  { value: "0", label: t("reminders.advance.exactly") },
  { value: "5", label: t("reminders.advance.minutes5") },
  { value: "10", label: t("reminders.advance.minutes10") },
  { value: "15", label: t("reminders.advance.minutes15") },
  { value: "30", label: t("reminders.advance.minutes30") },
  { value: "60", label: t("reminders.advance.hour1") },
  { value: "120", label: t("reminders.advance.hour2") },
]

// ============================================
// BOOK CONFIGURATIONS
// ============================================

export const bookFormats = ["paperback", "hardcover", "ebook", "audiobook"] as const
export type BookFormat = (typeof bookFormats)[number]

export const bookLanguages = ["ru", "en", "de", "fr", "es", "it", "ja", "zh", "other"] as const
export type BookLanguage = (typeof bookLanguages)[number]

// ============================================
// ACCOUNT CONFIGURATIONS
// ============================================

export const accountTypes = (t: (key: string) => string) => [
  { value: "cash", label: t("settings.accounts.accountTypes.cash"), icon: "💵" },
  { value: "card", label: t("settings.accounts.accountTypes.card"), icon: "💳" },
  { value: "bank", label: t("settings.accounts.accountTypes.bank"), icon: "🏦" },
  { value: "deposit", label: t("settings.accounts.accountTypes.deposit"), icon: "📈" },
  { value: "investment", label: t("settings.accounts.accountTypes.investment"), icon: "📊" },
  { value: "crypto", label: t("settings.accounts.accountTypes.crypto"), icon: "₿" },
]
