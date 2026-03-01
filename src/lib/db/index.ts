import Dexie, { type EntityTable } from "dexie"
import type {
  Log,
  Item,
  Content,
  Category,
  Tag,
  Unit,
  Account,
  Exercise,
  SyncQueueItem,
  RecipeIngredient,
  RecipeIngredientItem,
  RecipeStep,
  // Books
  Book,
  UserBook,
  Author,
  BookAuthor,
  Series,
  Genre,
  BookGenre,
  BookQuote,
  BookReview,
  // New types
  Goal,
  Habit,
  HabitLog,
  Streak,
  SleepLog,
  WaterLog,
  MoodLog,
  BodyMeasurement,
  Reminder,
  ReminderLog,
  Template,
  RecurringTransaction,
  EntityTranslation,
} from "@/types"
import { LogType, ItemType, ContentType } from "@/types"

// ============================================
// Database Schema
// ============================================

class LifeOSDatabase extends Dexie {
  logs!: EntityTable<Log, "id">
  items!: EntityTable<Item, "id">
  content!: EntityTable<Content, "id">
  categories!: EntityTable<Category, "id">
  tags!: EntityTable<Tag, "id">
  units!: EntityTable<Unit, "id">
  accounts!: EntityTable<Account, "id">
  exercises!: EntityTable<Exercise, "id">
  syncQueue!: EntityTable<SyncQueueItem, "id">

  // Recipe tables
  recipeIngredients!: EntityTable<RecipeIngredient, "id">
  recipeIngredientItems!: EntityTable<RecipeIngredientItem, "id">
  recipeSteps!: EntityTable<RecipeStep, "id">

  // Books tables
  books!: EntityTable<Book, "id">
  userBooks!: EntityTable<UserBook, "id">
  authors!: EntityTable<Author, "id">
  bookAuthors!: EntityTable<BookAuthor, "id">
  series!: EntityTable<Series, "id">
  genres!: EntityTable<Genre, "id">
  bookGenres!: EntityTable<BookGenre, "id">
  bookQuotes!: EntityTable<BookQuote, "id">
  bookReviews!: EntityTable<BookReview, "id">

  // New tables - goals and habits
  goals!: EntityTable<Goal, "id">
  habits!: EntityTable<Habit, "id">
  habitLogs!: EntityTable<HabitLog, "id">
  streaks!: EntityTable<Streak, "id">

  // New tables - trackers
  sleepLogs!: EntityTable<SleepLog, "id">
  waterLogs!: EntityTable<WaterLog, "id">
  moodLogs!: EntityTable<MoodLog, "id">
  bodyMeasurements!: EntityTable<BodyMeasurement, "id">

  // New tables - reminders and templates
  reminders!: EntityTable<Reminder, "id">
  reminderLogs!: EntityTable<ReminderLog, "id">
  templates!: EntityTable<Template, "id">

  // Recurring transactions
  recurringTransactions!: EntityTable<RecurringTransaction, "id">

  // Entity localization
  entityTranslations!: EntityTable<EntityTranslation, "id">

  constructor() {
    super("LifeOSDB")

    this.version(7).stores({
      // Main tables
      logs: "id, type, date, title, category_id, created_at, updated_at",
      items: "id, type, name, category, created_at, updated_at",
      content: "id, type, title, created_at, updated_at",

      // Reference data
      categories: "id, type, name",
      tags: "id, name",
      units: "id, type",
      accounts: "id, type",
      exercises: "id, category",

      // Recipes
      recipeIngredients: "id, name, category, subcategory",
      recipeIngredientItems: "id, recipe_id, ingredient_id, order",
      recipeSteps: "id, recipe_id, order",

      // Books
      books:
        "id, title, isbn13, published_year, language, format, series_id, created_at, updated_at",
      userBooks: "id, book_id, status, rating, started_at, finished_at, created_at, updated_at",
      authors: "id, name, created_at, updated_at",
      bookAuthors: "id, book_id, author_id, role, order",
      series: "id, name, created_at, updated_at",
      genres: "id, name, parent_id, created_at, updated_at",
      bookGenres: "id, book_id, genre_id",
      bookQuotes: "id, user_book_id, created_at, updated_at",
      bookReviews: "id, userBook_id, created_at, updated_at",

      // Goals and habits
      goals: "id, type, period, is_active, start_date, end_date",
      habits: "id, name, frequency, is_active",
      habitLogs: "id, habit_id, date, completed",
      streaks: "id, habit_id, current_streak, longest_streak",

      // Trackers
      sleepLogs: "id, date, quality, created_at, updated_at",
      waterLogs: "id, date, amount_ml, type",
      moodLogs: "id, date, mood, energy, stress",
      bodyMeasurements: "id, date, type, value",

      // Reminders and templates
      reminders: "id, type, time, days, is_active, related_id, priority",
      reminderLogs: "id, reminder_id, triggered_at, action",
      templates: "id, name, type, is_favorite",

      // Recurring transactions
      recurringTransactions: "id, type, frequency, is_active, next_due, account_id",

      // Sync
      syncQueue: "id, table_name, record_id, action, synced",
    })

    this.version(8).stores({
      // Entity localization
      entityTranslations: "id, entity_type, entity_id, locale",
    })

    this.version(9).stores({
      // Add abbreviation field for localized abbreviations
      entityTranslations: "id, entity_type, entity_id, locale, abbreviation",
    })

    this.version(10)
      .stores({
        // Update accounts to add type index
        accounts: "id, type, name",
      })
      .upgrade(async (tx) => {
        // Update existing accounts by adding type based on name
        const accounts = await tx.table("accounts").toArray()
        for (const acc of accounts) {
          if (!acc.type) {
            // Determine type by name
            let type = "card"
            if (acc.name === "cash") type = "cash"
            else if (acc.name === "card") type = "card"
            else if (acc.name === "bank") type = "bank"
            else if (acc.name === "Вклад" || acc.name === "deposit") type = "deposit"
            else if (
              acc.name === "Брокерский счёт" ||
              acc.name === "ИИС" ||
              acc.name === "investment"
            )
              type = "investment"
            else if (acc.name === "Крипто-кошелёк" || acc.name === "crypto") type = "crypto"

            await tx.table("accounts").update(acc.id, { type })
          }
        }
      })

    this.version(11)
      .stores({
        // Update for correct emoji display in categories
        items: "id, type, name, category",
      })
      .upgrade(async (tx) => {
        // Clear emoji cache - force update
        const items = await tx.table("items").toArray()
        if (process.env.NODE_ENV === "development") {
          console.log(`[DB v11] Updated ${items.length} items`)
        }
      })

    this.version(13)
      .stores({
        // Add name index for accounts
        accounts: "id, type, name",
      })
      .upgrade(async (tx) => {
        try {
          // Remove duplicate accounts, keeping only the first one by name
          const accounts = await tx.table("accounts").toArray()
          const seen = new Map<string, string>() // name -> id to keep
          const idsToDelete: string[] = []

          for (const acc of accounts) {
            if (seen.has(acc.name)) {
              idsToDelete.push(acc.id)
            } else {
              seen.set(acc.name, acc.id)
            }
          }

          // Delete duplicates
          for (const id of idsToDelete) {
            await tx.table("accounts").delete(id)
          }

          // Log in development only
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[DB v13] Removed ${idsToDelete.length} duplicate accounts, kept ${seen.size}`
            )
          }
        } catch {
          // Continue anyway - duplicates will be handled by seedAccounts
        }
      })
  }
}

// ============================================
// Database Instance
// ============================================

export const db = new LifeOSDatabase()

// Handle database version change events
db.on("versionchange", (event) => {
  // Close the database if another connection wants to upgrade
  if (event.newVersion !== null) {
    db.close()
  }
})

// ============================================
// Helper Functions
// ============================================

export function generateId(): string {
  return crypto.randomUUID()
}

export function getTimestamp(): string {
  return new Date().toISOString()
}

export function createBaseEntity(): { id: string; created_at: string; updated_at: string } {
  const now = getTimestamp()
  return {
    id: generateId(),
    created_at: now,
    updated_at: now,
  }
}

// ============================================
// Generic CRUD Operations
// ============================================

export async function createEntity<T extends { id: string; updated_at: string }>(
  table: EntityTable<T, "id">,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): Promise<string> {
  const entity = {
    ...data,
    ...createBaseEntity(),
  } as unknown as T

  await table.add(entity)
  return entity.id
}

export async function updateEntity<T extends { id: string; updated_at: string }>(
  table: EntityTable<T, "id">,
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (table as any).update(id, {
    ...data,
    updated_at: getTimestamp(),
  })
}

export async function deleteEntity<T extends { id: string }>(
  table: EntityTable<T, "id">,
  id: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (table as any).delete(id)
}

export async function getEntityById<T extends { id: string }>(
  table: EntityTable<T, "id">,
  id: string
): Promise<T | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (table as any).get(id)
}

export async function getAllEntities<T extends { id: string }>(
  table: EntityTable<T, "id">
): Promise<T[]> {
  return await table.toArray()
}

// ============================================
// Localization Helpers
// ============================================

// Import static entity translations
import enEntities from "@/messages/en/entities.json"
import ruEntities from "@/messages/ru/entities.json"

const entityTranslations: Record<string, typeof enEntities> = {
  en: enEntities,
  ru: ruEntities,
}

/**
 * Get entity translation from static files
 * @param entityType - entity type (categories, units, accounts, tags, itemCategories, bookGenres, recipeIngredients, financeSuppliers)
 * @param entityKey - entity key (e.g., "food", "salary")
 * @param locale - language (en, ru)
 * @param subKey - subcategory (e.g., "finance" for categories or "vegetable" for ingredients)
 */
export function getStaticEntityTranslation(
  entityType:
    | "categories"
    | "units"
    | "accounts"
    | "tags"
    | "itemCategories"
    | "bookGenres"
    | "recipeIngredients"
    | "financeSuppliers",
  entityKey: string,
  locale: string,
  subKey?: string
): string {
  const translations = entityTranslations[locale] || entityTranslations["en"]

  if (!translations) return entityKey

  const entityData = (translations as Record<string, Record<string, unknown>>)[entityType]
  if (!entityData) return entityKey

  // For categories use subcategory
  if (entityType === "categories" && subKey) {
    const subData = entityData[subKey] as Record<string, string> | undefined
    if (subData && subData[entityKey]) {
      return subData[entityKey]
    }
  }

  // For recipeIngredients use subcategory (vegetable, meat, dairy, etc.)
  if (entityType === "recipeIngredients" && subKey) {
    const subData = entityData[subKey] as Record<string, string> | undefined
    if (subData && subData[entityKey]) {
      return subData[entityKey]
    }
  }

  // For financeSuppliers return list of suppliers by category
  if (entityType === "financeSuppliers" && subKey) {
    const subData = entityData[subKey] as string[] | undefined
    if (subData) {
      return subData.join(", ")
    }
  }

  // For units, accounts, tags, itemCategories, bookGenres - direct translation by key
  const directTranslation = (entityData as Record<string, string>)[entityKey]
  return directTranslation || entityKey
}

/**
 * Get all translations for entity type
 */
export function getEntityTranslationsByType(
  entityType:
    | "categories"
    | "units"
    | "accounts"
    | "tags"
    | "itemCategories"
    | "bookGenres"
    | "recipeIngredients"
    | "financeSuppliers",
  locale: string
): Record<string, string> | Record<string, Record<string, string>> | Record<string, string[]> {
  const translations = entityTranslations[locale] || entityTranslations["en"]

  if (!translations) return {}

  return ((translations as Record<string, Record<string, unknown>>)[entityType] || {}) as
    | Record<string, string>
    | Record<string, Record<string, string>>
    | Record<string, string[]>
}

/**
 * Get localized entity name
 * @param entityType - entity type (category, unit, account, tag, itemCategory, bookGenre, recipeIngredient, financeSupplier)
 * @param entityId - entity ID
 * @param locale - language (en, ru)
 * @param defaultName - default name (from main table)
 * @param categoryType - category type for categories (food, workout, finance) or subcategory for ingredients (vegetable, meat, dairy) or suppliers (Products, Transport)
 */
export async function getLocalizedEntityName(
  entityType:
    | "category"
    | "unit"
    | "account"
    | "tag"
    | "itemCategory"
    | "bookGenre"
    | "recipeIngredient"
    | "financeSupplier",
  entityId: string,
  locale: string,
  defaultName: string,
  categoryType?: string
): Promise<string> {
  if (!locale || !["en", "ru"].includes(locale)) {
    return defaultName
  }

  // First try to find translation by ID in database (for category, unit, account)
  if (["category", "unit", "account"].includes(entityType)) {
    const translation = await db.entityTranslations
      .where({
        entity_type: entityType as "category" | "unit" | "account",
        entity_id: entityId,
        locale: locale as "en" | "ru",
      })
      .first()

    if (translation?.name) {
      return translation.name
    }
  }

  // If not in DB, try static translation by key
  let staticTranslation: string

  if (entityType === "category" && categoryType) {
    // For categories use subcategory (food, workout, finance)
    staticTranslation = getStaticEntityTranslation("categories", defaultName, locale, categoryType)
  } else if (entityType === "recipeIngredient" && categoryType) {
    // For recipe ingredients use subcategory (vegetable, meat, dairy, grains, spice, herb)
    staticTranslation = getStaticEntityTranslation(
      "recipeIngredients",
      defaultName,
      locale,
      categoryType
    )
  } else if (entityType === "financeSupplier" && categoryType) {
    // For suppliers use category (Products, Transport, etc.)
    staticTranslation = getStaticEntityTranslation(
      "financeSuppliers",
      defaultName,
      locale,
      categoryType
    )
  } else {
    // For units, accounts, tags, itemCategories, bookGenres - direct translation by key
    const staticEntityType =
      entityType === "category"
        ? "categories"
        : entityType === "unit"
          ? "units"
          : entityType === "account"
            ? "accounts"
            : entityType === "tag"
              ? "tags"
              : entityType === "itemCategory"
                ? "itemCategories"
                : entityType === "bookGenre"
                  ? "bookGenres"
                  : entityType === "financeSupplier"
                    ? "financeSuppliers"
                    : "recipeIngredients"

    staticTranslation = getStaticEntityTranslation(staticEntityType, defaultName, locale)
  }

  return staticTranslation !== defaultName ? staticTranslation : defaultName
}

/**
 * Get localized abbreviation for entity (for units)
 * @param entityId - entity ID
 * @param locale - locale
 * @param defaultAbbreviation - default abbreviation
 */
export async function getLocalizedAbbreviation(
  entityId: string,
  locale: string,
  defaultAbbreviation: string
): Promise<string> {
  if (!locale || !["en", "ru"].includes(locale)) {
    return defaultAbbreviation
  }

  // First try to find translation in database
  const translation = await db.entityTranslations
    .where({
      entity_type: "unit",
      entity_id: entityId,
      locale: locale as "en" | "ru",
    })
    .first()

  if (translation?.abbreviation) {
    return translation.abbreviation
  }

  // If not in DB, try static translation
  const translations = entityTranslations[locale]?.unitsAbbreviations as
    | Record<string, string>
    | undefined
  if (translations && translations[entityId]) {
    return translations[entityId]
  }

  return defaultAbbreviation
}

/**
 * Save entity name translation
 */
export async function saveEntityTranslation(
  entityType:
    | "category"
    | "unit"
    | "account"
    | "tag"
    | "itemCategory"
    | "bookGenre"
    | "recipeIngredient"
    | "financeSupplier",
  entityId: string,
  locale: "en" | "ru",
  name: string,
  abbreviation?: string
): Promise<void> {
  const existing = await db.entityTranslations
    .where({
      entity_type: entityType,
      entity_id: entityId,
      locale,
    })
    .first()

  if (existing) {
    await db.entityTranslations.update(existing.id, {
      name,
      abbreviation: abbreviation ?? existing.abbreviation,
      updated_at: getTimestamp(),
    })
  } else {
    await db.entityTranslations.add({
      id: generateId(),
      entity_type: entityType,
      entity_id: entityId,
      locale,
      name,
      abbreviation,
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    })
  }
}

/**
 * Delete entity translation
 */
export async function deleteEntityTranslation(
  entityType:
    | "category"
    | "unit"
    | "account"
    | "tag"
    | "itemCategory"
    | "bookGenre"
    | "recipeIngredient"
    | "financeSupplier",
  entityId: string,
  locale: "en" | "ru"
): Promise<void> {
  const translation = await db.entityTranslations
    .where({
      entity_type: entityType,
      entity_id: entityId,
      locale,
    })
    .first()

  if (translation) {
    await db.entityTranslations.delete(translation.id)
  }
}

/**
 * Get all translations for entity
 */
export async function getEntityTranslations(
  entityType:
    | "category"
    | "unit"
    | "account"
    | "tag"
    | "itemCategory"
    | "bookGenre"
    | "recipeIngredient"
    | "financeSupplier",
  entityId: string
): Promise<{ en?: string; ru?: string }> {
  const translations = await db.entityTranslations
    .where({
      entity_type: entityType,
      entity_id: entityId,
    })
    .toArray()

  const result: { en?: string; ru?: string } = {}
  translations.forEach((t) => {
    result[t.locale] = t.name
  })

  return result
}

// ============================================
// Specific Queries
// ============================================

// Logs
export async function getLogsByType(type: string): Promise<Log[]> {
  return await db.logs.where("type").equals(type).toArray()
}

export async function getLogsByDateRange(
  type: string,
  startDate: string,
  endDate: string
): Promise<Log[]> {
  return await db.logs
    .where("type")
    .equals(type)
    .and((log) => log.date >= startDate && log.date <= endDate)
    .toArray()
}

// Items
export async function getItemsByType(type: string): Promise<Item[]> {
  return await db.items.where("type").equals(type).toArray()
}

// Content
export async function getContentByType(type: string): Promise<Content[]> {
  return await db.content.where("type").equals(type).toArray()
}

// Categories
export async function getCategoriesByType(type: string): Promise<Category[]> {
  return await db.categories.where("type").equals(type).toArray()
}

// Search
export async function searchLogs(query: string): Promise<Log[]> {
  const lowerQuery = query.toLowerCase()
  return await db.logs.filter((log) => log.title.toLowerCase().includes(lowerQuery)).toArray()
}

export async function searchItems(query: string): Promise<Item[]> {
  const lowerQuery = query.toLowerCase()
  return await db.items.filter((item) => item.name.toLowerCase().includes(lowerQuery)).toArray()
}

export async function searchContent(query: string): Promise<Content[]> {
  const lowerQuery = query.toLowerCase()
  return await db.content
    .filter((content) => content.title.toLowerCase().includes(lowerQuery))
    .toArray()
}

// ============================================
// Streak Helpers
// ============================================

export async function updateStreak(habitId: string, completed: boolean): Promise<void> {
  const today = new Date().toISOString().split("T")[0]

  const existingStreak = await db.streaks.where("habit_id").equals(habitId).first()

  if (!existingStreak) {
    // Create new streak
    await db.streaks.add({
      id: generateId(),
      habit_id: habitId,
      current_streak: completed ? 1 : 0,
      longest_streak: completed ? 1 : 0,
      last_completed_date: completed ? today : undefined,
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    })
    return
  }

  if (completed) {
    const lastDate = existingStreak.last_completed_date
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    let newCurrentStreak = 1
    if (lastDate === yesterday || lastDate === today) {
      newCurrentStreak = existingStreak.current_streak + (lastDate === today ? 0 : 1)
    }

    await db.streaks.update(existingStreak.id, {
      current_streak: newCurrentStreak,
      longest_streak: Math.max(existingStreak.longest_streak, newCurrentStreak),
      last_completed_date: today,
      updated_at: getTimestamp(),
    })
  } else {
    await db.streaks.update(existingStreak.id, {
      current_streak: 0,
      updated_at: getTimestamp(),
    })
  }
}

// ============================================
// Goal Progress Helpers
// ============================================

export async function updateGoalProgress(goalId: string, value: number): Promise<void> {
  const goal = await db.goals.get(goalId)
  if (!goal) return

  const newValue = (goal.current_value || 0) + value
  await db.goals.update(goalId, {
    current_value: newValue,
    updated_at: getTimestamp(),
  })
}

export async function getGoalProgress(goal: Goal): Promise<number> {
  if (!goal.current_value || !goal.target_value) return 0
  return Math.min(100, (goal.current_value / goal.target_value) * 100)
}

// ============================================
// Database Initialization
// ============================================

// Global lock to prevent concurrent initialization
let isInitializing = false
let initialized = false

export async function initializeDatabase(): Promise<void> {
  // Skip if already initialized or currently initializing
  if (initialized || isInitializing) {
    return
  }

  isInitializing = true

  try {
    const now = getTimestamp()

    // Base goals (with current_value for correct operation) - create if not exist
    const goalsCount = await db.goals.count()
    if (goalsCount === 0) {
      await db.goals.bulkAdd([
        {
          id: generateId(),
          type: "calories",
          name: "Calories per day",
          target_value: 2000,
          current_value: 0,
          period: "daily",
          start_date: now.split("T")[0],
          is_active: true,
          unit: "kcal",
          created_at: now,
          updated_at: now,
        },
        {
          id: generateId(),
          type: "water",
          name: "Water per day",
          target_value: 2000,
          current_value: 0,
          period: "daily",
          start_date: now.split("T")[0],
          is_active: true,
          unit: "ml",
          created_at: now,
          updated_at: now,
        },
        {
          id: generateId(),
          type: "workout",
          name: "Workouts per week",
          target_value: 3,
          current_value: 0,
          period: "weekly",
          start_date: now.split("T")[0],
          is_active: true,
          unit: "pcs",
          created_at: now,
          updated_at: now,
        },
        {
          id: generateId(),
          type: "sleep",
          name: "Sleep per day",
          target_value: 480,
          current_value: 0,
          period: "daily",
          start_date: now.split("T")[0],
          is_active: true,
          unit: "min",
          created_at: now,
          updated_at: now,
        },
      ])
    }

    initialized = true
  } catch (error) {
    console.error("Failed to initialize database:", error)
  } finally {
    isInitializing = false
  }
}
