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
import { financeCategoriesStructure } from "./finance-categories"
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
  StrengthSubcategory,
  CardioSubcategory,
  YogaSubcategory,
} from "@/types"

// ============================================
// Helper functions
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
// Seed reference data
// ============================================

async function seedCategories() {
  const existingCategories = await db.categories.count()
  if (existingCategories > 0) {
    console.log("Categories already exist, skipping...")
    return
  }

  const categories = [
    // Food categories (using keys from entities.json)
    {
      id: generateId(),
      type: LogType.FOOD,
      name: "breakfast",
      created_at: now(),
      updated_at: now(),
    },
    { id: generateId(), type: LogType.FOOD, name: "lunch", created_at: now(), updated_at: now() },
    { id: generateId(), type: LogType.FOOD, name: "dinner", created_at: now(), updated_at: now() },
    { id: generateId(), type: LogType.FOOD, name: "snack", created_at: now(), updated_at: now() },
    { id: generateId(), type: LogType.FOOD, name: "drink", created_at: now(), updated_at: now() },
    // Workout categories (using keys from entities.json)
    {
      id: generateId(),
      type: LogType.WORKOUT,
      name: "strength",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.WORKOUT,
      name: "cardio",
      created_at: now(),
      updated_at: now(),
    },
    { id: generateId(), type: LogType.WORKOUT, name: "yoga", created_at: now(), updated_at: now() },
    {
      id: generateId(),
      type: LogType.WORKOUT,
      name: "stretching",
      created_at: now(),
      updated_at: now(),
    },
    // Finance categories (using keys from financeCategoriesStructure)
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "product",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "transport",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "entertainment",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "health",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "education",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "housing",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "communication",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: LogType.FINANCE,
      name: "clothing",
      created_at: now(),
      updated_at: now(),
    },
    // Item categories
    {
      id: generateId(),
      type: ItemType.VITAMIN,
      name: "vitamins",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.MEDICINE,
      name: "medicines",
      created_at: now(),
      updated_at: now(),
    },
    { id: generateId(), type: ItemType.HERB, name: "herbs", created_at: now(), updated_at: now() },
    {
      id: generateId(),
      type: ItemType.COSMETIC,
      name: "cosmetics",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.PRODUCT,
      name: "products",
      created_at: now(),
      updated_at: now(),
    },
    // Content categories
    {
      id: generateId(),
      type: ContentType.BOOK,
      name: "books",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ContentType.RECIPE,
      name: "recipes",
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
    { id: generateId(), name: "healthy", created_at: now(), updated_at: now() },
    { id: generateId(), name: "quick", created_at: now(), updated_at: now() },
    { id: generateId(), name: "tasty", created_at: now(), updated_at: now() },
    { id: generateId(), name: "important", created_at: now(), updated_at: now() },
    { id: generateId(), name: "plan", created_at: now(), updated_at: now() },
    { id: generateId(), name: "favorite", created_at: now(), updated_at: now() },
    { id: generateId(), name: "new", created_at: now(), updated_at: now() },
    { id: generateId(), name: "daily", created_at: now(), updated_at: now() },
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
      name: "kg",
      abbreviation: "kg",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "weight" as const,
      name: "g",
      abbreviation: "g",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "volume" as const,
      name: "ml",
      abbreviation: "ml",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "volume" as const,
      name: "l",
      abbreviation: "l",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "count" as const,
      name: "pcs",
      abbreviation: "pcs",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "time" as const,
      name: "min",
      abbreviation: "min",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "time" as const,
      name: "h",
      abbreviation: "h",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: "money" as const,
      name: "rub",
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
      name: "cash",
      type: "cash",
      balance: 0,
      currency: "RUB",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "card",
      type: "card",
      balance: 0,
      currency: "RUB",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "bank",
      type: "bank",
      balance: 0,
      currency: "RUB",
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "investment",
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
      name: "Bench Press",
      category: "strength",
      muscle_groups: ["chest", "triceps"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Squats",
      category: "strength",
      muscle_groups: ["legs", "glutes"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Deadlift",
      category: "strength",
      muscle_groups: ["back", "legs"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Treadmill Running",
      category: "cardio",
      muscle_groups: ["cardio"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Cycling",
      category: "cardio",
      muscle_groups: ["cardio", "legs"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Jump Rope",
      category: "cardio",
      muscle_groups: ["cardio"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Yoga Therapy",
      category: "yoga",
      muscle_groups: ["full body"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Morning Yoga",
      category: "yoga",
      muscle_groups: ["full body"],
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.exercises.bulkAdd(exercises)
  console.log(`Added ${exercises.length} exercises`)
  return exercises
}

// ============================================
// Seed logs
// ============================================

async function seedLogs() {
  const categories = await db.categories.toArray()
  const accounts = await db.accounts.toArray()
  const exercises = await db.exercises.toArray()
  const tags = await db.tags.toArray()
  const units = await db.units.toArray()

  const foodCategories = categories.filter((c) => c.type === LogType.FOOD)
  const workoutCategories = categories.filter((c) => c.type === LogType.WORKOUT)
  const financeCategories = categories.filter((c) => c.type === LogType.FINANCE)

  // Units
  const gramUnit = units.find((u) => u.abbreviation === "g") || units[0]
  const kgUnit = units.find((u) => u.abbreviation === "kg") || units[0]
  const kmUnit = units.find((u) => u.abbreviation === "km") || units[0]
  const minUnit = units.find((u) => u.abbreviation === "min") || units[0]

  const logs: Log[] = []

  // Food logs (5-7 entries)
  for (let i = 0; i < randomBetween(5, 7); i++) {
    const date = randomISODateOnlyInLastWeek()
    logs.push({
      id: generateId(),
      type: LogType.FOOD,
      date,
      title: randomElement([
        "Omelet Breakfast",
        "Chicken Lunch",
        "Fish Dinner",
        "Caesar Salad",
        "Oatmeal with Fruits",
        "Turkey Sandwich",
        "Yogurt with Muesli",
      ]),
      category_id: foodCategories.length > 0 ? randomElement(foodCategories).id : undefined,
      quantity: randomBetween(100, 500),
      unit: gramUnit?.abbreviation || "g",
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
    const workoutCategory = randomElement(["strength", "cardio", "yoga"])

    let subcategory: StrengthSubcategory | CardioSubcategory | YogaSubcategory | undefined
    if (workoutCategory === "strength") {
      subcategory = randomElement([
        "chest",
        "back",
        "legs",
        "shoulders",
        "arms",
      ] as StrengthSubcategory[])
    } else if (workoutCategory === "cardio") {
      subcategory = randomElement([
        "running",
        "cycling",
        "swimming",
        "walking",
      ] as CardioSubcategory[])
    } else {
      subcategory = randomElement(["hatha", "vinyasa", "yin", "restorative"] as YogaSubcategory[])
    }

    logs.push({
      id: generateId(),
      type: LogType.WORKOUT,
      date,
      title: randomElement([
        "Gym Workout",
        "Morning Run",
        "Cycling",
        "Yoga",
        "Stretching",
        "Interval Training",
        "Strength Training",
      ]),
      category_id: workoutCategories.length > 0 ? randomElement(workoutCategories).id : undefined,
      quantity: randomBetween(30, 90),
      unit: minUnit?.abbreviation || "min",
      value: randomBetween(200, 600),
      tags: [randomElement(tags).name],
      metadata: {
        duration: randomBetween(30, 90),
        intensity,
        subcategory,
        exercise_id: exercises.length > 0 ? randomElement(exercises).id : undefined,
        calories_burned: randomBetween(200, 600),
      },
      created_at: randomISODateInLastWeek(),
      updated_at: now(),
    })
  }

  // Finance logs - create for all types (income, expense, transfer)
  // 2-3 entries for each category from financeCategoriesStructure

  // Income logs (2 entries per category)
  const incomeCategories = Object.keys(financeCategoriesStructure.income || {})
  for (const categoryKey of incomeCategories) {
    const categoryData = (financeCategoriesStructure.income || {})[categoryKey]
    const subcategories = Object.keys(categoryData?.subcategories || {})

    // Create 2 entries with different subcategories
    for (let i = 0; i < 2; i++) {
      const subcategoryKey =
        subcategories.length > 0 ? subcategories[i % subcategories.length] : undefined
      const suppliers = subcategoryKey ? categoryData?.subcategories?.[subcategoryKey] || [] : []
      const supplierKey = suppliers.length > 0 ? randomElement(suppliers) : undefined

      // Find category in DB by name (key)
      const dbCategory = financeCategories.find((c) => c.name === categoryKey)

      logs.push({
        id: generateId(),
        type: LogType.FINANCE,
        date: randomISODateOnlyInLastWeek(),
        title: `Income: ${categoryKey} #${i + 1}`,
        category_id: dbCategory?.id,
        quantity: 1,
        unit: "pcs",
        value: randomBetween(30000, 100000),
        tags: [],
        metadata: {
          finance_type: FinanceType.INCOME,
          account_id: accounts.length > 0 ? randomElement(accounts).id : undefined,
          category_key: categoryKey,
          subcategory_key: subcategoryKey,
          item_key: supplierKey,
          supplier_key: supplierKey,
        },
        created_at: randomISODateInLastWeek(),
        updated_at: now(),
      })
    }
  }

  // Expense logs (3 entries per category)
  const expenseCategories = Object.keys(financeCategoriesStructure.expense || {})
  for (const categoryKey of expenseCategories) {
    const categoryData = (financeCategoriesStructure.expense || {})[categoryKey]
    const subcategories = Object.keys(categoryData?.subcategories || {})

    // Create 3 entries with different subcategories
    for (let i = 0; i < 3; i++) {
      const subcategoryKey =
        subcategories.length > 0 ? subcategories[i % subcategories.length] : undefined
      const suppliers = subcategoryKey ? categoryData?.subcategories?.[subcategoryKey] || [] : []
      const supplierKey = suppliers.length > 0 ? randomElement(suppliers) : undefined

      // Find category in DB by name (key)
      const dbCategory = financeCategories.find((c) => c.name === categoryKey)

      logs.push({
        id: generateId(),
        type: LogType.FINANCE,
        date: randomISODateOnlyInLastWeek(),
        title: `Expense: ${categoryKey} #${i + 1}`,
        category_id: dbCategory?.id,
        quantity: 1,
        unit: "pcs",
        value: randomBetween(500, 5000),
        tags: [],
        metadata: {
          finance_type: FinanceType.EXPENSE,
          account_id: accounts.length > 0 ? randomElement(accounts).id : undefined,
          category_key: categoryKey,
          subcategory_key: subcategoryKey,
          item_key: supplierKey,
          supplier_key: supplierKey,
        },
        created_at: randomISODateInLastWeek(),
        updated_at: now(),
      })
    }
  }

  // Transfer logs (1 entry per category)
  const transferCategories = Object.keys(financeCategoriesStructure.transfer || {})
  for (const categoryKey of transferCategories) {
    const categoryData = (financeCategoriesStructure.transfer || {})[categoryKey]
    const subcategories = Object.keys(categoryData?.subcategories || {})
    const subcategoryKey = subcategories.length > 0 ? randomElement(subcategories) : undefined
    const suppliers = subcategoryKey ? categoryData?.subcategories?.[subcategoryKey] || [] : []
    const supplierKey = suppliers.length > 0 ? randomElement(suppliers) : undefined

    // For transfers, category is not that important, use the first financial category
    const dbCategory = financeCategories.length > 0 ? financeCategories[0] : undefined

    logs.push({
      id: generateId(),
      type: LogType.FINANCE,
      date: randomISODateOnlyInLastWeek(),
      title: `Transfer: ${categoryKey}`,
      category_id: dbCategory?.id,
      quantity: 1,
      unit: "pcs",
      value: randomBetween(1000, 50000),
      tags: [],
      metadata: {
        finance_type: FinanceType.TRANSFER,
        account_id: accounts.length > 0 ? randomElement(accounts).id : undefined,
        target_account_id:
          accounts.length > 1
            ? randomElement(accounts.filter((a) => a.id !== accounts[0].id)).id
            : undefined,
        category_key: categoryKey,
        subcategory_key: subcategoryKey,
        supplier_key: supplierKey,
      },
      created_at: randomISODateInLastWeek(),
      updated_at: now(),
    })
  }

  await db.logs.bulkAdd(logs)
  console.log(`Added ${logs.length} logs`)
}

// ============================================
// Seed items (catalog)
// ============================================

async function seedItems() {
  const items: Item[] = [
    // Vitamins
    {
      id: generateId(),
      type: ItemType.VITAMIN,
      name: "Vitamin D3",
      category: "vitamins",
      dosage: "5000 IU",
      manufacturer: "Now Foods",
      tags: ["healthy", "important"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.VITAMIN,
      name: "Omega-3",
      category: "vitamins",
      dosage: "1000mg",
      manufacturer: "Nordic Naturals",
      tags: ["healthy"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.VITAMIN,
      name: "Magnesium",
      category: "vitamins",
      dosage: "400mg",
      manufacturer: "Doctor's Best",
      tags: ["healthy", "important"],
      created_at: now(),
      updated_at: now(),
    },
    // Medicines
    {
      id: generateId(),
      type: ItemType.MEDICINE,
      name: "Ibuprofen",
      category: "medicines",
      dosage: "200mg",
      usage: "Pain reliever",
      tags: ["important"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.MEDICINE,
      name: "Paracetamol",
      category: "medicines",
      dosage: "500mg",
      usage: "Antipyretic",
      tags: ["important"],
      created_at: now(),
      updated_at: now(),
    },
    // Herbs
    {
      id: generateId(),
      type: ItemType.HERB,
      name: "Chamomile",
      category: "Herbs",
      usage: "Calming tea",
      benefits: "Stress relief",
      tags: ["healthy"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.HERB,
      name: "Mint",
      category: "Herbs",
      usage: "Tea",
      benefits: "Digestion",
      tags: ["healthy", "quick"],
      created_at: now(),
      updated_at: now(),
    },
    // Cosmetics
    {
      id: generateId(),
      type: ItemType.COSMETIC,
      name: "Moisturizing Cream",
      category: "Cosmetics",
      usage: "For face",
      manufacturer: "CeraVe",
      tags: ["favorite"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.COSMETIC,
      name: "Vitamin C Serum",
      category: "Cosmetics",
      usage: "For face",
      manufacturer: "The Ordinary",
      tags: ["healthy", "new"],
      created_at: now(),
      updated_at: now(),
    },
    // Products
    {
      id: generateId(),
      type: ItemType.PRODUCT,
      name: "Chicken Breast",
      category: "Products",
      calories: 165,
      protein: 31,
      fat: 3.6,
      carbs: 0,
      serving_size: 100,
      tags: ["healthy", "tasty"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.PRODUCT,
      name: "Rice",
      category: "Products",
      calories: 130,
      protein: 2.7,
      fat: 0.3,
      carbs: 28,
      serving_size: 100,
      tags: ["quick", "daily"],
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ItemType.PRODUCT,
      name: "Banana",
      category: "Products",
      calories: 89,
      protein: 1.1,
      fat: 0.3,
      carbs: 22.8,
      serving_size: 100,
      tags: ["healthy", "quick"],
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.items.bulkAdd(items)
  console.log(`Added ${items.length} items`)
}

// ============================================
// Seed content (books, recipes)
// ============================================

async function seedContent() {
  const tags = await db.tags.toArray()

  // First add books to the books table
  const books = [
    {
      id: generateId(),
      title: "Atomic Habits",
      subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
      description:
        "A book about forming good habits and breaking bad ones. A practical guide to behavior change.",
      isbn10: "0735211299",
      isbn13: "9780735211292",
      published_year: 2018,
      publisher: "Penguin Random House",
      language: "en",
      page_count: 320,
      format: "paperback" as const,
      rating_avg: 4.5,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      title: "Why We Sleep",
      subtitle: "Unlocking the Power of Sleep and Dreams",
      description:
        "About the importance of sleep and its impact on life. A book by a neuroscience professor about how lack of sleep affects health.",
      isbn10: "1501144315",
      isbn13: "9781501144318",
      published_year: 2017,
      publisher: "Scribner",
      language: "en",
      page_count: 368,
      format: "hardcover" as const,
      rating_avg: 4.8,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      title: "How to Win Friends and Influence People",
      subtitle: "The Classic Book on Communication and Leadership",
      description: "Dale Carnegie's legendary book about making friends and influencing people.",
      isbn10: "0671027034",
      isbn13: "9780671027032",
      published_year: 1936,
      publisher: "Simon & Schuster",
      language: "en",
      page_count: 288,
      format: "paperback" as const,
      rating_avg: 4.7,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      title: "Think and Grow Rich",
      subtitle: "The Classic on Financial Success",
      description:
        "A classic book about the mindset of wealthy people and achieving financial success.",
      isbn10: "1585424337",
      isbn13: "9781585424337",
      published_year: 1937,
      publisher: "TarcherPerigee",
      language: "en",
      page_count: 320,
      format: "paperback" as const,
      rating_avg: 4.6,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      title: "The 7 Habits of Highly Effective People",
      subtitle: "Powerful Tools for Personal Development",
      description: "Stephen Covey's book on principles of effectiveness and personal growth.",
      isbn10: "1451639619",
      isbn13: "9781451639612",
      published_year: 1989,
      publisher: "Simon & Schuster",
      language: "en",
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

  // "Atomic Habits" - James Clear, Self-improvement
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
    genre_id: genres[0].id, // Self-improvement
    created_at: now(),
    updated_at: now(),
  })

  // "Why We Sleep" - Matthew Walker, Science
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
    genre_id: genres[1].id, // Science
    created_at: now(),
    updated_at: now(),
  })

  // "How to Win Friends" - David Flynn, Self-improvement
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
    genre_id: genres[0].id, // Self-improvement
    created_at: now(),
    updated_at: now(),
  })

  // "Think and Grow Rich" - Self-improvement
  bookGenres.push({
    id: generateId(),
    book_id: books[3].id,
    genre_id: genres[0].id, // Self-improvement
    created_at: now(),
    updated_at: now(),
  })

  // "7 Habits" - Self-improvement, Health
  bookGenres.push({
    id: generateId(),
    book_id: books[4].id,
    genre_id: genres[0].id, // Self-improvement
    created_at: now(),
    updated_at: now(),
  })
  bookGenres.push({
    id: generateId(),
    book_id: books[4].id,
    genre_id: genres[2].id, // Health
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
      title: "Chicken and Vegetable Salad",
      description: "Light and healthy salad",
      rating: 4.2,
      tags: ["healthy", "quick", "tasty"],
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
      food_metadata: {
        course_type: "salad",
        cuisine: "russian",
        cooking_method: ["raw"],
        serving_temperature: "cold",
        spicy_level: 0,
        dietary: ["gluten-free", "low-carb"],
      },
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ContentType.RECIPE,
      recipe_type: "food",
      title: "Oatmeal with Berries",
      description: "Perfect breakfast",
      rating: 4.5,
      tags: ["healthy", "quick", "favorite"],
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
      food_metadata: {
        course_type: "breakfast",
        cuisine: "russian",
        cooking_method: ["boil"],
        serving_temperature: "hot",
        spicy_level: 0,
        dietary: ["vegetarian"],
      },
      created_at: now(),
      updated_at: now(),
    },
    // Drink recipes
    {
      id: generateId(),
      type: ContentType.RECIPE,
      recipe_type: "drink",
      title: "Green Tea with Jasmine",
      description: "Fragrant green tea with jasmine flowers",
      rating: 4.7,
      tags: ["healthy", "relaxation", "tasty"],
      cover: "",
      prep_time_min: 2,
      cook_time_min: 5,
      total_time_min: 7,
      servings: 1,
      difficulty: "easy" as Difficulty,
      drink_metadata: {
        drink_type: "tea",
        base: "tea",
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
      title: "Strawberry Smoothie",
      description: "Refreshing strawberry smoothie with milk",
      rating: 4.8,
      tags: ["healthy", "quick", "favorite"],
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
        base: "milk",
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
      title: "Mojito",
      description: "Classic Cuban cocktail with rum and mint",
      rating: 4.9,
      tags: ["cocktail", "refreshing", "classic"],
      cover: "",
      prep_time_min: 5,
      cook_time_min: 0,
      total_time_min: 5,
      servings: 1,
      difficulty: "medium" as Difficulty,
      cocktail_metadata: {
        is_alcoholic: true,
        alcohol_percent: 12,
        base_spirit: "rum",
        cocktail_method: "muddled",
        glass_type: "highball",
        ice_type: "crushed",
        garnish: ["mint", "lime"],
        color: "transparent-green",
        iba_category: "IBA Contemporary Classics",
        tools: ["muddler", "bar-spoon"],
      },
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      type: ContentType.RECIPE,
      recipe_type: "cocktail",
      title: "Margarita",
      description: "Classic Mexican margarita with tequila",
      rating: 4.8,
      tags: ["cocktail", "classic", "mexico"],
      cover: "",
      prep_time_min: 3,
      cook_time_min: 0,
      total_time_min: 3,
      servings: 1,
      difficulty: "easy" as Difficulty,
      cocktail_metadata: {
        is_alcoholic: true,
        alcohol_percent: 15,
        base_spirit: "tequila",
        cocktail_method: "shaken",
        glass_type: "margarita",
        ice_type: "cubed",
        garnish: ["lime", "salt"],
        color: "green",
        iba_category: "IBA Contemporary Classics",
        tools: ["shaker", "strainer"],
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

  // For "Chicken and Vegetable Salad"
  const salad = recipes[0]
  const chickenIngredient = allIngredients.find((i) => i.name === "Chicken Breast")
  const lettuceIngredient = allIngredients.find((i) => i.name === "Lettuce")
  const tomatoIngredient = allIngredients.find((i) => i.name === "Tomatoes")
  const cucumberIngredient = allIngredients.find((i) => i.name === "Cucumbers")
  const oilIngredient = allIngredients.find((i) => i.name === "Olive Oil")

  if (salad && chickenIngredient) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: salad.id,
      ingredient_id: chickenIngredient.id,
      ingredient_name: chickenIngredient.name,
      amount: 200,
      unit: "g",
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
      unit: "g",
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
      unit: "pcs",
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
      unit: "pcs",
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
      unit: "tbsp",
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
      text: "Boil chicken breast until cooked (about 20 minutes)",
      timer_min: 20,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: salad.id,
      order: 2,
      text: "Chop vegetables and lettuce leaves",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: salad.id,
      order: 3,
      text: "Cut chicken and add to vegetables",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: salad.id,
      order: 4,
      text: "Dress with olive oil and mix",
      created_at: now(),
      updated_at: now(),
    })
  }

  // For "Oatmeal with Berries"
  const porridge = recipes[1]
  const oatsIngredient = allIngredients.find((i) => i.name === "Oatmeal")
  const milkIngredient = allIngredients.find((i) => i.name === "Milk")
  const berriesIngredient = allIngredients.find((i) => i.name === "Berries")

  if (porridge && oatsIngredient) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: porridge.id,
      ingredient_id: oatsIngredient.id,
      ingredient_name: oatsIngredient.name,
      amount: 100,
      unit: "g",
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
      unit: "ml",
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
      unit: "g",
      optional: true,
      order: 3,
      note: "to taste",
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
      text: "Boil milk in a saucepan",
      timer_min: 3,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: porridge.id,
      order: 2,
      text: "Add oatmeal and simmer for 5 minutes",
      timer_min: 5,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: porridge.id,
      order: 3,
      text: "Remove from heat and let stand for 2 minutes",
      timer_min: 2,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: porridge.id,
      order: 4,
      text: "Add berries and serve",
      created_at: now(),
      updated_at: now(),
    })
  }

  // For "Green Tea with Jasmine"
  const tea = recipes[2]
  if (tea) {
    recipeSteps.push({
      id: generateId(),
      recipe_id: tea.id,
      order: 1,
      text: "Boil water to 80°C",
      timer_min: 3,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: tea.id,
      order: 2,
      text: "Pour hot water over tea leaves",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: tea.id,
      order: 3,
      text: "Steep for 3-5 minutes",
      timer_min: 5,
      created_at: now(),
      updated_at: now(),
    })
  }

  // For "Strawberry Smoothie"
  const smoothie = recipes[3]
  if (smoothie) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: smoothie.id,
      ingredient_id: berriesIngredient?.id,
      ingredient_name: "Strawberry",
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
      ingredient_name: "Milk",
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
      text: "Place strawberries in blender",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: smoothie.id,
      order: 2,
      text: "Add milk",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: smoothie.id,
      order: 3,
      text: "Blend until smooth",
      timer_min: 2,
      created_at: now(),
      updated_at: now(),
    })
  }

  // For "Mojito"
  const mojito = recipes[4]
  if (mojito) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "White Rum",
      amount: 50,
      unit: "ml",
      order: 1,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Fresh Mint",
      amount: 10,
      unit: "g",
      order: 2,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Lime",
      amount: 1,
      unit: "pcs",
      order: 3,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Sugar",
      amount: 2,
      unit: "tsp",
      order: 4,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Soda Water",
      amount: 100,
      unit: "ml",
      order: 5,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: mojito.id,
      ingredient_name: "Crushed Ice",
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
      text: "Place mint and lime in glass",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: mojito.id,
      order: 2,
      text: "Add sugar and muddle",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: mojito.id,
      order: 3,
      text: "Add rum and fill glass with crushed ice",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: mojito.id,
      order: 4,
      text: "Top with soda water and stir gently",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: mojito.id,
      order: 5,
      text: "Garnish with mint sprig and lime wedge",
      created_at: now(),
      updated_at: now(),
    })
  }

  // For "Margarita"
  const margarita = recipes[5]
  if (margarita) {
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: margarita.id,
      ingredient_name: "Tequila",
      amount: 50,
      unit: "ml",
      order: 1,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: margarita.id,
      ingredient_name: "Orange Liqueur",
      amount: 30,
      unit: "ml",
      order: 2,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: margarita.id,
      ingredient_name: "Lime Juice",
      amount: 30,
      unit: "ml",
      order: 3,
      created_at: now(),
      updated_at: now(),
    })
    recipeIngredientItems.push({
      id: generateId(),
      recipe_id: margarita.id,
      ingredient_name: "Salt",
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
      text: "Moisten glass rim with lime and dip in salt",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: margarita.id,
      order: 2,
      text: "Mix tequila, liqueur and lime juice in shaker with ice",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: margarita.id,
      order: 3,
      text: "Shake vigorously for 15 seconds",
      timer_min: 1,
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: margarita.id,
      order: 4,
      text: "Strain into glass with ice",
      created_at: now(),
      updated_at: now(),
    })
    recipeSteps.push({
      id: generateId(),
      recipe_id: margarita.id,
      order: 5,
      text: "Garnish with lime wedge",
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
// Seed recipes (ingredients)
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
      name: "Chicken Breast",
      category: "meat" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Lettuce",
      category: "vegetable" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Tomatoes",
      category: "vegetable" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Cucumbers",
      category: "vegetable" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Olive Oil",
      category: "oil" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Oatmeal",
      category: "grain" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Milk",
      category: "dairy" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
    {
      id: generateId(),
      name: "Berries",
      category: "fruit" as IngredientCategory,
      created_at: now(),
      updated_at: now(),
    },
  ]

  await db.recipeIngredients.bulkAdd(recipeIngredients)
  console.log(`Added ${recipeIngredients.length} recipe ingredients`)
}

// ============================================
// Seed books (authors, genres)
// ============================================

async function seedBookDetails() {
  const authors = await db.authors.count()
  if (authors > 0) {
    console.log("Authors already exist, skipping...")
    return
  }

  const authorsData = [
    { id: generateId(), name: "James Clear", created_at: now(), updated_at: now() },
    { id: generateId(), name: "Matthew Walker", created_at: now(), updated_at: now() },
    { id: generateId(), name: "David Flynn", created_at: now(), updated_at: now() },
  ]

  await db.authors.bulkAdd(authorsData)
  console.log(`Added ${authorsData.length} authors`)

  const genres = [
    { id: generateId(), name: "Self-improvement", created_at: now(), updated_at: now() },
    { id: generateId(), name: "Science", created_at: now(), updated_at: now() },
    { id: generateId(), name: "Health", created_at: now(), updated_at: now() },
  ]

  await db.genres.bulkAdd(genres)
  console.log(`Added ${genres.length} genres`)
}

// ============================================
// Seed goals and habits
// ============================================

async function seedGoalsAndHabits() {
  // Goals
  const existingGoals = await db.goals.count()
  if (existingGoals === 0) {
    const goals: Goal[] = [
      {
        id: generateId(),
        type: "water" as GoalType,
        name: "Drink Water",
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
        name: "Walk",
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
        name: "Calories",
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
        name: "Morning Yoga",
        habit_type: "positive",
        frequency: "daily",
        is_active: true,
        start_date: today,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: "Drink Water",
        habit_type: "positive",
        frequency: "daily",
        is_active: true,
        start_date: today,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: "Read Before Sleep",
        habit_type: "positive",
        frequency: "daily",
        is_active: true,
        start_date: today,
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: "Meditation",
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
// Seed trackers (sleep, water, mood, body)
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
// Seed reminders
// ============================================

async function seedReminders() {
  const existingReminders = await db.reminders.count()
  if (existingReminders === 0) {
    const reminders: Reminder[] = [
      {
        id: generateId(),
        title: "Morning Yoga",
        message: "30 minutes of yoga",
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
        title: "Drink Water",
        message: "Glass of water",
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
        title: "Take Vitamins",
        message: "Vitamin D3",
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
// Seed templates
// ============================================

async function seedTemplates() {
  const existingTemplates = await db.templates.count()
  if (existingTemplates === 0) {
    const templates: Template[] = [
      {
        id: generateId(),
        name: "Morning Routine",
        type: "mood",
        is_favorite: true,
        data: { habits: ["yoga", "water", "breakfast"] },
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: "Workout",
        type: "workout",
        is_favorite: false,
        data: { exercises: ["warmup", "strength", "stretching"] },
        created_at: now(),
        updated_at: now(),
      },
      {
        id: generateId(),
        name: "Breakfast",
        type: "food",
        is_favorite: true,
        data: { meals: ["oatmeal", "fruits", "yogurt"] },
        created_at: now(),
        updated_at: now(),
      },
    ]
    await db.templates.bulkAdd(templates)
    console.log(`Added ${templates.length} templates`)
  }
}

// ============================================
// Main seed function
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
