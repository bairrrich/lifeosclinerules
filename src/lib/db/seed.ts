import { db } from "./index"
import type {
  Log,
  Item,
  Content,
  Category,
  Tag,
  Account,
  Unit,
  RecipeContentExtended,
  Book,
  UserBook,
  Author,
  BookAuthor,
  Genre,
  BookGenre,
  RecipeIngredient,
  RecipeIngredientItem,
  RecipeStep,
} from "@/types"
import { LogType, FinanceType, ItemType, ContentType, BookStatus, RecipeType } from "@/types"

// ============================================
// Helper Functions
// ============================================

function uuid(): string {
  return crypto.randomUUID()
}

function getTimestamp(): string {
  return new Date().toISOString()
}

function getDateDaysAgo(daysAgo: number, hour: number = 12, minute: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ============================================
// Reference Data
// ============================================

const FOOD_MEALS = [
  { title: "Овсянка с ягодами и мёдом", calories: 350, protein: 10, fat: 8, carbs: 55 },
  { title: "Яичница с тостом и авокадо", calories: 420, protein: 18, fat: 25, carbs: 30 },
  { title: "Гречка с молоком", calories: 320, protein: 12, fat: 6, carbs: 58 },
  { title: "Сырники со сметаной", calories: 450, protein: 20, fat: 22, carbs: 35 },
  { title: "Омлет с овощами", calories: 380, protein: 22, fat: 28, carbs: 8 },
  { title: "Блинчики с творогом", calories: 400, protein: 15, fat: 18, carbs: 48 },
  { title: "Мюсли с йогуртом", calories: 340, protein: 12, fat: 10, carbs: 52 },
]

const FOOD_LUNCH = [
  { title: "Борщ со сметаной", calories: 380, protein: 18, fat: 15, carbs: 42 },
  { title: "Куриный суп с лапшой", calories: 320, protein: 22, fat: 10, carbs: 35 },
  { title: "Гречка с куриным филе", calories: 450, protein: 35, fat: 12, carbs: 48 },
  { title: "Рис с овощами и креветками", calories: 420, protein: 25, fat: 8, carbs: 58 },
  { title: "Паста с томатным соусом", calories: 480, protein: 14, fat: 12, carbs: 72 },
  { title: "Салат Цезарь с курицей", calories: 380, protein: 32, fat: 18, carbs: 15 },
  { title: "Плов с говядиной", calories: 520, protein: 28, fat: 18, carbs: 55 },
]

const FOOD_DINNER = [
  { title: "Стейк с овощами гриль", calories: 550, protein: 42, fat: 28, carbs: 18 },
  { title: "Лосось запечённый с картофелем", calories: 480, protein: 38, fat: 22, carbs: 32 },
  { title: "Куриная грудка с рисом", calories: 420, protein: 40, fat: 8, carbs: 45 },
  { title: "Творожная запеканка", calories: 350, protein: 28, fat: 12, carbs: 32 },
  { title: "Овощное рагу с индейкой", calories: 400, protein: 32, fat: 10, carbs: 38 },
  { title: "Суши сет (12 шт)", calories: 520, protein: 24, fat: 12, carbs: 68 },
  { title: "Гречка с грибами", calories: 320, protein: 12, fat: 8, carbs: 52 },
]

const FOOD_SNACKS = [
  { title: "Яблоко", calories: 80, protein: 0, fat: 0, carbs: 20 },
  { title: "Греческий йогурт", calories: 150, protein: 15, fat: 5, carbs: 8 },
  { title: "Орехи микс (30г)", calories: 180, protein: 5, fat: 16, carbs: 6 },
  { title: "Банан", calories: 100, protein: 1, fat: 0, carbs: 25 },
  { title: "Творог с ягодами", calories: 180, protein: 18, fat: 5, carbs: 15 },
  { title: "Хлебцы с сыром", calories: 140, protein: 6, fat: 8, carbs: 12 },
  { title: "Протеиновый батончик", calories: 200, protein: 20, fat: 8, carbs: 18 },
]

const WORKOUT_STRENGTH = [
  {
    title: "Жим лёжа",
    category: "Силовая",
    subcategory: "chest",
    duration: 45,
    intensity: "high" as const,
    exercises_count: 4,
    sets_count: 16,
    total_weight: 2400,
  },
  {
    title: "Приседания со штангой",
    category: "Силовая",
    subcategory: "legs",
    duration: 50,
    intensity: "high" as const,
    exercises_count: 5,
    sets_count: 20,
    total_weight: 1800,
  },
  {
    title: "Становая тяга",
    category: "Силовая",
    subcategory: "back",
    duration: 40,
    intensity: "high" as const,
    exercises_count: 4,
    sets_count: 16,
    total_weight: 3200,
  },
  {
    title: "Жим стоя (армейский)",
    category: "Силовая",
    subcategory: "shoulders",
    duration: 35,
    intensity: "medium" as const,
    exercises_count: 3,
    sets_count: 12,
    total_weight: 600,
  },
  {
    title: "Подтягивания",
    category: "Силовая",
    subcategory: "back",
    duration: 30,
    intensity: "medium" as const,
    exercises_count: 3,
    sets_count: 9,
    total_weight: 0,
  },
  {
    title: "Отжимания на брусьях",
    category: "Силовая",
    subcategory: "arms",
    duration: 25,
    intensity: "medium" as const,
    exercises_count: 3,
    sets_count: 9,
    total_weight: 0,
  },
]

const WORKOUT_CARDIO = [
  {
    title: "Бег на дорожке",
    category: "Кардио",
    subcategory: "running",
    duration: 30,
    intensity: "medium" as const,
    distance: 5,
    average_speed: 10,
  },
  {
    title: "Велотренажёр",
    category: "Кардио",
    subcategory: "cycling",
    duration: 40,
    intensity: "medium" as const,
    distance: 15,
    average_speed: 22,
  },
  {
    title: "Эллипсоид",
    category: "Кардио",
    subcategory: "liss",
    duration: 35,
    intensity: "low" as const,
    distance: 6,
    average_speed: 10,
  },
  {
    title: "HIIT тренировка",
    category: "Кардио",
    subcategory: "hiit",
    duration: 25,
    intensity: "high" as const,
    rounds: 8,
  },
  {
    title: "Прыжки на скакалке",
    category: "Кардио",
    subcategory: "jumping",
    duration: 15,
    intensity: "high" as const,
  },
  {
    title: "Гребля",
    category: "Кардио",
    subcategory: "rowing",
    duration: 20,
    intensity: "medium" as const,
    distance: 3,
  },
]

const WORKOUT_YOGA = [
  {
    title: "Хатха-йога",
    category: "Йога",
    subcategory: "hatha",
    duration: 60,
    intensity: "low" as const,
    level: "beginner" as const,
    focus: "flexibility" as const,
  },
  {
    title: "Виньяса-флоу",
    category: "Йога",
    subcategory: "vinyasa",
    duration: 45,
    intensity: "medium" as const,
    level: "intermediate" as const,
    focus: "strength" as const,
  },
  {
    title: "Утренняя йога",
    category: "Йога",
    subcategory: "beginner",
    duration: 20,
    intensity: "low" as const,
    level: "beginner" as const,
    focus: "flexibility" as const,
  },
  {
    title: "Йога для сна",
    category: "Йога",
    subcategory: "relax",
    duration: 30,
    intensity: "low" as const,
    level: "beginner" as const,
    focus: "relaxation" as const,
  },
  {
    title: "Силовая йога",
    category: "Йога",
    subcategory: "power",
    duration: 50,
    intensity: "high" as const,
    level: "advanced" as const,
    focus: "strength" as const,
  },
  {
    title: "Стретчинг",
    category: "Йога",
    subcategory: "stretching",
    duration: 40,
    intensity: "low" as const,
    level: "intermediate" as const,
    focus: "flexibility" as const,
  },
]

const FINANCE_INCOME = [
  { title: "Зарплата", value: 85000, category: "Зарплата", subcategory: "Основная" },
  { title: "Премия квартальная", value: 25000, category: "Зарплата", subcategory: "Премия" },
  { title: "Фриланс проект", value: 35000, category: "Фриланс", subcategory: "Разработка" },
  { title: "Кэшбэк", value: 1500, category: "Прочее", subcategory: "Кэшбэк" },
  { title: "Проценты по вкладу", value: 3200, category: "Инвестиции", subcategory: "Проценты" },
]

const FINANCE_EXPENSE = [
  { title: "Продукты → Молочные", value: 1200, category: "Продукты", subcategory: "Молочные" },
  { title: "Продукты → Мясо", value: 2500, category: "Продукты", subcategory: "Мясо" },
  { title: "Продукты → Овощи", value: 800, category: "Продукты", subcategory: "Овощи" },
  { title: "Продукты → Фрукты", value: 1000, category: "Продукты", subcategory: "Фрукты" },
  { title: "Кафе/Рестораны", value: 2500, category: "Развлечения", subcategory: "Кафе" },
  { title: "Такси", value: 450, category: "Транспорт", subcategory: "Такси" },
  { title: "Метро (пополнение)", value: 2000, category: "Транспорт", subcategory: "Общественный" },
  { title: "Аптека", value: 850, category: "Здоровье", subcategory: "Аптека" },
  { title: "Мобильная связь", value: 500, category: "Связь", subcategory: "Мобильная" },
  { title: "Интернет", value: 700, category: "Связь", subcategory: "Интернет" },
  { title: "Подписка Netflix", value: 450, category: "Развлечения", subcategory: "Подписки" },
  { title: "Фитнес-клуб", value: 3500, category: "Спорт", subcategory: "Абонемент" },
  { title: "Одежда", value: 4500, category: "Покупки", subcategory: "Одежда" },
  { title: "Книги", value: 1200, category: "Образование", subcategory: "Книги" },
]

// ============================================
// Seed Functions
// ============================================

export async function seedCategories(): Promise<Category[]> {
  // Получаем все существующие категории
  const existingCategories = await db.categories.toArray()
  const existingKeys = new Set(existingCategories.map((c) => `${c.type}-${c.name}`))

  const now = getTimestamp()
  const allCategories: Category[] = [
    // Питание
    {
      id: uuid(),
      type: LogType.FOOD,
      name: "breakfast",
      icon: "sunrise",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FOOD,
      name: "lunch",
      icon: "sun",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FOOD,
      name: "dinner",
      icon: "moon",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FOOD,
      name: "snack",
      icon: "cookie",
      created_at: now,
      updated_at: now,
    },
    // Тренировки
    {
      id: uuid(),
      type: LogType.WORKOUT,
      name: "strength",
      icon: "dumbbell",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.WORKOUT,
      name: "cardio",
      icon: "heart",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.WORKOUT,
      name: "yoga",
      icon: "stretch",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.WORKOUT,
      name: "stretching",
      icon: "stretch",
      created_at: now,
      updated_at: now,
    },
    // Финансы - доходы
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "salary",
      icon: "wallet",
      finance_type: FinanceType.INCOME,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "freelance",
      icon: "laptop",
      finance_type: FinanceType.INCOME,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "investments",
      icon: "trending-up",
      finance_type: FinanceType.INCOME,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "other_income",
      icon: "more-horizontal",
      finance_type: FinanceType.INCOME,
      created_at: now,
      updated_at: now,
    },
    // Финансы - расходы
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "food",
      icon: "shopping-cart",
      finance_type: FinanceType.EXPENSE,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "transport",
      icon: "car",
      finance_type: FinanceType.EXPENSE,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "utilities",
      icon: "home",
      finance_type: FinanceType.EXPENSE,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "entertainment",
      icon: "gamepad",
      finance_type: FinanceType.EXPENSE,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "shopping",
      icon: "bag",
      finance_type: FinanceType.EXPENSE,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "health",
      icon: "pill",
      finance_type: FinanceType.EXPENSE,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "education",
      icon: "book",
      finance_type: FinanceType.EXPENSE,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "rent",
      icon: "home",
      finance_type: FinanceType.EXPENSE,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: LogType.FINANCE,
      name: "other_expense",
      icon: "more-horizontal",
      finance_type: FinanceType.EXPENSE,
      created_at: now,
      updated_at: now,
    },
  ]

  // Фильтруем только те категории, которых ещё нет
  const newCategories = allCategories.filter((cat) => !existingKeys.has(`${cat.type}-${cat.name}`))

  if (newCategories.length > 0) {
    await db.categories.bulkAdd(newCategories)
  }

  // Возвращаем все категории (и существующие, и новые)
  return [...existingCategories, ...newCategories]
}

async function seedTags(): Promise<void> {
  const existingTags = await db.tags.count()
  if (existingTags > 0) return

  const now = getTimestamp()
  const tags: Tag[] = [
    { id: uuid(), name: "полезно", created_at: now, updated_at: now },
    { id: uuid(), name: "вкусно", created_at: now, updated_at: now },
    { id: uuid(), name: "быстро", created_at: now, updated_at: now },
    { id: uuid(), name: "важно", created_at: now, updated_at: now },
    { id: uuid(), name: "проверено", created_at: now, updated_at: now },
    { id: uuid(), name: "любимое", created_at: now, updated_at: now },
  ]
  await db.tags.bulkAdd(tags)
}

export async function seedUnits(): Promise<void> {
  const existingUnits = await db.units.count()
  if (existingUnits > 0) return

  const now = getTimestamp()
  const units: Unit[] = [
    // Вес
    { id: "g", name: "g", abbreviation: "г", type: "weight", created_at: now, updated_at: now },
    {
      id: "kg",
      name: "kg",
      abbreviation: "кг",
      type: "weight",
      created_at: now,
      updated_at: now,
    },
    {
      id: "mg",
      name: "mg",
      abbreviation: "мг",
      type: "weight",
      created_at: now,
      updated_at: now,
    },

    // Объём
    {
      id: "ml",
      name: "ml",
      abbreviation: "мл",
      type: "volume",
      created_at: now,
      updated_at: now,
    },
    { id: "l", name: "l", abbreviation: "л", type: "volume", created_at: now, updated_at: now },
    {
      id: "tsp",
      name: "tsp",
      abbreviation: "ч.л.",
      type: "volume",
      created_at: now,
      updated_at: now,
    },
    {
      id: "tbsp",
      name: "tbsp",
      abbreviation: "ст.л.",
      type: "volume",
      created_at: now,
      updated_at: now,
    },
    {
      id: "cup",
      name: "cup",
      abbreviation: "стакан",
      type: "volume",
      created_at: now,
      updated_at: now,
    },
    {
      id: "oz",
      name: "oz",
      abbreviation: "oz",
      type: "volume",
      created_at: now,
      updated_at: now,
    },
    {
      id: "drop",
      name: "drop",
      abbreviation: "капля",
      type: "volume",
      created_at: now,
      updated_at: now,
    },
    {
      id: "dash",
      name: "dash",
      abbreviation: "dash",
      type: "volume",
      created_at: now,
      updated_at: now,
    },

    // Штуки
    {
      id: "pcs",
      name: "штука",
      abbreviation: "шт",
      type: "count",
      created_at: now,
      updated_at: now,
    },
    {
      id: "clove",
      name: "зубчик",
      abbreviation: "зубч.",
      type: "count",
      created_at: now,
      updated_at: now,
    },
    {
      id: "pinch",
      name: "щепотка",
      abbreviation: "щепотка",
      type: "count",
      created_at: now,
      updated_at: now,
    },
    {
      id: "taste",
      name: "по вкусу",
      abbreviation: "по вкусу",
      type: "count",
      created_at: now,
      updated_at: now,
    },

    // Время
    {
      id: "min",
      name: "минута",
      abbreviation: "мин",
      type: "time",
      created_at: now,
      updated_at: now,
    },
    { id: "hour", name: "час", abbreviation: "ч", type: "time", created_at: now, updated_at: now },

    // Деньги
    {
      id: "rub",
      name: "рубль",
      abbreviation: "₽",
      type: "money",
      created_at: now,
      updated_at: now,
    },
    {
      id: "usd",
      name: "доллар",
      abbreviation: "$",
      type: "money",
      created_at: now,
      updated_at: now,
    },
    { id: "eur", name: "евро", abbreviation: "€", type: "money", created_at: now, updated_at: now },
  ]

  await db.units.bulkAdd(units)
}

async function seedAccounts(): Promise<Account[]> {
  const existingAccounts = await db.accounts.count()
  if (existingAccounts > 0) {
    return db.accounts.toArray()
  }

  const now = getTimestamp()
  const accounts: Account[] = [
    // Наличные
    {
      id: uuid(),
      name: "cash",
      type: "cash",
      balance: 0,
      currency: "RUB",
      created_at: now,
      updated_at: now,
    },
    // Банковские карты
    {
      id: uuid(),
      name: "card",
      type: "card",
      balance: 0,
      currency: "RUB",
      created_at: now,
      updated_at: now,
    },
    // Банковские счета
    {
      id: uuid(),
      name: "bank",
      type: "bank",
      balance: 0,
      currency: "RUB",
      created_at: now,
      updated_at: now,
    },
    // Вклады
    {
      id: uuid(),
      name: "Вклад",
      type: "deposit",
      balance: 0,
      currency: "RUB",
      created_at: now,
      updated_at: now,
    },
    // Инвестиции
    {
      id: uuid(),
      name: "Брокерский счёт",
      type: "investment",
      balance: 0,
      currency: "RUB",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "ИИС",
      type: "investment",
      balance: 0,
      currency: "RUB",
      created_at: now,
      updated_at: now,
    },
    // Криптовалюты
    {
      id: uuid(),
      name: "Крипто-кошелёк",
      type: "crypto",
      balance: 0,
      currency: "USD",
      created_at: now,
      updated_at: now,
    },
  ]
  await db.accounts.bulkAdd(accounts)
  return accounts
}

async function seedLogs(categories: Category[], accounts: Account[]): Promise<void> {
  const existingLogs = await db.logs.count()
  if (existingLogs > 0) return

  const logs: Log[] = []
  const now = getTimestamp()

  // Получаем категории
  const breakfastCat = categories.find((c) => c.type === LogType.FOOD && c.name === "Завтрак")!
  const lunchCat = categories.find((c) => c.type === LogType.FOOD && c.name === "Обед")!
  const dinnerCat = categories.find((c) => c.type === LogType.FOOD && c.name === "Ужин")!
  const snackCat = categories.find((c) => c.type === LogType.FOOD && c.name === "Перекус")!
  const strengthCat = categories.find((c) => c.type === LogType.WORKOUT && c.name === "Силовая")!
  const cardioCat = categories.find((c) => c.type === LogType.WORKOUT && c.name === "Кардио")!
  const yogaCat = categories.find((c) => c.type === LogType.WORKOUT && c.name === "Йога")!

  const cashAccount = accounts.find((a) => a.name === "Наличные")!
  const sberAccount = accounts.find((a) => a.name === "Сбербанк")!
  const tinkoffAccount = accounts.find((a) => a.name === "Тинькофф")!

  // ============================================
  // ПИТАНИЕ: План на неделю (7 дней × 4 приёма пищи = 28 записей)
  // ============================================
  for (let day = 6; day >= 0; day--) {
    // Завтрак
    const breakfast = randomFromArray(FOOD_MEALS)
    logs.push({
      id: uuid(),
      type: LogType.FOOD,
      date: getDateDaysAgo(day, 8, 0),
      title: breakfast.title,
      category_id: breakfastCat.id,
      value: breakfast.calories,
      metadata: {
        calories: breakfast.calories,
        protein: breakfast.protein,
        fat: breakfast.fat,
        carbs: breakfast.carbs,
      },
      tags: ["полезно"],
      created_at: now,
      updated_at: now,
    })

    // Обед
    const lunch = randomFromArray(FOOD_LUNCH)
    logs.push({
      id: uuid(),
      type: LogType.FOOD,
      date: getDateDaysAgo(day, 13, 0),
      title: lunch.title,
      category_id: lunchCat.id,
      value: lunch.calories,
      metadata: {
        calories: lunch.calories,
        protein: lunch.protein,
        fat: lunch.fat,
        carbs: lunch.carbs,
      },
      tags: ["вкусно"],
      created_at: now,
      updated_at: now,
    })

    // Ужин
    const dinner = randomFromArray(FOOD_DINNER)
    logs.push({
      id: uuid(),
      type: LogType.FOOD,
      date: getDateDaysAgo(day, 19, 0),
      title: dinner.title,
      category_id: dinnerCat.id,
      value: dinner.calories,
      metadata: {
        calories: dinner.calories,
        protein: dinner.protein,
        fat: dinner.fat,
        carbs: dinner.carbs,
      },
      tags: ["полезно", "вкусно"],
      created_at: now,
      updated_at: now,
    })

    // Перекус
    const snack = randomFromArray(FOOD_SNACKS)
    logs.push({
      id: uuid(),
      type: LogType.FOOD,
      date: getDateDaysAgo(day, 16, 30),
      title: snack.title,
      category_id: snackCat.id,
      value: snack.calories,
      metadata: {
        calories: snack.calories,
        protein: snack.protein,
        fat: snack.fat,
        carbs: snack.carbs,
      },
      tags: [],
      created_at: now,
      updated_at: now,
    })
  }

  // ============================================
  // ТРЕНИРОВКИ: Все упражнения за последнюю неделю
  // ============================================
  const allWorkouts = [...WORKOUT_STRENGTH, ...WORKOUT_CARDIO, ...WORKOUT_YOGA]

  for (let i = 0; i < allWorkouts.length; i++) {
    const w = allWorkouts[i]
    const day = 6 - (i % 7)
    const hour = 7 + (i % 12) // с 7 до 18

    let category_id: string
    if (w.category === "Силовая") category_id = strengthCat.id
    else if (w.category === "Кардио") category_id = cardioCat.id
    else category_id = yogaCat.id

    logs.push({
      id: uuid(),
      type: LogType.WORKOUT,
      date: getDateDaysAgo(day, hour, 0),
      title: w.title,
      category_id,
      metadata: {
        duration: w.duration,
        intensity: w.intensity,
        subcategory: w.subcategory,
        ...("exercises_count" in w &&
          w.exercises_count !== undefined && { exercises_count: w.exercises_count }),
        ...("sets_count" in w && w.sets_count !== undefined && { sets_count: w.sets_count }),
        ...("total_weight" in w &&
          w.total_weight !== undefined && { total_weight: w.total_weight }),
        ...("distance" in w && w.distance !== undefined && { distance: w.distance }),
        ...("average_speed" in w &&
          w.average_speed !== undefined && { average_speed: w.average_speed }),
        ...("rounds" in w && w.rounds !== undefined && { rounds: w.rounds }),
        ...("level" in w && w.level !== undefined && { level: w.level }),
        ...("focus" in w && w.focus !== undefined && { focus: w.focus }),
      } as import("@/types").WorkoutMetadata,
      tags: ["важно"],
      created_at: now,
      updated_at: now,
    })
  }

  // ============================================
  // ФИНАНСЫ: 3 операции в день за последнюю неделю (21 операция)
  // ============================================
  for (let day = 6; day >= 0; day--) {
    // Доход (1 раз за неделю - зарплата в начале)
    if (day === 6) {
      const income = FINANCE_INCOME[0]
      const cat = categories.find((c) => c.type === LogType.FINANCE && c.name === income.category)
      logs.push({
        id: uuid(),
        type: LogType.FINANCE,
        date: getDateDaysAgo(day, 10, 0),
        title: income.title,
        category_id: cat?.id,
        value: income.value,
        metadata: {
          finance_type: FinanceType.INCOME,
          account_id: sberAccount.id,
          category: income.category,
          subcategory: income.subcategory,
        },
        tags: [],
        created_at: now,
        updated_at: now,
      })
    }

    // Расходы (3 операции в день)
    for (let op = 0; op < 3; op++) {
      const expense = randomFromArray(FINANCE_EXPENSE)
      const cat = categories.find((c) => c.type === LogType.FINANCE && c.name === expense.category)
      const account = randomFromArray([sberAccount, tinkoffAccount, cashAccount])
      const hour = 10 + op * 3

      logs.push({
        id: uuid(),
        type: LogType.FINANCE,
        date: getDateDaysAgo(day, hour, randomInt(0, 59)),
        title: expense.title,
        category_id: cat?.id,
        value: expense.value,
        metadata: {
          finance_type: FinanceType.EXPENSE,
          account_id: account.id,
          category: expense.category,
          subcategory: expense.subcategory,
        },
        tags: [],
        created_at: now,
        updated_at: now,
      })
    }
  }

  await db.logs.bulkAdd(logs)
}

async function seedItems(): Promise<void> {
  const existingItems = await db.items.count()
  if (existingItems > 0) return

  const now = getTimestamp()
  const items: Item[] = [
    // ============================================
    // ВИТАМИНЫ (3 штуки)
    // ============================================
    {
      id: uuid(),
      type: ItemType.VITAMIN,
      name: "Витамин D3 2000 МЕ",
      category: "Витамины",
      description: "Для иммунитета и костей",
      dosage: "1 капсула в день с едой",
      form: "Капсулы, 60 шт",
      benefits: "Укрепляет кости, поддерживает иммунитет, улучшает настроение",
      manufacturer: "Solgar",
      tags: ["важно", "проверено"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ItemType.VITAMIN,
      name: "Омега-3 1000мг",
      category: "Витамины",
      description: "ПНЖК для сердца и мозга",
      dosage: "2 капсулы в день",
      form: "Капсулы, 90 шт",
      benefits: "Поддерживает сердечно-сосудистую систему, улучшает работу мозга",
      manufacturer: "NOW Foods",
      tags: ["важно"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ItemType.VITAMIN,
      name: "Витамин B-Complex",
      category: "Витамины",
      description: "Комплекс витаминов группы B",
      dosage: "1 таблетка в день",
      form: "Таблетки, 100 шт",
      benefits: "Энергия, нервная система, метаболизм",
      manufacturer: "Thorne",
      tags: ["полезно"],
      created_at: now,
      updated_at: now,
    },

    // ============================================
    // ЛЕКАРСТВА (3 штуки)
    // ============================================
    {
      id: uuid(),
      type: ItemType.MEDICINE,
      name: "Ибупрофен 400мг",
      category: "Обезболивающие",
      description: "НПВС от боли и воспаления",
      dosage: "1-2 таблетки до 3 раз в день",
      form: "Таблетки, 20 шт",
      contraindications: "Язва желудка, астма, беременность",
      manufacturer: "Тева",
      tags: ["проверено"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ItemType.MEDICINE,
      name: "Нимесил",
      category: "Обезболивающие",
      description: "Порошок от боли",
      dosage: "1 пакетик 2 раза в день",
      form: "Порошок, 9 пакетиков",
      contraindications: "Язва, печёночная недостаточность",
      manufacturer: "Berlin-Chemie",
      tags: [],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ItemType.MEDICINE,
      name: "Аспирин Кардио",
      category: "Сердечно-сосудистые",
      description: "Для разжижения крови",
      dosage: "1 таблетка в день",
      form: "Таблетки 100мг, 30 шт",
      contraindications: "Язва, аллергия на аспирин",
      manufacturer: "Bayer",
      tags: ["важно"],
      created_at: now,
      updated_at: now,
    },

    // ============================================
    // ТРАВЫ (3 штуки)
    // ============================================
    {
      id: uuid(),
      type: ItemType.HERB,
      name: "Ромашка аптечная",
      category: "Травы",
      description: "Успокоительное и противовоспалительное",
      usage: "1 фильтр-пакет на стакан кипятка, настоять 15 мин",
      form: "Фильтр-пакеты, 20 шт",
      benefits: "Успокаивает, улучшает сон, снимает воспаление",
      tags: ["полезно"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ItemType.HERB,
      name: "Мята перечная",
      category: "Травы",
      description: "Для пищеварения и расслабления",
      usage: "1-2 чайные ложки на стакан кипятка",
      form: "Сухие листья, 50г",
      benefits: "Улучшает пищеварение, снимает тошноту, расслабляет",
      tags: [],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ItemType.HERB,
      name: "Иван-чай",
      category: "Травы",
      description: "Традиционный русский напиток",
      usage: "1 чайная ложка на чашку, заваривать 10-15 мин",
      form: "Сухой лист, 100г",
      benefits: "Укрепляет иммунитет, успокаивает, без кофеина",
      tags: ["любимое"],
      created_at: now,
      updated_at: now,
    },

    // ============================================
    // КОСМЕТИКА (3 штуки)
    // ============================================
    {
      id: uuid(),
      type: ItemType.COSMETIC,
      name: "Увлажняющий крем для лица",
      category: "Уход за лицом",
      description: "Для сухой и нормальной кожи",
      usage: "Утром и вечером после очищения",
      form: "Крем 50мл",
      manufacturer: "La Roche-Posay",
      tags: ["проверено"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ItemType.COSMETIC,
      name: "Шампунь восстанавливающий",
      category: "Уход за волосами",
      description: "Для повреждённых волос",
      usage: "Нанести на влажные волосы, вспенить, смыть",
      form: "Шампунь 400мл",
      manufacturer: "L'Oreal",
      tags: [],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ItemType.COSMETIC,
      name: "Солнцезащитный крем SPF 50",
      category: "Защита от солнца",
      description: "Защита от UV-излучения",
      usage: "Наносить за 20 минут до выхода на солнце",
      form: "Крем 50мл",
      manufacturer: "Bioderma",
      tags: ["важно"],
      created_at: now,
      updated_at: now,
    },

    // ============================================
    // ПРОДУКТЫ (3 штуки)
    // ============================================
    {
      id: uuid(),
      type: ItemType.PRODUCT,
      name: "Молоко 3.2%",
      category: "Молочные",
      description: "Пастерилизованное коровье молоко",
      form: "1 литр",
      storage: "Хранить при температуре 2-6°C",
      expiration: getDateDaysAgo(-7),
      tags: [],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ItemType.PRODUCT,
      name: "Яйца куриные С0",
      category: "Молочные",
      description: "Яйца высшей категории",
      form: "10 штук",
      storage: "Хранить в холодильнике",
      expiration: getDateDaysAgo(-14),
      tags: [],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ItemType.PRODUCT,
      name: "Хлеб бородинский",
      category: "Выпечка",
      description: "Тёмный хлеб с солодом",
      form: "Буханка 300г",
      storage: "Хранить в сухом месте",
      expiration: getDateDaysAgo(-3),
      tags: ["любимое"],
      created_at: now,
      updated_at: now,
    },
  ]

  await db.items.bulkAdd(items)
}

async function seedBooks(): Promise<void> {
  const existingBooks = await db.books.count()
  if (existingBooks > 0) return

  const now = getTimestamp()

  // ============================================
  // АВТОРЫ
  // ============================================
  const authors: Author[] = [
    {
      id: uuid(),
      name: "Джеймс Клир",
      name_original: "James Clear",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Морган Хоузел",
      name_original: "Morgan Housel",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Даниэль Канеман",
      name_original: "Daniel Kahneman",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Роберт Кийосаки",
      name_original: "Robert Kiyosaki",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Кел Макгонигал",
      name_original: "Kelly McGonigal",
      created_at: now,
      updated_at: now,
    },
  ]

  // ============================================
  // ЖАНРЫ
  // ============================================
  const genres: Genre[] = [
    // Художественная литература
    { id: uuid(), name: "Фантастика", created_at: now, updated_at: now },
    { id: uuid(), name: "Фэнтези", created_at: now, updated_at: now },
    { id: uuid(), name: "Детектив", created_at: now, updated_at: now },
    { id: uuid(), name: "Роман", created_at: now, updated_at: now },
    { id: uuid(), name: "Приключения", created_at: now, updated_at: now },
    { id: uuid(), name: "Ужасы", created_at: now, updated_at: now },
    { id: uuid(), name: "Классика", created_at: now, updated_at: now },
    { id: uuid(), name: "Поэзия", created_at: now, updated_at: now },
    // Нон-фикшн
    { id: uuid(), name: "Саморазвитие", created_at: now, updated_at: now },
    { id: uuid(), name: "Финансы", created_at: now, updated_at: now },
    { id: uuid(), name: "Психология", created_at: now, updated_at: now },
    { id: uuid(), name: "Бизнес", created_at: now, updated_at: now },
    { id: uuid(), name: "Здоровье", created_at: now, updated_at: now },
    { id: uuid(), name: "История", created_at: now, updated_at: now },
    { id: uuid(), name: "Наука", created_at: now, updated_at: now },
    { id: uuid(), name: "Образование", created_at: now, updated_at: now },
    { id: uuid(), name: "Биография", created_at: now, updated_at: now },
    { id: uuid(), name: "Путешествия", created_at: now, updated_at: now },
    // Детям
    { id: uuid(), name: "Детская", created_at: now, updated_at: now },
    { id: uuid(), name: "Сказки", created_at: now, updated_at: now },
    // Другое
    { id: uuid(), name: "Искусство", created_at: now, updated_at: now },
    { id: uuid(), name: "Кулинария", created_at: now, updated_at: now },
    { id: uuid(), name: "Спорт", created_at: now, updated_at: now },
    { id: uuid(), name: "Техника", created_at: now, updated_at: now },
    { id: uuid(), name: "Компьютеры", created_at: now, updated_at: now },
  ]

  // ============================================
  // КНИГИ (5 штук)
  // ============================================
  const books: Book[] = [
    {
      id: uuid(),
      title: "Атомные привычки",
      description:
        "Как приобрести полезные привычки и избавиться от вредных. Проверенный способ развить хорошие привычки и победить вредные.",
      isbn13: "978-5-04-099189-7",
      published_year: 2018,
      language: "ru",
      format: "paperback",
      page_count: 320,
      rating_avg: 4.8,
      rating_count: 15420,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      title: "Психология денег",
      description:
        "Вечные истины о богатстве, жадности и счастье. Книга о том, как наши отношения с деньгами влияют на жизнь.",
      isbn13: "978-5-04-116782-4",
      published_year: 2020,
      language: "ru",
      format: "ebook",
      page_count: 256,
      rating_avg: 4.6,
      rating_count: 8930,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      title: "Думай медленно... решай быстро",
      description:
        "О двух системах мышления и о том, как мы принимаем решения. Нобелевская премия по экономике.",
      isbn13: "978-5-17-080653-5",
      published_year: 2011,
      language: "ru",
      format: "hardcover",
      page_count: 656,
      rating_avg: 4.7,
      rating_count: 12150,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      title: "Богатый папа, бедный папа",
      description:
        "Чему учат детей богатые родители — и не учат бедные. Классика финансовой грамотности.",
      isbn13: "978-5-17-095694-5",
      published_year: 1997,
      language: "ru",
      format: "paperback",
      page_count: 352,
      rating_avg: 4.5,
      rating_count: 25340,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      title: "Сила воли. Как развить и укрепить",
      description: "Как развить силу воли и достичь своих целей. Научный подход к самоконтролю.",
      isbn13: "978-5-17-087557-1",
      published_year: 2013,
      language: "ru",
      format: "audiobook",
      page_count: 288,
      rating_avg: 4.4,
      rating_count: 6780,
      created_at: now,
      updated_at: now,
    },
  ]

  // ============================================
  // СВЯЗИ КНИГИ-АВТОРЫ
  // ============================================
  const bookAuthors: BookAuthor[] = [
    {
      id: uuid(),
      book_id: books[0].id,
      author_id: authors[0].id,
      role: "author",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      book_id: books[1].id,
      author_id: authors[1].id,
      role: "author",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      book_id: books[2].id,
      author_id: authors[2].id,
      role: "author",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      book_id: books[3].id,
      author_id: authors[3].id,
      role: "author",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      book_id: books[4].id,
      author_id: authors[4].id,
      role: "author",
      order: 1,
      created_at: now,
      updated_at: now,
    },
  ]

  // ============================================
  // СВЯЗИ КНИГИ-ЖАНРЫ
  // ============================================
  const bookGenres: BookGenre[] = [
    { id: uuid(), book_id: books[0].id, genre_id: genres[0].id, created_at: now, updated_at: now },
    { id: uuid(), book_id: books[1].id, genre_id: genres[1].id, created_at: now, updated_at: now },
    { id: uuid(), book_id: books[1].id, genre_id: genres[2].id, created_at: now, updated_at: now },
    { id: uuid(), book_id: books[2].id, genre_id: genres[2].id, created_at: now, updated_at: now },
    { id: uuid(), book_id: books[3].id, genre_id: genres[1].id, created_at: now, updated_at: now },
    { id: uuid(), book_id: books[3].id, genre_id: genres[3].id, created_at: now, updated_at: now },
    { id: uuid(), book_id: books[4].id, genre_id: genres[0].id, created_at: now, updated_at: now },
    { id: uuid(), book_id: books[4].id, genre_id: genres[4].id, created_at: now, updated_at: now },
  ]

  // ============================================
  // ПОЛЬЗОВАТЕЛЬСКИЕ КНИГИ (UserBook)
  // ============================================
  const userBooks: UserBook[] = [
    {
      id: uuid(),
      book_id: books[0].id,
      status: "completed",
      rating: 5,
      progress_percent: 100,
      started_at: getDateDaysAgo(30),
      finished_at: getDateDaysAgo(15),
      is_owned: true,
      owned_format: "paperback",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      book_id: books[1].id,
      status: "reading",
      rating: 4,
      progress_percent: 65,
      progress_pages: 166,
      started_at: getDateDaysAgo(10),
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      book_id: books[2].id,
      status: "planned",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      book_id: books[3].id,
      status: "completed",
      rating: 4,
      progress_percent: 100,
      finished_at: getDateDaysAgo(60),
      is_owned: true,
      owned_format: "ebook",
      reread_count: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      book_id: books[4].id,
      status: "paused",
      progress_percent: 30,
      progress_pages: 86,
      started_at: getDateDaysAgo(20),
      created_at: now,
      updated_at: now,
    },
  ]

  await db.authors.bulkAdd(authors)
  await db.genres.bulkAdd(genres)
  await db.books.bulkAdd(books)
  await db.bookAuthors.bulkAdd(bookAuthors)
  await db.bookGenres.bulkAdd(bookGenres)
  await db.userBooks.bulkAdd(userBooks)
}

async function seedRecipes(): Promise<void> {
  const existingRecipes = await db.content.where("type").equals(ContentType.RECIPE).count()
  if (existingRecipes > 0) return

  const now = getTimestamp()

  // ============================================
  // ИНГРЕДИЕНТЫ (справочник)
  // ============================================
  const ingredients: RecipeIngredient[] = [
    // Овощи
    { id: uuid(), name: "Помидоры", category: "vegetable", created_at: now, updated_at: now },
    { id: uuid(), name: "Лук репчатый", category: "vegetable", created_at: now, updated_at: now },
    { id: uuid(), name: "Чеснок", category: "vegetable", created_at: now, updated_at: now },
    { id: uuid(), name: "Морковь", category: "vegetable", created_at: now, updated_at: now },
    { id: uuid(), name: "Картофель", category: "vegetable", created_at: now, updated_at: now },
    { id: uuid(), name: "Огурцы", category: "vegetable", created_at: now, updated_at: now },
    {
      id: uuid(),
      name: "Перец болгарский",
      category: "vegetable",
      created_at: now,
      updated_at: now,
    },
    // Мясо
    { id: uuid(), name: "Куриное филе", category: "poultry", created_at: now, updated_at: now },
    { id: uuid(), name: "Говядина", category: "meat", created_at: now, updated_at: now },
    { id: uuid(), name: "Бекон", category: "meat", created_at: now, updated_at: now },
    // Молочные
    {
      id: uuid(),
      name: "Яйца",
      category: "dairy",
      default_unit: "шт",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Сливки 20%",
      category: "dairy",
      default_unit: "мл",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Сыр Пармезан",
      category: "dairy",
      default_unit: "г",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Молоко",
      category: "dairy",
      default_unit: "мл",
      created_at: now,
      updated_at: now,
    },
    // Зерновые
    {
      id: uuid(),
      name: "Спагетти",
      category: "pasta",
      default_unit: "г",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Рис",
      category: "grain",
      default_unit: "г",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Овсяные хлопья",
      category: "grain",
      default_unit: "г",
      created_at: now,
      updated_at: now,
    },
    // Специи
    { id: uuid(), name: "Соль", category: "spice", created_at: now, updated_at: now },
    { id: uuid(), name: "Чёрный перец", category: "spice", created_at: now, updated_at: now },
    { id: uuid(), name: "Базилик", category: "herb", created_at: now, updated_at: now },
    { id: uuid(), name: "Орегано", category: "herb", created_at: now, updated_at: now },
    // Масла и соусы
    {
      id: uuid(),
      name: "Оливковое масло",
      category: "oil",
      default_unit: "мл",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Соевый соус",
      category: "sauce",
      default_unit: "мл",
      created_at: now,
      updated_at: now,
    },
    // Напитки
    { id: uuid(), name: "Кофе", category: "other", created_at: now, updated_at: now },
    { id: uuid(), name: "Чай зелёный", category: "other", created_at: now, updated_at: now },
    {
      id: uuid(),
      name: "Мёд",
      category: "sweetener",
      default_unit: "г",
      created_at: now,
      updated_at: now,
    },
    { id: uuid(), name: "Лимон", category: "fruit", created_at: now, updated_at: now },
    { id: uuid(), name: "Имбирь", category: "herb", created_at: now, updated_at: now },
    // Алкоголь
    {
      id: uuid(),
      name: "Водка",
      category: "alcohol",
      is_alcoholic: true,
      default_unit: "мл",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Джин",
      category: "alcohol",
      is_alcoholic: true,
      default_unit: "мл",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Ром белый",
      category: "alcohol",
      is_alcoholic: true,
      default_unit: "мл",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Кофейный ликёр",
      category: "liqueur",
      is_alcoholic: true,
      default_unit: "мл",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Апельсиновый ликёр",
      category: "liqueur",
      is_alcoholic: true,
      default_unit: "мл",
      created_at: now,
      updated_at: now,
    },
    // Фрукты
    { id: uuid(), name: "Апельсин", category: "fruit", created_at: now, updated_at: now },
    {
      id: uuid(),
      name: "Ягоды замороженные",
      category: "fruit",
      default_unit: "г",
      created_at: now,
      updated_at: now,
    },
    { id: uuid(), name: "Банан", category: "fruit", created_at: now, updated_at: now },
    // Прочее
    {
      id: uuid(),
      name: "Мука",
      category: "grain",
      default_unit: "г",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Сахар",
      category: "sweetener",
      default_unit: "г",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Сливочное масло",
      category: "dairy",
      default_unit: "г",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: "Лёд",
      category: "other",
      default_unit: "кубик",
      created_at: now,
      updated_at: now,
    },
    { id: uuid(), name: "Мята свежая", category: "herb", created_at: now, updated_at: now },
  ]

  // ============================================
  // РЕЦЕПТЫ ЕДЫ (3 штуки)
  // ============================================
  const foodRecipes: RecipeContentExtended[] = [
    {
      id: uuid(),
      type: ContentType.RECIPE,
      recipe_type: RecipeType.FOOD,
      title: "Паста Карбонара",
      description: "Классическая итальянская паста с беконом и сливочным соусом",
      body: "Классический римский рецепт пасты с беконом, яйцами и сыром.",
      prep_time_min: 10,
      cook_time_min: 20,
      total_time_min: 30,
      servings: 2,
      difficulty: "medium",
      calories: 550,
      protein: 22,
      fat: 28,
      carbs: 48,
      food_metadata: {
        course_type: "dinner",
        cuisine: "Итальянская",
        cooking_method: ["boil", "fry"],
        serving_temperature: "hot",
      },
      tags: ["вкусно", "быстро", "любимое"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ContentType.RECIPE,
      recipe_type: RecipeType.FOOD,
      title: "Овсянка с ягодами",
      description: "Полезный завтрак с овсяными хлопьями и замороженными ягодами",
      body: "Быстрый и полезный завтрак для хорошего начала дня.",
      prep_time_min: 2,
      cook_time_min: 10,
      total_time_min: 12,
      servings: 1,
      difficulty: "easy",
      calories: 320,
      protein: 10,
      fat: 8,
      carbs: 52,
      food_metadata: {
        course_type: "breakfast",
        cooking_method: ["boil"],
        dietary: ["vegetarian"],
        serving_temperature: "hot",
      },
      tags: ["полезно", "быстро"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ContentType.RECIPE,
      recipe_type: RecipeType.FOOD,
      title: "Салат Цезарь с курицей",
      description: "Классический салат с куриным филе, сыром и гренками",
      body: "Популярный американский салат с фирменной заправкой.",
      prep_time_min: 20,
      cook_time_min: 15,
      total_time_min: 35,
      servings: 2,
      difficulty: "medium",
      calories: 420,
      protein: 32,
      fat: 22,
      carbs: 18,
      food_metadata: {
        course_type: "salad",
        cooking_method: ["fry", "raw"],
        serving_temperature: "room",
      },
      tags: ["вкусно", "любимое"],
      created_at: now,
      updated_at: now,
    },
  ]

  // ============================================
  // РЕЦЕПТЫ НАПИТКОВ (3 штуки)
  // ============================================
  const drinkRecipes: RecipeContentExtended[] = [
    {
      id: uuid(),
      type: ContentType.RECIPE,
      recipe_type: RecipeType.DRINK,
      title: "Зелёный чай с имбирём и мёдом",
      description: "Тонизирующий напиток для иммунитета",
      body: "Полезный напиток для укрепления иммунитета в холодное время года.",
      prep_time_min: 5,
      cook_time_min: 10,
      total_time_min: 15,
      servings: 2,
      serving_unit: "чашки",
      difficulty: "easy",
      calories: 45,
      sugar: 10,
      drink_metadata: {
        drink_type: "tea",
        base: "вода",
        serving_temperature: "hot",
        caffeine_mg: 30,
        volume_ml: 400,
      },
      tags: ["полезно", "быстро"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ContentType.RECIPE,
      recipe_type: RecipeType.DRINK,
      title: "Смузи с бананом и ягодами",
      description: "Питательный смузи для завтрака или перекуса",
      body: "Густой и сытный смузи с насыщенным ягодным вкусом.",
      prep_time_min: 5,
      cook_time_min: 0,
      total_time_min: 5,
      servings: 1,
      serving_unit: "стакан",
      difficulty: "easy",
      calories: 280,
      protein: 8,
      fat: 5,
      carbs: 52,
      sugar: 35,
      drink_metadata: {
        drink_type: "smoothie",
        base: "молоко",
        serving_temperature: "cold",
        volume_ml: 350,
      },
      tags: ["полезно", "быстро", "любимое"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ContentType.RECIPE,
      recipe_type: RecipeType.DRINK,
      title: "Латте на растительном молоке",
      description: "Кофейный напиток с нежным вкусом",
      body: "Нежный кофейный напиток с кремовой текстурой.",
      prep_time_min: 2,
      cook_time_min: 3,
      total_time_min: 5,
      servings: 1,
      serving_unit: "чашка",
      difficulty: "medium",
      calories: 120,
      sugar: 8,
      drink_metadata: {
        drink_type: "coffee",
        base: "растительное молоко",
        serving_temperature: "hot",
        caffeine_mg: 80,
        volume_ml: 300,
      },
      tags: ["любимое"],
      created_at: now,
      updated_at: now,
    },
  ]

  // ============================================
  // РЕЦЕПТЫ КОКТЕЙЛЕЙ (3 штуки)
  // ============================================
  const cocktailRecipes: RecipeContentExtended[] = [
    {
      id: uuid(),
      type: ContentType.RECIPE,
      recipe_type: RecipeType.COCKTAIL,
      title: "Белый Русский",
      description: "Сладкий сливочный коктейль на основе водки",
      body: "Классический коктейль с кофе и сливками. Прост в приготовлении.",
      prep_time_min: 3,
      cook_time_min: 0,
      total_time_min: 3,
      servings: 1,
      serving_unit: "бокал",
      difficulty: "easy",
      calories: 290,
      cocktail_metadata: {
        is_alcoholic: true,
        alcohol_percent: 20,
        base_spirit: "водка",
        cocktail_method: "built",
        glass_type: "rocks",
        ice_type: "cubed",
        garnish: ["кофейные зёрна"],
        color: "бежевый",
        tools: ["барная ложка"],
      },
      tags: ["любимое"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ContentType.RECIPE,
      recipe_type: RecipeType.COCKTAIL,
      title: "Джин-тоник с огурцом",
      description: "Освежающий коктейль с джином и тоником",
      body: "Лёгкий освежающий коктейль идеально подходит для летнего вечера.",
      prep_time_min: 3,
      cook_time_min: 0,
      total_time_min: 3,
      servings: 1,
      serving_unit: "бокал",
      difficulty: "easy",
      calories: 150,
      cocktail_metadata: {
        is_alcoholic: true,
        alcohol_percent: 12,
        base_spirit: "джин",
        cocktail_method: "built",
        glass_type: "highball",
        ice_type: "cubed",
        garnish: ["огурец", "розмарин"],
        color: "прозрачный",
        tools: [],
      },
      tags: ["вкусно"],
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      type: ContentType.RECIPE,
      recipe_type: RecipeType.COCKTAIL,
      title: "Мохито",
      description: "Кубинский коктейль с мятой и лаймом",
      body: "Освежающий коктейль с ярким мятным вкусом. Классика летних вечеринок.",
      prep_time_min: 5,
      cook_time_min: 0,
      total_time_min: 5,
      servings: 1,
      serving_unit: "бокал",
      difficulty: "medium",
      calories: 180,
      cocktail_metadata: {
        is_alcoholic: true,
        alcohol_percent: 15,
        base_spirit: "ром",
        cocktail_method: "muddled",
        glass_type: "highball",
        ice_type: "crushed",
        garnish: ["мята", "лайм"],
        color: "зелёный",
        tools: ["мадлер", "барная ложка"],
      },
      tags: ["вкусно", "любимое"],
      created_at: now,
      updated_at: now,
    },
  ]

  // ============================================
  // ИНГРЕДИЕНТЫ ДЛЯ РЕЦЕПТОВ
  // ============================================
  const recipeIngredientItems: RecipeIngredientItem[] = [
    // Паста Карбонара
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      ingredient_name: "Спагетти",
      amount: 200,
      unit: "г",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      ingredient_name: "Бекон",
      amount: 150,
      unit: "г",
      order: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      ingredient_name: "Яйца",
      amount: 2,
      unit: "шт",
      order: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      ingredient_name: "Сыр Пармезан",
      amount: 50,
      unit: "г",
      order: 4,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      ingredient_name: "Сливки 20%",
      amount: 100,
      unit: "мл",
      order: 5,
      optional: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      ingredient_name: "Чёрный перец",
      amount: 1,
      unit: "щепотка",
      order: 6,
      created_at: now,
      updated_at: now,
    },

    // Овсянка с ягодами
    {
      id: uuid(),
      recipe_id: foodRecipes[1].id,
      ingredient_name: "Овсяные хлопья",
      amount: 60,
      unit: "г",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[1].id,
      ingredient_name: "Молоко",
      amount: 200,
      unit: "мл",
      order: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[1].id,
      ingredient_name: "Ягоды замороженные",
      amount: 50,
      unit: "г",
      order: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[1].id,
      ingredient_name: "Мёд",
      amount: 15,
      unit: "г",
      order: 4,
      optional: true,
      created_at: now,
      updated_at: now,
    },

    // Салат Цезарь
    {
      id: uuid(),
      recipe_id: foodRecipes[2].id,
      ingredient_name: "Куриное филе",
      amount: 250,
      unit: "г",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[2].id,
      ingredient_name: "Салат романо",
      amount: 100,
      unit: "г",
      order: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[2].id,
      ingredient_name: "Сыр Пармезан",
      amount: 30,
      unit: "г",
      order: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[2].id,
      ingredient_name: "Белый хлеб",
      amount: 2,
      unit: "кусочка",
      order: 4,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[2].id,
      ingredient_name: "Соус Ц��зарь",
      amount: 50,
      unit: "мл",
      order: 5,
      created_at: now,
      updated_at: now,
    },

    // Зелёный чай
    {
      id: uuid(),
      recipe_id: drinkRecipes[0].id,
      ingredient_name: "Чай зелёный",
      amount: 2,
      unit: "ч.л.",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[0].id,
      ingredient_name: "Имбирь",
      amount: 20,
      unit: "г",
      order: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[0].id,
      ingredient_name: "Мёд",
      amount: 20,
      unit: "г",
      order: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[0].id,
      ingredient_name: "Лимон",
      amount: 2,
      unit: "дольки",
      order: 4,
      created_at: now,
      updated_at: now,
    },

    // Смузи
    {
      id: uuid(),
      recipe_id: drinkRecipes[1].id,
      ingredient_name: "Банан",
      amount: 1,
      unit: "шт",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[1].id,
      ingredient_name: "Ягоды замороженные",
      amount: 100,
      unit: "г",
      order: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[1].id,
      ingredient_name: "Молоко",
      amount: 200,
      unit: "мл",
      order: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[1].id,
      ingredient_name: "Мёд",
      amount: 10,
      unit: "г",
      order: 4,
      optional: true,
      created_at: now,
      updated_at: now,
    },

    // Латте
    {
      id: uuid(),
      recipe_id: drinkRecipes[2].id,
      ingredient_name: "Кофе",
      amount: 18,
      unit: "г",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[2].id,
      ingredient_name: "Овсяное молоко",
      amount: 200,
      unit: "мл",
      order: 2,
      created_at: now,
      updated_at: now,
    },

    // Белый Русский
    {
      id: uuid(),
      recipe_id: cocktailRecipes[0].id,
      ingredient_name: "Водка",
      amount: 50,
      unit: "мл",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[0].id,
      ingredient_name: "Кофейный ликёр",
      amount: 25,
      unit: "мл",
      order: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[0].id,
      ingredient_name: "Сливки 20%",
      amount: 25,
      unit: "мл",
      order: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[0].id,
      ingredient_name: "Лёд",
      amount: 3,
      unit: "кубик",
      order: 4,
      created_at: now,
      updated_at: now,
    },

    // Джин-тоник
    {
      id: uuid(),
      recipe_id: cocktailRecipes[1].id,
      ingredient_name: "Джин",
      amount: 50,
      unit: "мл",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[1].id,
      ingredient_name: "Тоник",
      amount: 150,
      unit: "мл",
      order: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[1].id,
      ingredient_name: "Огурцы",
      amount: 3,
      unit: "ломтика",
      order: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[1].id,
      ingredient_name: "Лёд",
      amount: 4,
      unit: "кубик",
      order: 4,
      created_at: now,
      updated_at: now,
    },

    // Мохито
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      ingredient_name: "Ром белый",
      amount: 50,
      unit: "мл",
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      ingredient_name: "Содовая",
      amount: 100,
      unit: "мл",
      order: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      ingredient_name: "Мята свежая",
      amount: 10,
      unit: "листиков",
      order: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      ingredient_name: "Лайм",
      amount: 1,
      unit: "шт",
      order: 4,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      ingredient_name: "Сахар",
      amount: 2,
      unit: "ч.л.",
      order: 5,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      ingredient_name: "Лёд",
      amount: 6,
      unit: "кубик",
      order: 6,
      created_at: now,
      updated_at: now,
    },
  ]

  // ============================================
  // ШАГИ ПРИГОТОВЛЕНИЯ
  // ============================================
  const recipeSteps: RecipeStep[] = [
    // Паста Карбонара
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      order: 1,
      text: "Отварите спагетти в подсоленной воде до состояния аль денте согласно инструкции на упаковке.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      order: 2,
      text: "Нарежьте бекон небольшими полосками и обжарьте на сковороде до золотистой корочки.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      order: 3,
      text: "В миске взбейте яйца с тёртым пармезаном, добавьте соль и перец по вкусу.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      order: 4,
      text: "Слейте воду с пасты, оставив немного воды. Добавьте пасту к бекону, снимите с огня.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[0].id,
      order: 5,
      text: "Быстро влейте яичную смесь и перемешайте. Соус загустеет от тепла пасты. Подавайте сразу.",
      timer_min: 2,
      created_at: now,
      updated_at: now,
    },

    // Овсянка с ягодами
    {
      id: uuid(),
      recipe_id: foodRecipes[1].id,
      order: 1,
      text: "Залейте овсяные хлопья молоком в небольшой кастрюле.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[1].id,
      order: 2,
      text: "Доведите до кипения на среднем огне, помешивая.",
      timer_min: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[1].id,
      order: 3,
      text: "Убавьте огонь и варите 5-7 минут до желаемой консистенции.",
      timer_min: 5,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[1].id,
      order: 4,
      text: "Добавьте ягоды и мёд, перемешайте и подавайте.",
      created_at: now,
      updated_at: now,
    },

    // Салат Цезарь
    {
      id: uuid(),
      recipe_id: foodRecipes[2].id,
      order: 1,
      text: "Куриное филе посолите, поперчите и обжарьте на сковороде гриль до готовности.",
      timer_min: 15,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[2].id,
      order: 2,
      text: "Нарежьте хлеб кубиками и подсушите на сковороде до золотистого цвета.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[2].id,
      order: 3,
      text: "Порвите листья салата руками на крупные куски, выложите на тарелку.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[2].id,
      order: 4,
      text: "Нарежьте курицу полосками, выложите на салат.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: foodRecipes[2].id,
      order: 5,
      text: "Добавьте гренки, полейте соусом Цезарь, посыпьте тёртым пармезаном.",
      created_at: now,
      updated_at: now,
    },

    // Зелёный чай
    {
      id: uuid(),
      recipe_id: drinkRecipes[0].id,
      order: 1,
      text: "Заварите зелёный чай в чайнике водой 80°C (не кипятком!).",
      timer_min: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[0].id,
      order: 2,
      text: "Нарежьте имбирь тонкими ломтиками, добавьте в чай.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[0].id,
      order: 3,
      text: "Дайте настояться 5-7 минут.",
      timer_min: 5,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[0].id,
      order: 4,
      text: "Добавьте мёд и дольку лимона по вкусу.",
      created_at: now,
      updated_at: now,
    },

    // Смузи
    {
      id: uuid(),
      recipe_id: drinkRecipes[1].id,
      order: 1,
      text: "Очистите банан и нарежьте кусочками.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[1].id,
      order: 2,
      text: "Поместите банан, ягоды и молоко в блендер.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[1].id,
      order: 3,
      text: "Взбейте до однородной массы.",
      timer_min: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[1].id,
      order: 4,
      text: "Добавьте мёд по желанию и перемешайте.",
      created_at: now,
      updated_at: now,
    },

    // Латте
    {
      id: uuid(),
      recipe_id: drinkRecipes[2].id,
      order: 1,
      text: "Приготовьте эспрессо или крепкий кофе любым способом.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[2].id,
      order: 2,
      text: "Нагрейте овсяное молоко, не доводя до кипения.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[2].id,
      order: 3,
      text: "Взбейте молоко капучинатором до образования пены.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: drinkRecipes[2].id,
      order: 4,
      text: "Влейте молоко в кофе, удерживая пену ложкой, затем выложите пену сверху.",
      created_at: now,
      updated_at: now,
    },

    // Белый Русский
    {
      id: uuid(),
      recipe_id: cocktailRecipes[0].id,
      order: 1,
      text: "Наполните бокал рокс кубиками льда.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[0].id,
      order: 2,
      text: "Налейте водку и кофейный ликёр.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[0].id,
      order: 3,
      text: "Аккуратно добавьте сливки, чтобы они остались сверху слоями.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[0].id,
      order: 4,
      text: "Аккуратно перемешайте перед употреблением.",
      created_at: now,
      updated_at: now,
    },

    // Джин-тоник
    {
      id: uuid(),
      recipe_id: cocktailRecipes[1].id,
      order: 1,
      text: "Наполните хайбол кубиками льда до верха.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[1].id,
      order: 2,
      text: "Добавьте нарезанные тонкими ломтиками огурцы.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[1].id,
      order: 3,
      text: "Налейте джин, затем тоник.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[1].id,
      order: 4,
      text: "Аккуратно перемешайте барной ложкой. Украсьте веточкой розмарина.",
      created_at: now,
      updated_at: now,
    },

    // Мохито
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      order: 1,
      text: "Положите в хайбол листья мяты, сахар и нарезанный лайм.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      order: 2,
      text: "Разомните мадлером, чтобы выделился сок лайма и аромат мяты.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      order: 3,
      text: "Наполните бокал колотым льдом.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      order: 4,
      text: "Налейте ром и долейте содовой.",
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      recipe_id: cocktailRecipes[2].id,
      order: 5,
      text: "Перемешайте барной ложкой. Украсьте веточкой мяты и долькой лайма.",
      created_at: now,
      updated_at: now,
    },
  ]

  // Сохраняем все данные
  await db.recipeIngredients.bulkAdd(ingredients)
  await db.content.bulkAdd([...foodRecipes, ...drinkRecipes, ...cocktailRecipes])
  await db.recipeIngredientItems.bulkAdd(recipeIngredientItems)
  await db.recipeSteps.bulkAdd(recipeSteps)
}

// ============================================
// Main Seed Functions
// ============================================

export async function cleanupDuplicateCategories() {
  const categories = await db.categories.toArray()

  const seen = new Map<string, Category>()
  const duplicates: Category[] = []

  for (const cat of categories) {
    const key = `${cat.type}-${cat.name}`
    if (seen.has(key)) {
      duplicates.push(cat)
    } else {
      seen.set(key, cat)
    }
  }

  if (duplicates.length === 0) {
    console.log("No duplicate categories found")
    return 0
  }

  console.log(`Found ${duplicates.length} duplicate categories`)

  const logs = await db.logs.toArray()
  const updates: Promise<unknown>[] = []

  for (const dup of duplicates) {
    const key = `${dup.type}-${dup.name}`
    const original = seen.get(key)
    if (!original) continue

    const logsToUpdate = logs.filter((log) => log.category_id === dup.id)
    for (const log of logsToUpdate) {
      updates.push(db.logs.update(log.id, { category_id: original.id }))
    }

    updates.push(db.categories.delete(dup.id))
  }

  await Promise.all(updates)
  console.log(`Removed ${duplicates.length} duplicate categories`)
  return duplicates.length
}

export async function clearDatabase() {
  console.log("Clearing database...")
  await Promise.all([
    db.logs.clear(),
    db.items.clear(),
    db.content.clear(),
    db.categories.clear(),
    db.tags.clear(),
    db.accounts.clear(),
    db.units.clear(),
    db.books.clear(),
    db.userBooks.clear(),
    db.authors.clear(),
    db.bookAuthors.clear(),
    db.genres.clear(),
    db.bookGenres.clear(),
    db.bookQuotes.clear(),
    db.bookReviews.clear(),
    db.recipeIngredients.clear(),
    db.recipeIngredientItems.clear(),
    db.recipeSteps.clear(),
  ])
  console.log("Database cleared!")
  return true
}

export async function seedDatabase() {
  const existingLogs = await db.logs.count()
  if (existingLogs > 0) {
    console.log("Database already seeded")
    return false
  }

  console.log("Seeding database...")

  const categories = await seedCategories()
  await seedTags()
  await seedUnits()
  const accounts = await seedAccounts()
  await seedLogs(categories, accounts)
  await seedItems()
  await seedBooks()
  await seedRecipes()

  console.log("Database seeded successfully!")
  return true
}

export async function reseedDatabase() {
  await clearDatabase()
  return await seedDatabase()
}
