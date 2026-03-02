import { subDays, format } from "date-fns"
import { db, generateId } from "./db"
import {
  LogType,
  ItemType,
  ContentType,
  FinanceType,
  GoalType,
  GoalPeriod,
  ReminderType,
  ReminderPriority,
  IngredientCategory,
  MoodType,
  BodyMeasurementType,
  ReadingStatus,
  Difficulty,
} from "@/types"
import type {
  Category,
  Tag,
  Unit,
  Account,
  Exercise,
  Log,
  Item,
  Content,
  RecipeIngredient,
  RecipeIngredientItem,
  RecipeStep,
  Goal,
  Habit,
  HabitLog,
  SleepLog,
  WaterLog,
  MoodLog,
  BodyMeasurement,
  Reminder,
  Template,
  BookAuthor,
  BookGenre,
} from "@/types"

// ============================================
// Вспомогательные функции
// ============================================

function now(): string {
  return new Date().toISOString()
}

function randomDateInLastWeek(): Date {
  const nowDate = new Date()
  const daysAgo = Math.floor(Math.random() * 7)
  const date = subDays(nowDate, daysAgo)
  date.setHours(Math.floor(Math.random() * 24))
  date.setMinutes(Math.floor(Math.random() * 60))
  return date
}

function randomISODateInLastWeek(): string {
  return randomDateInLastWeek().toISOString()
}

function randomISODateOnlyInLastWeek(): string {
  const date = randomDateInLastWeek()
  return format(date, "yyyy-MM-dd")
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ============================================
// Генерация справочных данных
// ============================================

async function seedCategories() {
  const existingCategories = await db.categories.count()
  if (existingCategories > 0) {
    console.log("Categories already exist, skipping...")
    return
  }

  const categories = [
    // Food categories
    { id: generateId(), type: LogType.FOOD, name: "Завтрак", created_at: now(), updated_at: now() },
    { id: generateId(), type: LogType.FOOD, name: "Обед", created_at: now(), updated_at: now() },
    { id: generateId(), type: LogType.FOOD, name: "Ужин", created_at: now(), updated_at: now() },
    { id: generateId(), type: LogType.FOOD, name: "Перекус", created_at: now(), updated_at: now() },
    { id: generateId(), type: LogType.FOOD, name: "Напиток", created_at: now(), updated_at: now() },
    // Workout categories
    {
      id: generateId(),
      type: LogType.WORKOUT,
      name: "Силовая",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.WORKOUT,
      name: "Кардио",
      created_at: now(),
      updated_at: now(),
    },
    { id: generateId(), type: LogType.WORKOUT, name: "Йога", created_at: now(), updated_at: now() },
    {
      id: generateId(),
      type: LogType.WORKOUT,
      name: "Растяжка",
      created_at: now(),
      updated_at: now(),
    },
    // Finance categories
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "Продукты",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "Транспорт",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "Развлечения",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "Здоровье",
      created_at: now(),
      updated_at: now(),
    },
    // Item categories
    {
      id: generateId(),
      type: ItemType.VITAMIN,
      name: "Витамины",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.MEDICINE,
      name: "Лекарства",
      created_at: now(),
      updated_at: now(),
    },
    { id: generateId(), type: ItemType.HERB, name: "Травы", created_at: now(), updated_at: now() },
    {
      id: generateId(),
      type: ItemType.COSMETIC,
      name: "Косметика",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.PRODUCT,
      name: "Продукты",
      created_at: now(),
      updated_at: now(),
    },
    // Content categories
    {
      id: generateId(),
      type: ContentType.BOOK,
      name: "Книги",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ContentType.RECIPE,
      name: "Рецепты",
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.categories.bulkAdd(categories)
  console.log(`Added ${categories.length} categories`)
}

async function seedTags() {
  const existingTags = await db.tags.count()
  if (existingTags > 0) {
    console.log("Tags already exist, skipping...")
    return
  }

  const tags: Tag[] = [
    { id: generateId(), name: "здоровое", created_at: now(), updated_at: now() },
    { id: generateId(), name: "быстро", created_at: now(), updated_at: now() },
    { id: generateId(), name: "вкусно", created_at: now(), updated_at: now() },
    { id: generateId(), name: "важно", created_at: now(), updated_at: now() },
    { id: generateId(), name: "план", created_at: now(), updated_at: now() },
    { id: generateId(), name: "любимое", created_at: now(), updated_at: now() },
    { id: generateId(), name: "новое", created_at: now(), updated_at: now() },
    { id: generateId(), name: "повседневное", created_at: now(), updated_at: now() },
  ]

  await db.tags.bulkAdd(tags)
  console.log(`Added ${tags.length} tags`)
}

async function seedUnits() {
  const existingUnits = await db.units.count()
  if (existingUnits > 0) {
    console.log("Units already exist, skipping...")
    return
  }

  const units = [
    {
      id: generateId(),
      type: "weight" as const,
      name: "кг",
      abbreviation: "кг",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "weight" as const,
      name: "г",
      abbreviation: "г",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "volume" as const,
      name: "мл",
      abbreviation: "мл",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "volume" as const,
      name: "л",
      abbreviation: "л",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "count" as const,
      name: "шт",
      abbreviation: "шт",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "time" as const,
      name: "мин",
      abbreviation: "мин",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "time" as const,
      name: "ч",
      abbreviation: "ч",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "money" as const,
      name: "руб",
      abbreviation: "₽",
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.units.bulkAdd(units)
  console.log(`Added ${units.length} units`)
}

async function seedAccounts() {
  const existingAccounts = await db.accounts.count()
  if (existingAccounts > 0) {
    console.log("Accounts already exist, skipping...")
    return
  }

  const accounts: Account[] = [
    {
      id: generateId(),
      name: "Наличные",
      type: "cash",
      balance: 0,
      currency: "RUB",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Дебетовая карта",
      type: "card",
      balance: 0,
      currency: "RUB",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Банковский счёт",
      type: "bank",
      balance: 0,
      currency: "RUB",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Брокерский счёт",
      type: "investment",
      balance: 0,
      currency: "RUB",
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.accounts.bulkAdd(accounts)
  console.log(`Added ${accounts.length} accounts`)
  return accounts
}

async function seedExercises() {
  const existingExercises = await db.exercises.count()
  if (existingExercises > 0) {
    console.log("Exercises already exist, skipping...")
    return
  }

  const exercises: Exercise[] = [
    {
      id: generateId(),
      name: "Жим лёжа",
      category: "strength",
      muscle_groups: ["грудь", "трицепс"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Приседания",
      category: "strength",
      muscle_groups: ["ноги", "ягодицы"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Становая тяга",
      category: "strength",
      muscle_groups: ["спина", "ноги"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Бег на дорожке",
      category: "cardio",
      muscle_groups: ["сердце"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Велосипед",
      category: "cardio",
      muscle_groups: ["сердце", "ноги"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Прыжки на скакалке",
      category: "cardio",
      muscle_groups: ["сердце"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Йога-терапия",
      category: "yoga",
      muscle_groups: ["всё тело"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Утренняя йога",
      category: "yoga",
      muscle_groups: ["всё тело"],
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.exercises.bulkAdd(exercises)
  console.log(`Added ${exercises.length} exercises`)
  return exercises
}

// ============================================
// Генерация логов (записей)
// ============================================

async function seedLogs() {
  const categories = await db.categories.toArray()
  const accounts = await db.accounts.toArray()
  const exercises = await db.exercises.toArray()
  const tags = await db.tags.toArray()

  const foodCategories = categories.filter((c) => c.type === LogType.FOOD)
  const workoutCategories = categories.filter((c) => c.type === LogType.WORKOUT)
  const financeCategories = categories.filter((c) => c.type === LogType.FINANCE)

  const logs: Log[] = []

  // Food logs (5-7 entries)
  for (let i = 0; i < randomBetween(5, 7); i++) {
    const date = randomISODateOnlyInLastWeek()
    logs.push({
      id: generateId(),
      type: LogType.FOOD,
      date,
      title: randomElement([
        "Завтрак с омлетом",
        "Обед с курицей",
        "Ужин с рыбой",
        "Салат Цезарь",
        "Овсянка с фруктами",
        "Сэндвич с индейкой",
        "Йогурт с мюсли",
      ]),
      category_id: foodCategories.length > 0 ? randomElement(foodCategories).id : undefined,
      quantity: randomBetween(100, 500),
      unit: "г",
      value: randomBetween(200, 800),
      tags: [randomElement(tags).name],
      metadata: {
        calories: randomBetween(200, 800),
        protein: randomBetween(10, 50),
        fat: randomBetween(5, 30),
        carbs: randomBetween(20, 100),
      },
      created_at: randomISODateInLastWeek(),
      updated_at: now(),
    })
  }

  // Workout logs (5-7 entries)
  for (let i = 0; i < randomBetween(5, 7); i++) {
    const date = randomISODateOnlyInLastWeek()
    const intensity = randomElement(["low", "medium", "high"] as const)
    logs.push({
      id: generateId(),
      type: LogType.WORKOUT,
      date,
      title: randomElement([
        "Тренировка в зале",
        "Утренняя пробежка",
        "Велопрогулка",
        "Йога",
        "Растяжка",
        "Интервальная тренировка",
        "Силовая тренировка",
      ]),
      category_id: workoutCategories.length > 0 ? randomElement(workoutCategories).id : undefined,
      quantity: randomBetween(30, 90),
      unit: "мин",
      value: randomBetween(200, 600),
      tags: [randomElement(tags).name],
      metadata: {
        duration: randomBetween(30, 90),
        intensity,
        exercise_id: exercises.length > 0 ? randomElement(exercises).id : undefined,
        calories_burned: randomBetween(200, 600),
      },
      created_at: randomISODateInLastWeek(),
      updated_at: now(),
    })
  }

  // Finance logs (5-7 entries)
  for (let i = 0; i < randomBetween(5, 7); i++) {
    const date = randomISODateOnlyInLastWeek()
    const isIncome = Math.random() > 0.7
    const financeType = isIncome ? FinanceType.INCOME : FinanceType.EXPENSE
    logs.push({
      id: generateId(),
      type: LogType.FINANCE,
      date,
      title: randomElement([
        "Покупка продуктов",
        "Проезд на транспорте",
        "Кино",
        "Аптека",
        "Зарплата",
        "Фриланс",
        "Подарок",
      ]),
      category_id: financeCategories.length > 0 ? randomElement(financeCategories).id : undefined,
      quantity: 1,
      unit: "шт",
      value: isIncome ? randomBetween(30000, 100000) : randomBetween(500, 5000),
      tags: [],
      metadata: {
        finance_type: financeType,
        account_id: accounts.length > 0 ? randomElement(accounts).id : undefined,
        category: isIncome ? "Доход" : "Расход",
      },
      created_at: randomISODateInLastWeek(),
      updated_at: now(),
    })
  }

  await db.logs.bulkAdd(logs)
  console.log(`Added ${logs.length} logs`)
}

// ============================================
// Генерация items (каталог)
// ============================================

async function seedItems() {
  const items: Item[] = [
    // Vitamins
    {
      id: generateId(),
      type: ItemType.VITAMIN,
      name: "Витамин D3",
      category: "Витамины",
      dosage: "5000 IU",
      manufacturer: "Now Foods",
      tags: ["здоровое", "важно"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.VITAMIN,
      name: "Омега-3",
      category: "Витамины",
      dosage: "1000mg",
      manufacturer: "Nordic Naturals",
      tags: ["здоровое"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.VITAMIN,
      name: "Магний",
      category: "Витамины",
      dosage: "400mg",
      manufacturer: "Doctor's Best",
      tags: ["здоровое", "важно"],
      created_at: now(),
      updated_at: now(),
    },
    // Medicines
    {
      id: generateId(),
      type: ItemType.MEDICINE,
      name: "Ибупрофен",
      category: "Лекарства",
      dosage: "200mg",
      usage: "Обезболивающее",
      tags: ["важно"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.MEDICINE,
      name: "Парацетамол",
      category: "Лекарства",
      dosage: "500mg",
      usage: "Жаропонижающее",
      tags: ["важно"],
      created_at: now(),
      updated_at: now(),
    },
    // Herbs
    {
      id: generateId(),
      type: ItemType.HERB,
      name: "Ромашка",
      category: "Травы",
      usage: "Успокаивающий чай",
      benefits: "Снятие стресса",
      tags: ["здоровое"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.HERB,
      name: "Мята",
      category: "Травы",
      usage: "Чай",
      benefits: "Пищеварение",
      tags: ["здоровое", "быстро"],
      created_at: now(),
      updated_at: now(),
    },
    // Cosmetics
    {
      id: generateId(),
      type: ItemType.COSMETIC,
      name: "Увлажняющий крем",
      category: "Косметика",
      usage: "Для лица",
      manufacturer: "CeraVe",
      tags: ["любимое"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.COSMETIC,
      name: "Сыворотка с витамином C",
      category: "Косметика",
      usage: "Для лица",
      manufacturer: "The Ordinary",
      tags: ["здоровое", "новое"],
      created_at: now(),
      updated_at: now(),
    },
    // Products
    {
      id: generateId(),
      type: ItemType.PRODUCT,
      name: "Куриная грудка",
      category: "Продукты",
      calories: 165,
      protein: 31,
      fat: 3.6,
      carbs: 0,
      serving_size: 100,
      tags: ["здоровое", "вкусно"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.PRODUCT,
      name: "Рис",
      category: "Продукты",
      calories: 130,
      protein: 2.7,
      fat: 0.3,
      carbs: 28,
      serving_size: 100,
      tags: ["быстро", "повседневное"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.PRODUCT,
      name: "Банан",
      category: "Продукты",
      calories: 89,
      protein: 1.1,
      fat: 0.3,
      carbs: 22.8,
      serving_size: 100,
      tags: ["здоровое", "быстро"],
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.items.bulkAdd(items)
  console.log(`Added ${items.length} items`)
}

// ============================================
// Генерация контента (книги, рецепты)
// ============================================

async function seedContent() {
  const tags = await db.tags.toArray()

  // First add books to the books table
  const books = [
    {
      id: generateId(),
      title: "Атомные привычки",
      subtitle: "Как приобрести хорошие привычки и избавиться от плохих",
      description:
        "Книга о том, как формировать полезные привычки и избавляться от вредных. Практическое руководство по изменению поведения.",
      isbn10: "0735211299",
      isbn13: "9780735211292",
      published_year: 2018,
      publisher: "Penguin Random House",
      language: "ru",
      page_count: 320,
      format: "paperback" as const,
      rating_avg: 4.5,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      title: "Глубокий покой",
      subtitle: "Научное объяснение силы сна и как его улучшить",
      description:
        "О важности сна и его влиянии на жизнь. Книга профессора нейробиологии о том, как недостаток сна влияет на здоровье.",
      isbn10: "1501144315",
      isbn13: "9781501144318",
      published_year: 2017,
      publisher: "Scribner",
      language: "ru",
      page_count: 368,
      format: "hardcover" as const,
      rating_avg: 4.8,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      title: "Как завоёвывать друзей и оказывать влияние на людей",
      subtitle: "Классическая книга общения и лидерства",
      description:
        "Легендарная книга Дейла Карнеги о том, как находить друзей и оказывать влияние на людей.",
      isbn10: "0671027034",
      isbn13: "9780671027032",
      published_year: 1936,
      publisher: "Simon & Schuster",
      language: "ru",
      page_count: 288,
      format: "paperback" as const,
      rating_avg: 4.7,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      title: "Думай и богатей",
      subtitle: "Классика финансового успеха",
      description: "Классическая книга о мышлении богатых людей и достижении финансового успеха.",
      isbn10: "1585424337",
      isbn13: "9781585424337",
      published_year: 1937,
      publisher: "TarcherPerigee",
      language: "ru",
      page_count: 320,
      format: "paperback" as const,
      rating_avg: 4.6,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      title: "7 навыков высокоэффективных людей",
      subtitle: "Мощные инструменты развития личности",
      description: "Книга Стивена Кови о принципах эффективности и личностном росте.",
      isbn10: "1451639619",
      isbn13: "9781451639612",
      published_year: 1989,
      publisher: "Simon & Schuster",
      language: "ru",
      page_count: 432,
      format: "hardcover" as const,
      rating_avg: 4.9,
      created_at: now(),
      updated_at: now(),
    },
  ]

  // Add books to books table
  await db.books.bulkAdd(books)
  console.log(`Added ${books.length} books`)

  // Now create author and genre relationships for books
  const authors = await db.authors.toArray()
  const genres = await db.genres.toArray()

  // Link authors and genres to books
  const bookAuthors: BookAuthor[] = []
  const bookGenres: BookGenre[] = []

  // "Атомные привычки" - Джеймс Клир, Саморазвитие
  bookAuthors.push({
    id: generateId(),
    book_id: books[0].id,
    author_id: authors[0].id,
    role: "author" as const,
    order: 0,
    created_at: now(),
    updated_at: now(),
  })
  bookGenres.push({
    id: generateId(),
    book_id: books[0].id,
    genre_id: genres[0].id, // Саморазвитие
    created_at: now(),
    updated_at: now(),
  })

  // "Глубокий покой" - Мэттью Уокер, Наука
  bookAuthors.push({
    id: generateId(),
    book_id: books[1].id,
    author_id: authors[1].id,
    role: "author" as const,
    order: 0,
    created_at: now(),
    updated_at: now(),
  })
  bookGenres.push({
    id: generateId(),
    book_id: books[1].id,
    genre_id: genres[1].id, // Наука
    created_at: now(),
    updated_at: now(),
  })

  // "Как завоёвывать друзей" - Дэвид Флинн, Саморазвитие
  bookAuthors.push({
    id: generateId(),
    book_id: books[2].id,
    author_id: authors[2].id,
    role: "author" as const,
    order: 0,
    created_at: now(),
    updated_at: now(),
  })
  bookGenres.push({
    id: generateId(),
    book_id: books[2].id,
    genre_id: genres[0].id, // Саморазвитие
    created_at: now(),
    updated_at: now(),
  })

  // "Думай и богатей" - Саморазвитие
  bookGenres.push({
    id: generateId(),
    book_id: books[3].id,
    genre_id: genres[0].id, // Саморазвитие
    created_at: now(),
    updated_at: now(),
  })

  // "7 навыков" - Саморазвитие, Здоровье
  bookGenres.push({
    id: generateId(),
    book_id: books[4].id,
    genre_id: genres[0].id, // Саморазвитие
    created_at: now(),
    updated_at: now(),
  })
  bookGenres.push({
    id: generateId(),
    book_id: books[4].id,
    genre_id: genres[2].id, // Здоровье
    created_at: now(),
    updated_at: now(),
  })

  if (bookAuthors.length > 0) {
    await db.bookAuthors.bulkAdd(bookAuthors)
    console.log(`Added ${bookAuthors.length} bookAuthors`)
  }
  if (bookGenres.length > 0) {
    await db.bookGenres.bulkAdd(bookGenres)
    console.log(`Added ${bookGenres.length} bookGenres`)
  }

  // Now add userBooks entries for these books
  const statuses: ReadingStatus[] = ["reading", "completed", "planned", "reading", "completed"]
  const ratings = [4, 5, 4, 5, 5]
  const userBooks = books.map((book, index) => ({
    id: generateId(),
    book_id: book.id,
    status: statuses[index],
    rating: ratings[index],
    started_at: index < 3 ? randomISODateOnlyInLastWeek() : undefined,
    finished_at: index >= 3 ? randomISODateOnlyInLastWeek() : undefined,
    created_at: now(),
    updated_at: now(),
  }))

  await db.userBooks.bulkAdd(userBooks)
  console.log(`Added ${userBooks.length} userBooks`)

  // Add recipes to content table
  const recipes = [
    {
      id: generateId(),
      type: ContentType.RECIPE,
      recipe_type: "food",
      title: "Салат с курицей и овощами",
      description: "Лёгкий и полезный салат",
      rating: 4.2,
      tags: ["здоровое", "быстро", "вкусно"],
      cover: "",
      prep_time_min: 15,
      cook_time_min: 20,
      total_time_min: 35,
      servings: 2,
      difficulty: "easy" as Difficulty,
      calories: 250,
      protein: 25,
      fat: 12,
      carbs: 15,
      sugar: 4,
      fiber: 3,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ContentType.RECIPE,
      recipe_type: "food",
      title: "Овсянка с ягодами",
      description: "Идеальный завтрак",
      rating: 4.5,
      tags: ["здоровое", "быстро", "любимое"],
      cover: "",
      prep_time_min: 5,
      cook_time_min: 10,
      total_time_min: 15,
      servings: 1,
      difficulty: "easy" as Difficulty,
      calories: 180,
      protein: 6,
      fat: 4,
      carbs: 30,
      sugar: 8,
      fiber: 4,
      created_at: now(),
      updated_at: now(),
    },
    // Drink recipes
    {
      id: generateId(),
      type: ContentType.RECIPE,
      recipe_type: "drink",
      title: "Зелёный чай с жасмином",
      description: "Ароматный зелёный чай с цветами жасмина",
      rating: 4.7,
      tags: ["здоровое", "расслабление", "вкусно"],
      cover: "",
      prep_time_min: 2,
      cook_time_min: 5,
      total_time_min: 7,
      servings: 1,
      difficulty: "easy" as Difficulty,
      drink_metadata: {
        drink_type: "tea",
        base: "Зелёный чай",
        serving_temperature: "hot",
        is_carbonated: false,
        volume_ml: 250,
        caffeine_mg: 30,
      },
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ContentType.RECIPE,
      recipe_type: "drink",
      title: "Клубничный смузи",
      description: "Освежающий смузи из клубники с молоком",
      rating: 4.8,
      tags: ["здоровое", "быстро", "любимое"],
      cover: "",
      prep_time_min: 5,
      cook_time_min: 0,
      total_time_min: 5,
      servings: 1,
      difficulty: "easy" as Difficulty,
      calories: 150,
      protein: 5,
      fat: 2,
      carbs: 28,
      sugar: 18,
      fiber: 3,
      drink_metadata: {
        drink_type: "smoothie",
        base: "Молоко",
        serving_temperature: "cold",
        is_carbonated: false,
        volume_ml: 350,
        caffeine_mg: 0,
      },
      created_at: now(),
      updated_at: now(),
    },
    // Cocktail recipes
    {
      id: generateId(),
      type: ContentType.RECIPE,
      recipe_type: "cocktail",
      title: "Мохито",
      description: "Классический кубинский коктейль с ромом и мятой",
      rating: 4.9,
      tags: ["коктейль", "освежающий", "классика"],
      cover: "",
      prep_time_min: 5,
      cook_time_min: 0,
      total_time_min: 5,
      servings: 1,
      difficulty: "medium" as Difficulty,
      cocktail_metadata: {
        is_alcoholic: true,
        alcohol_percent: 12,
        base_spirit: "Белый ром",
        cocktail_method: "muddled",
        glass_type: "Highball",
        ice_type: "crushed",
        garnish: ["Мята", "Лайм"],
        color: "Прозрачный с зелёным",
        iba_category: "IBA Contemporary Classics",
        tools: ["Muddler", "Bar spoon"],
      },
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ContentType.RECIPE,
      recipe_type: "cocktail",
      title: "Маргарита",
      description: "Классическая мексиканская маргарита с текилой",
      rating: 4.8,
      tags: ["коктейль", "классика", "мексика"],
      cover: "",
      prep_time_min: 3,
      cook_time_min: 0,
      total_time_min: 3,
      servings: 1,
      difficulty: "easy" as Difficulty,
      cocktail_metadata: {
        is_alcoholic: true,
        alcohol_percent: 15,
        base_spirit: "Текила",
        cocktail_method: "shaken",
        glass_type: "Margarita",
        ice_type: "cubed",
        garnish: ["Лайм", "Соль"],
        color: "Зелёный",
        iba_category: "IBA Contemporary Classics",
        tools: ["Shaker", "Strainer"],
      },
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.content.bulkAdd(recipes)
  console.log(`Added ${recipes.length} recipes`)

  // Create recipe ingredient items (link ingredients to recipes)
  const allIngredients = await db.recipeIngredients.toArray()
  const recipeIngredientItems: RecipeIngredientItem[] = []
  const recipeSteps: RecipeStep[] = []

  // For "Салат с курицей и овощами"
  const salad = recipes[0]
  const chickenIngredient = allIngredients.find((i) => i.name === "Куриная грудка")
  const lettuceIngredient = allIngredients.find((i) => i.name === "Листья салата")
  const tomatoIngredient = allIngredients.find((i) => i.name === "Помидоры")
  const cucumberIngredient = allIngredients.find((i) => i.name === "Огурцы")
  const oilIngredient = allIngredients.find((i) => i.name === "Оливковое масло")

  if (salad && chickenIngredient) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: salad.id,
      ingredient_id: chickenIngredient.id,
      ingredient_name: chickenIngredient.name,
      amount: 200,
      unit: "г",
      order: 1,
      created_at: now(),
      updated_at: now(),
    })
  }
  if (salad && lettuceIngredient) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: salad.id,
      ingredient_id: lettuceIngredient.id,
      ingredient_name: lettuceIngredient.name,
      amount: 100,
      unit: "г",
      order: 2,
      created_at: now(),
      updated_at: now(),
    })
  }
  if (salad && tomatoIngredient) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: salad.id,
      ingredient_id: tomatoIngredient.id,
      ingredient_name: tomatoIngredient.name,
      amount: 2,
      unit: "шт",
      order: 3,
      created_at: now(),
      updated_at: now(),
    })
  }
  if (salad && cucumberIngredient) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: salad.id,
      ingredient_id: cucumberIngredient.id,
      ingredient_name: cucumberIngredient.name,
      amount: 1,
      unit: "шт",
      order: 4,
      created_at: now(),
      updated_at: now(),
    })
  }
  if (salad && oilIngredient) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: salad.id,
      ingredient_id: oilIngredient.id,
      ingredient_name: oilIngredient.name,
      amount: 2,
      unit: "ст.л.",
      order: 5,
      created_at: now(),
      updated_at: now(),
    })
  }

  // Add steps for salad
  if (salad) {
    recipeSteps.push({
      id: generateId(),
      recipe_id: salad.id,
      order: 1,
      text: "Отварить куриную грудку до готовности (около 20 минут)",
      timer_min: 20,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: salad.id,
      order: 2,
      text: "Нарезать овощи и листья салата",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: salad.id,
      order: 3,
      text: "Нарезать курицу и добавить к овощам",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: salad.id,
      order: 4,
      text: "Заправить оливковым маслом и перемешать",
      created_at: now(),
      updated_at: now(),
    })
  }

  // For "Овсянка с ягодами"
  const porridge = recipes[1]
  const oatsIngredient = allIngredients.find((i) => i.name === "Овсяные хлопья")
  const milkIngredient = allIngredients.find((i) => i.name === "Молоко")
  const berriesIngredient = allIngredients.find((i) => i.name === "Ягоды")

  if (porridge && oatsIngredient) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: porridge.id,
      ingredient_id: oatsIngredient.id,
      ingredient_name: oatsIngredient.name,
      amount: 100,
      unit: "г",
      order: 1,
      created_at: now(),
      updated_at: now(),
    })
  }
  if (porridge && milkIngredient) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: porridge.id,
      ingredient_id: milkIngredient.id,
      ingredient_name: milkIngredient.name,
      amount: 250,
      unit: "мл",
      order: 2,
      created_at: now(),
      updated_at: now(),
    })
  }
  if (porridge && berriesIngredient) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: porridge.id,
      ingredient_id: berriesIngredient.id,
      ingredient_name: berriesIngredient.name,
      amount: 50,
      unit: "г",
      optional: true,
      order: 3,
      note: "по вкусу",
      created_at: now(),
      updated_at: now(),
    })
  }

  // Add steps for porridge
  if (porridge) {
    recipeSteps.push({
      id: generateId(),
      recipe_id: porridge.id,
      order: 1,
      text: "Вскипятить молоко в кастрюле",
      timer_min: 3,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: porridge.id,
      order: 2,
      text: "Добавить овсяные хлопья и варить на медленном огне 5 минут",
      timer_min: 5,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: porridge.id,
      order: 3,
      text: "Снять с огня и дать постоять 2 минуты",
      timer_min: 2,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: porridge.id,
      order: 4,
      text: "Добавить ягоды и подавать",
      created_at: now(),
      updated_at: now(),
    })
  }

  // For "Зелёный чай с жасмином"
  const tea = recipes[2]
  if (tea) {
    recipeSteps.push({
      id: generateId(),
      recipe_id: tea.id,
      order: 1,
      text: "Вскипятить воду до 80°C",
      timer_min: 3,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: tea.id,
      order: 2,
      text: "Залить чайные листья горячей водой",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: tea.id,
      order: 3,
      text: "Настаивать 3-5 минут",
      timer_min: 5,
      created_at: now(),
      updated_at: now(),
    })
  }

  // For "Клубничный смузи"
  const smoothie = recipes[3]
  if (smoothie) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: smoothie.id,
      ingredient_id: berriesIngredient?.id,
      ingredient_name: "Клубника",
      amount: 150,
      unit: "g",
      order: 1,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: smoothie.id,
      ingredient_id: milkIngredient?.id,
      ingredient_name: "Молоко",
      amount: 200,
      unit: "ml",
      order: 2,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: smoothie.id,
      order: 1,
      text: "Поместить клубнику в блендер",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: smoothie.id,
      order: 2,
      text: "Добавить молоко",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: smoothie.id,
      order: 3,
      text: "Взбивать до однородной консистенции",
      timer_min: 2,
      created_at: now(),
      updated_at: now(),
    })
  }

  // For "Мохито"
  const mojito = recipes[4]
  if (mojito) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Белый ром",
      amount: 50,
      unit: "ml",
      order: 1,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Свежая мята",
      amount: 10,
      unit: "g",
      order: 2,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Лайм",
      amount: 1,
      unit: "pcs",
      order: 3,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Сахар",
      amount: 2,
      unit: "tsp",
      order: 4,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Содовая",
      amount: 100,
      unit: "ml",
      order: 5,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Дроблёный лёд",
      amount: 1,
      unit: "cup",
      order: 6,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: mojito.id,
      order: 1,
      text: "Положить мяту и лайм в бокал",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: mojito.id,
      order: 2,
      text: "Добавить сахар и подавить мадлером",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: mojito.id,
      order: 3,
      text: "Добавить ром и наполнить бокал дроблёным льдом",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: mojito.id,
      order: 4,
      text: "Долить содовую и аккуратно перемешать",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: mojito.id,
      order: 5,
      text: "Украсить веточкой мяты и долькой лайма",
      created_at: now(),
      updated_at: now(),
    })
  }

  // For "Маргарита"
  const margarita = recipes[5]
  if (margarita) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: margarita.id,
      ingredient_name: "Текила",
      amount: 50,
      unit: "ml",
      order: 1,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: margarita.id,
      ingredient_name: "Апельсиновый ликёр",
      amount: 30,
      unit: "ml",
      order: 2,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: margarita.id,
      ingredient_name: "Сок лайма",
      amount: 30,
      unit: "ml",
      order: 3,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: margarita.id,
      ingredient_name: "Соль",
      amount: 1,
      unit: "pinch",
      order: 4,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: margarita.id,
      order: 1,
      text: "Смочить край бокала лаймом и обмакнуть в соль",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: margarita.id,
      order: 2,
      text: "Смешать текилу, ликёр и сок лайма в шейкере со льдом",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: margarita.id,
      order: 3,
      text: "Энергично встряхивать 15 секунд",
      timer_min: 1,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: margarita.id,
      order: 4,
      text: "Процедить в бокал со льдом",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: margarita.id,
      order: 5,
      text: "Украсить долькой лайма",
      created_at: now(),
      updated_at: now(),
    })
  }

  // Save ingredient items and steps
  if (recipeIngredientItems.length > 0) {
    await db.recipeIngredientItems.bulkAdd(recipeIngredientItems)
    console.log(`Added ${recipeIngredientItems.length} recipe ingredient items`)
  }
  if (recipeSteps.length > 0) {
    await db.recipeSteps.bulkAdd(recipeSteps)
    console.log(`Added ${recipeSteps.length} recipe steps`)
  }

  return { books, userBooks, recipes }
}

// ============================================
// Генерация рецептов (ingredients)
// ============================================

async function seedRecipeDetails() {
  const ingredients = await db.recipeIngredients.count()
  if (ingredients > 0) {
    console.log("Recipe ingredients already exist, skipping...")
    return
  }

  const recipeIngredients: RecipeIngredient[] = [
    {
      id: generateId(),
      name: "Куриная грудка",
      category: "meat" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Листья салата",
      category: "vegetable" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Помидоры",
      category: "vegetable" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Огурцы",
      category: "vegetable" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Оливковое масло",
      category: "oil" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Овсяные хлопья",
      category: "grain" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Молоко",
      category: "dairy" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Ягоды",
      category: "fruit" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.recipeIngredients.bulkAdd(recipeIngredients)
  console.log(`Added ${recipeIngredients.length} recipe ingredients`)
}

// ============================================
// Генерация книг (authors, genres)
// ============================================

async function seedBookDetails() {
  const authors = await db.authors.count()
  if (authors > 0) {
    console.log("Authors already exist, skipping...")
    return
  }

  const authorsData = [
    { id: generateId(), name: "Джеймс Клир", created_at: now(), updated_at: now() },
    { id: generateId(), name: "Мэттью Уокер", created_at: now(), updated_at: now() },
    { id: generateId(), name: "Дэвид Флинн", created_at: now(), updated_at: now() },
  ]

  await db.authors.bulkAdd(authorsData)
  console.log(`Added ${authorsData.length} authors`)

  const genres = [
    { id: generateId(), name: "Саморазвитие", created_at: now(), updated_at: now() },
    { id: generateId(), name: "Наука", created_at: now(), updated_at: now() },
    { id: generateId(), name: "Здоровье", created_at: now(), updated_at: now() },
  ]

  await db.genres.bulkAdd(genres)
  console.log(`Added ${genres.length} genres`)
}

// ============================================
// Генерация целей и привычек
// ============================================

async function seedGoalsAndHabits() {
  // Goals
  const existingGoals = await db.goals.count()
  if (existingGoals === 0) {
    const goals: Goal[] = [
      {
        id: generateId(),
        type: "water" as GoalType,
        name: "Пить воду",
        target_value: 2000,
        period: "daily" as GoalPeriod,
        is_active: true,
        start_date: randomISODateOnlyInLastWeek(),
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        type: "steps" as GoalType,
        name: "Ходить",
        target_value: 10000,
        period: "daily" as GoalPeriod,
        is_active: true,
        start_date: randomISODateOnlyInLastWeek(),
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        type: "calories" as GoalType,
        name: "Калории",
        target_value: 2000,
        period: "daily" as GoalPeriod,
        is_active: true,
        start_date: randomISODateOnlyInLastWeek(),
        created_at: now(),
        updated_at: now(),
      },
    ]
    await db.goals.bulkAdd(goals)
    console.log(`Added ${goals.length} goals`)
  }

  // Habits
  const existingHabits = await db.habits.count()
  if (existingHabits === 0) {
    const today = format(new Date(), "yyyy-MM-dd")
    const habits: Habit[] = [
      {
        id: generateId(),
        name: "Утренняя йога",
        habit_type: "positive",
        frequency: "daily",
        is_active: true,
        start_date: today,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: "Пить воду",
        habit_type: "positive",
        frequency: "daily",
        is_active: true,
        start_date: today,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: "Читать перед сном",
        habit_type: "positive",
        frequency: "daily",
        is_active: true,
        start_date: today,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: "Медитация",
        habit_type: "positive",
        frequency: "daily",
        is_active: true,
        start_date: today,
        created_at: now(),
        updated_at: now(),
      },
    ]
    await db.habits.bulkAdd(habits)
    console.log(`Added ${habits.length} habits`)

    // Habit logs for the last week
    const habitLogs: HabitLog[] = []
    for (const habit of habits) {
      for (let i = 0; i < randomBetween(4, 7); i++) {
        habitLogs.push({
          id: generateId(),
          habit_id: habit.id,
          date: randomISODateOnlyInLastWeek(),
          completed: true,
          created_at: now(),
          updated_at: now(),
        })
      }
    }
    await db.habitLogs.bulkAdd(habitLogs)
    console.log(`Added ${habitLogs.length} habit logs`)
  }
}

// ============================================
// Генерация трекеров (sleep, water, mood, body)
// ============================================

async function seedTrackers() {
  // Sleep logs
  const existingSleep = await db.sleepLogs.count()
  if (existingSleep < 5) {
    const sleepLogs: SleepLog[] = []
    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd")
      const startHour = randomBetween(22, 24)
      const startMin = randomBetween(0, 59)
      const endHour = randomBetween(6, 9)
      const endMin = randomBetween(0, 59)
      sleepLogs.push({
        id: generateId(),
        date,
        start_time: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
        end_time: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
        duration_min: randomBetween(300, 540),
        quality: randomElement([1, 2, 3, 4, 5] as const),
        notes: "",
        created_at: now(),
        updated_at: now(),
      })
    }
    await db.sleepLogs.bulkAdd(sleepLogs)
    console.log(`Added ${sleepLogs.length} sleep logs`)
  }

  // Water logs
  const existingWater = await db.waterLogs.count()
  if (existingWater < 20) {
    const waterLogs: WaterLog[] = []
    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd")
      // Multiple entries per day
      for (let j = 0; j < randomBetween(3, 6); j++) {
        waterLogs.push({
          id: generateId(),
          date,
          amount_ml: randomElement([200, 250, 300, 350, 500]),
          type: "water",
          created_at: now(),
          updated_at: now(),
        })
      }
    }
    await db.waterLogs.bulkAdd(waterLogs)
    console.log(`Added ${waterLogs.length} water logs`)
  }

  // Mood logs
  const existingMood = await db.moodLogs.count()
  if (existingMood < 5) {
    const moodLogs: MoodLog[] = []
    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd")
      moodLogs.push({
        id: generateId(),
        date,
        mood: randomElement(["terrible", "bad", "okay", "good", "great"] as MoodType[]),
        energy: randomElement([1, 2, 3, 4, 5] as const),
        stress: randomElement([1, 2, 3, 4, 5] as const),
        notes: "",
        created_at: now(),
        updated_at: now(),
      })
    }
    await db.moodLogs.bulkAdd(moodLogs)
    console.log(`Added ${moodLogs.length} mood logs`)
  }

  // Body measurements
  const existingBody = await db.bodyMeasurements.count()
  if (existingBody < 3) {
    const measurements: BodyMeasurement[] = [
      {
        id: generateId(),
        date: randomISODateOnlyInLastWeek(),
        type: "weight" as BodyMeasurementType,
        value: randomBetween(60, 90),
        unit: "kg",
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        date: randomISODateOnlyInLastWeek(),
        type: "height" as BodyMeasurementType,
        value: randomBetween(160, 190),
        unit: "cm",
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        date: randomISODateOnlyInLastWeek(),
        type: "waist" as BodyMeasurementType,
        value: randomBetween(60, 100),
        unit: "cm",
        created_at: now(),
        updated_at: now(),
      },
    ]
    await db.bodyMeasurements.bulkAdd(measurements)
    console.log(`Added ${measurements.length} body measurements`)
  }
}

// ============================================
// Генерация напоминаний
// ============================================

async function seedReminders() {
  const existingReminders = await db.reminders.count()
  if (existingReminders === 0) {
    const reminders: Reminder[] = [
      {
        id: generateId(),
        title: "Утренняя йога",
        message: "30 минут йоги",
        type: "habit" as ReminderType,
        time: "07:00",
        days: [1, 3, 5],
        is_active: true,
        priority: "medium" as ReminderPriority,
        sound: true,
        vibration: true,
        persistent: false,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        title: "Пить воду",
        message: "Стакан воды",
        type: "water" as ReminderType,
        time: "09:00",
        days: [0, 1, 2, 3, 4, 5, 6],
        is_active: true,
        priority: "high" as ReminderPriority,
        sound: true,
        vibration: true,
        persistent: false,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        title: "Принять витамины",
        message: "Витамин D3",
        type: "medicine" as ReminderType,
        time: "08:00",
        days: [0, 1, 2, 3, 4, 5, 6],
        is_active: true,
        priority: "medium" as ReminderPriority,
        sound: true,
        vibration: true,
        persistent: false,
        created_at: now(),
        updated_at: now(),
      },
    ]
    await db.reminders.bulkAdd(reminders)
    console.log(`Added ${reminders.length} reminders`)
  }
}

// ============================================
// Генерация шаблонов
// ============================================

async function seedTemplates() {
  const existingTemplates = await db.templates.count()
  if (existingTemplates === 0) {
    const templates: Template[] = [
      {
        id: generateId(),
        name: "Утренняя рутина",
        type: "mood",
        is_favorite: true,
        data: { habits: ["йога", "вода", "завтрак"] },
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: "Тренировка",
        type: "workout",
        is_favorite: false,
        data: { exercises: ["разминка", "силовая", "растяжка"] },
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: "Завтрак",
        type: "food",
        is_favorite: true,
        data: { meals: ["овсянка", "фрукты", "йогурт"] },
        created_at: now(),
        updated_at: now(),
      },
    ]
    await db.templates.bulkAdd(templates)
    console.log(`Added ${templates.length} templates`)
  }
}

// ============================================
// Главная функция заполнения
// ============================================

export async function seedDatabase() {
  console.log("Starting database seeding...")

  try {
    // Reference data first (required for other tables)
    await seedCategories()
    await seedTags()
    await seedUnits()
    await seedAccounts()
    await seedExercises()

    // Main data
    await seedLogs()
    await seedItems()

    // Book reference data (authors, genres) must be created before books
    await seedBookDetails()

    // Recipe reference data (ingredients) must be created before recipes
    await seedRecipeDetails()

    // Now create books and recipes with their relationships
    await seedContent()

    // Related data
    await seedGoalsAndHabits()
    await seedTrackers()
    await seedReminders()
    await seedTemplates()

    console.log("Database seeding completed!")
    return { success: true }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, error }
  }
}
