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
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.content.bulkAdd(recipes)
  console.log(`Added ${recipes.length} recipes`)

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

    // Now create books with author and genre relationships
    await seedContent()

    // Related data
    await seedRecipeDetails()
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
