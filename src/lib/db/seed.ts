import { db } from "./index"
import type { Log, Item, Content, Category, Tag, Account, RecipeContentExtended } from "@/types"
import { LogType, FinanceType, ItemType, ContentType, BookStatus, RecipeType } from "@/types"

function randomDate(daysAgo: number = 30): string {
  const now = new Date()
  const past = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000)
  return past.toISOString()
}

function uuid(): string {
  return crypto.randomUUID()
}

async function getOrCreateCategories() {
  // Check if categories already exist
  const existingCategories = await db.categories.toArray()
  
  if (existingCategories.length > 0) {
    return existingCategories
  }

  // Create new categories only if none exist
  const categories: Category[] = [
    { id: uuid(), name: "Завтрак", type: LogType.FOOD, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Обед", type: LogType.FOOD, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Ужин", type: LogType.FOOD, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Перекус", type: LogType.FOOD, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Силовая", type: LogType.WORKOUT, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Кардио", type: LogType.WORKOUT, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Йога", type: LogType.WORKOUT, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Зарплата", type: LogType.FINANCE, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Продукты", type: LogType.FINANCE, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Транспорт", type: LogType.FINANCE, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]
  await db.categories.bulkAdd(categories)
  return categories
}

async function seedTags() {
  // Check if tags already exist
  const existingTags = await db.tags.count()
  if (existingTags > 0) return

  const tags: Tag[] = [
    { id: uuid(), name: "полезно", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "вкусно", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "быстро", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "важно", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]
  await db.tags.bulkAdd(tags)
}

async function seedAccounts(): Promise<Account[]> {
  // Check if accounts already exist
  const existingAccounts = await db.accounts.count()
  if (existingAccounts > 0) {
    return db.accounts.toArray()
  }

  const accounts: Account[] = [
    { id: uuid(), name: "Наличные", type: "cash", balance: 15000, currency: "RUB", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Сбербанк", type: "card", balance: 125000, currency: "RUB", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Тинькофф", type: "card", balance: 45000, currency: "RUB", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Вклад 8%", type: "deposit", balance: 500000, currency: "RUB", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), name: "Брокерский счёт", type: "investment", balance: 250000, currency: "RUB", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]
  await db.accounts.bulkAdd(accounts)
  return accounts
}

async function seedLogs(categories: Category[], accounts: Account[]) {
  const logs: Log[] = []
  const foodCats = categories.filter(c => c.type === LogType.FOOD)
  const workoutCats = categories.filter(c => c.type === LogType.WORKOUT)
  const financeCats = categories.filter(c => c.type === LogType.FINANCE)

  const meals = [
    { title: "Овсянка с фруктами", calories: 350, protein: 12, fat: 8, carbs: 55 },
    { title: "Яичница с тостом", calories: 420, protein: 18, fat: 25, carbs: 30 },
    { title: "Сэндвич с курицей", calories: 480, protein: 28, fat: 18, carbs: 45 },
    { title: "Салат Цезарь", calories: 380, protein: 22, fat: 20, carbs: 15 },
    { title: "Борщ с мясом", calories: 450, protein: 25, fat: 15, carbs: 40 },
    { title: "Паста Карбонара", calories: 550, protein: 20, fat: 28, carbs: 50 },
    { title: "Стейк с овощами", calories: 600, protein: 40, fat: 35, carbs: 20 },
    { title: "Суши набор", calories: 500, protein: 25, fat: 12, carbs: 60 },
  ]

  // Food logs for last 30 days
  for (let i = 0; i < 40; i++) {
    const meal = meals[Math.floor(Math.random() * meals.length)]
    const cat = foodCats[Math.floor(Math.random() * foodCats.length)]
    logs.push({
      id: uuid(),
      type: LogType.FOOD,
      date: randomDate(30),
      title: meal.title,
      category_id: cat.id,
      value: meal.calories,
      metadata: { calories: meal.calories, protein: meal.protein, fat: meal.fat, carbs: meal.carbs },
      tags: ["полезно", "вкусно"].slice(0, Math.floor(Math.random() * 2) + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // Workout logs
  const workouts = [
    { title: "Приседания", duration: 45, intensity: "high" as const },
    { title: "Бег на дорожке", duration: 30, intensity: "medium" as const },
    { title: "Жим лежа", duration: 40, intensity: "high" as const },
    { title: "Йога", duration: 60, intensity: "low" as const },
    { title: "Велосипед", duration: 50, intensity: "medium" as const },
  ]

  for (let i = 0; i < 15; i++) {
    const w = workouts[Math.floor(Math.random() * workouts.length)]
    const cat = workoutCats[Math.floor(Math.random() * workoutCats.length)]
    logs.push({
      id: uuid(),
      type: LogType.WORKOUT,
      date: randomDate(30),
      title: w.title,
      category_id: cat.id,
      metadata: { duration: w.duration, intensity: w.intensity },
      tags: ["важно"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // Finance logs with accounts
  const cashAccount = accounts.find(a => a.name === "Наличные")!
  const sberAccount = accounts.find(a => a.name === "Сбербанк")!
  const tinkoffAccount = accounts.find(a => a.name === "Тинькофф")!
  const depositAccount = accounts.find(a => a.name === "Вклад 8%")!
  const investmentAccount = accounts.find(a => a.name === "Брокерский счёт")!

  // Income transactions
  const incomeTransactions = [
    { title: "Зарплата", value: 80000, account: sberAccount, category: "Зарплата", subcategory: "Основная" },
    { title: "Премия", value: 15000, account: sberAccount, category: "Зарплата", subcategory: "Премия" },
    { title: "Фриланс проект", value: 25000, account: tinkoffAccount, category: "Фриланс", subcategory: "Разработка" },
    { title: "Дивиденды", value: 5000, account: investmentAccount, category: "Инвестиции", subcategory: "Дивиденды" },
  ]

  for (const t of incomeTransactions) {
    const cat = financeCats.find(c => c.name === t.category) || financeCats[0]
    logs.push({
      id: uuid(),
      type: LogType.FINANCE,
      date: randomDate(30),
      title: t.title,
      category_id: cat.id,
      value: t.value,
      metadata: { 
        finance_type: FinanceType.INCOME, 
        account_id: t.account.id,
        category: t.category,
        subcategory: t.subcategory,
      },
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // Expense transactions
  const expenseTransactions = [
    { title: "Продукты → Молочные", value: 2500, account: sberAccount, category: "Продукты", subcategory: "Молочные" },
    { title: "Продукты → Мясо", value: 3500, account: sberAccount, category: "Продукты", subcategory: "Мясо" },
    { title: "Транспорт → Такси", value: 800, account: tinkoffAccount, category: "Транспорт", subcategory: "Такси" },
    { title: "Транспорт → Метро", value: 2000, account: cashAccount, category: "Транспорт", subcategory: "Общественный" },
    { title: "Развлечения → Кафе", value: 1500, account: tinkoffAccount, category: "Развлечения", subcategory: "Кафе/Рестораны" },
    { title: "Здоровье → Аптека", value: 1200, account: sberAccount, category: "Здоровье", subcategory: "Аптека" },
    { title: "Связь → Мобильная", value: 500, account: tinkoffAccount, category: "Связь", subcategory: "Мобильная" },
    { title: "Образование → Курсы", value: 5000, account: sberAccount, category: "Образование", subcategory: "Курсы" },
  ]

  for (let i = 0; i < 30; i++) {
    const t = expenseTransactions[Math.floor(Math.random() * expenseTransactions.length)]
    const cat = financeCats.find(c => c.name === t.category) || financeCats[0]
    logs.push({
      id: uuid(),
      type: LogType.FINANCE,
      date: randomDate(30),
      title: t.title,
      category_id: cat.id,
      value: t.value,
      metadata: { 
        finance_type: FinanceType.EXPENSE, 
        account_id: t.account.id,
        category: t.category,
        subcategory: t.subcategory,
      },
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // Transfer transactions
  const transferTransactions = [
    { title: "Перевод на вклад", value: 20000, from: sberAccount, to: depositAccount },
    { title: "Снятие наличных", value: 10000, from: sberAccount, to: cashAccount },
    { title: "Пополнение Тинькофф", value: 5000, from: sberAccount, to: tinkoffAccount },
    { title: "Инвестиции", value: 15000, from: sberAccount, to: investmentAccount },
  ]

  for (const t of transferTransactions) {
    logs.push({
      id: uuid(),
      type: LogType.FINANCE,
      date: randomDate(30),
      title: t.title,
      value: t.value,
      metadata: { 
        finance_type: FinanceType.TRANSFER, 
        account_id: t.from.id,
        target_account_id: t.to.id,
      },
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  await db.logs.bulkAdd(logs)
  return logs
}

async function seedItems() {
  const items: Item[] = [
    { id: uuid(), type: ItemType.VITAMIN, name: "Витамин D3", category: "Витамины", description: "Для иммунитета", dosage: "1 капсула в день", form: "Капсулы", benefits: "Укрепляет кости, иммунитет", tags: ["важно"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.VITAMIN, name: "Витамин B12", category: "Витамины", description: "Для энергии", dosage: "1 таблетка в день", form: "Таблетки", benefits: "Энергия, нервная система", tags: ["полезно"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.VITAMIN, name: "Омега-3", category: "Витамины", description: "Для сердца и мозга", dosage: "2 капсулы в день", form: "Капсулы", benefits: "Сердце, мозг, суставы", tags: ["важно"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.MEDICINE, name: "Ибупрофен", category: "Обезболивающие", description: "От боли и температуры", dosage: "1-2 таблетки при необходимости", form: "Таблетки 400мг", contraindications: "Язва желудка", tags: ["проверено"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.MEDICINE, name: "Аспирин", category: "Обезболивающие", description: "От боли", dosage: "1 таблетка при необходимости", form: "Таблетки 500мг", contraindications: "Аллергия", tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.HERB, name: "Ромашка", category: "Травы", description: "Успокоительное", usage: "Заваривать как чай", benefits: "Успокаивает, улучшает сон", form: "Сухие цветки", tags: ["полезно"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.HERB, name: "Мята", category: "Травы", description: "Для пищеварения", usage: "Заваривать как чай", benefits: "Улучшает пищеварение", form: "Сухие листья", tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.COSMETIC, name: "Увлажняющий крем", category: "Уход за лицом", description: "Для сухой кожи", usage: "Утром и вечером", form: "Крем 50мл", tags: ["проверено"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.COSMETIC, name: "Шампунь", category: "Уход за волосами", description: "Для всех типов волос", usage: "2-3 раза в неделю", form: "Шампунь 250мл", tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.PRODUCT, name: "Молоко", category: "Молочные", description: "Коровье молоко 3.2%", form: "1 литр", tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.PRODUCT, name: "Хлеб", category: "Выпечка", description: "Бородинский хлеб", form: "Буханка", tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ItemType.PRODUCT, name: "Яйца", category: "Молочные", description: "Куриные яйца", form: "10 шт", tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]
  await db.items.bulkAdd(items)
  return items
}

async function seedContent() {
  const contents: Content[] = [
    { id: uuid(), type: ContentType.BOOK, title: "Атомные привычки", description: "Как приобрести полезные привычки", rating: 5, body: "Отличная книга о формировании привычек. Автор рассказывает о маленьких изменениях, которые приводят к большим результатам.", metadata: { author: "Джеймс Клир", year: 2018, pages: 320, status: BookStatus.DONE }, tags: ["полезно", "важно"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ContentType.BOOK, title: "Психология денег", description: "Отношения с деньгами", rating: 4, body: "Интересные истории о психологии финансовых решений.", metadata: { author: "Морган Хоузел", year: 2020, pages: 256, status: BookStatus.READING }, tags: ["полезно"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ContentType.BOOK, title: "Думай медленно... решай быстро", description: "О принятии решений", rating: 5, body: "", metadata: { author: "Даниэль Канеман", year: 2011, pages: 656, status: BookStatus.PLANNED }, tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]
  
  const recipes: RecipeContentExtended[] = [
    { id: uuid(), type: ContentType.RECIPE, recipe_type: RecipeType.FOOD, title: "Борщ украинский", description: "Классический рецепт", rating: 5, body: "1. Сварить бульон\n2. Добавить свеклу\n3. Добавить капусту\n4. Варить до готовности\n5. Подавать со сметаной", cook_time_min: 120, total_time_min: 120, calories: 250, protein: 15, fat: 10, carbs: 25, tags: ["вкусно"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ContentType.RECIPE, recipe_type: RecipeType.FOOD, title: "Паста Карбонара", description: "Итальянская классика", rating: 5, body: "1. Отварить пасту\n2. Обжарить бекон\n3. Смешать яйца с сыром\n4. Соединить всё", cook_time_min: 30, total_time_min: 30, calories: 450, protein: 18, fat: 20, carbs: 45, tags: ["вкусно", "быстро"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuid(), type: ContentType.RECIPE, recipe_type: RecipeType.FOOD, title: "Овсянка с ягодами", description: "Полезный завтрак", rating: 4, body: "1. Сварить овсянку\n2. Добавить ягоды\n3. Добавить мёд", cook_time_min: 15, total_time_min: 15, calories: 300, protein: 10, fat: 5, carbs: 50, tags: ["полезно", "быстро"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]
  
  await db.content.bulkAdd([...contents, ...recipes] as Content[])
  return [...contents, ...recipes] as Content[]
}

export async function cleanupDuplicateCategories() {
  const categories = await db.categories.toArray()
  
  // Group by name + type
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
  
  // Update logs to use the first category for each group
  const logs = await db.logs.toArray()
  const updates: Promise<unknown>[] = []

  for (const dup of duplicates) {
    const key = `${dup.type}-${dup.name}`
    const original = seen.get(key)
    if (!original) continue

    // Update logs that reference the duplicate
    const logsToUpdate = logs.filter(log => log.category_id === dup.id)
    for (const log of logsToUpdate) {
      updates.push(
        db.logs.update(log.id, { category_id: original.id })
      )
    }

    // Delete the duplicate
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
  ])
  console.log("Database cleared!")
  return true
}

export async function seedDatabase() {
  // Check if already seeded
  const existingLogs = await db.logs.count()
  if (existingLogs > 0) {
    console.log("Database already seeded")
    return false
  }

  console.log("Seeding database...")
  
  // Use existing categories or create new ones
  const categories = await getOrCreateCategories()
  await seedTags()
  const accounts = await seedAccounts()
  await seedLogs(categories, accounts)
  await seedItems()
  await seedContent()

  console.log("Database seeded successfully!")
  return true
}

export async function reseedDatabase() {
  await clearDatabase()
  return await seedDatabase()
}
