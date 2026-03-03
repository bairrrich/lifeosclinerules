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
import { LogType, ItemType, ContentType, FinanceType } from "@/types"

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
      reminders:
        "id, type, title, message, time, days, date, is_active, related_id, related_type, priority, start_date, end_date, advance_minutes, repeat_type, repeat_interval, custom_unit, monthly_day, sound, vibration, persistent, last_triggered_at, last_completed_at, streak, longest_streak, total_completed, created_at, updated_at",
      reminderLogs:
        "id, reminder_id, triggered_at, scheduled_at, action, snooze_duration, notes, created_at, updated_at",
      templates: "id, name, type, is_favorite, created_at, updated_at",

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

    // ============================================
    // Version 14: Add Compound Indexes for Performance
    // ============================================
    this.version(14).stores({
      // Logs - add compound index for type + date range queries
      // Note: date must be indexed separately for compound index to work
      logs: "id, type, [type+date], date, title, category_id, created_at, updated_at",

      // Items - add compound index for type + category
      items: "id, type, [type+category], category, name, created_at, updated_at",

      // Content - add compound index for type + created_at, and fiber field for recipes
      content: "id, type, [type+created_at], created_at, title, updated_at, fiber",

      // Habit logs - critical for streak calculations
      habitLogs: "id, habit_id, [habit_id+date], date, completed",

      // Mood logs - add date+mood compound index
      moodLogs: "id, date, [date+mood], mood, energy, stress",

      // Water logs - add date+type compound index
      waterLogs: "id, date, [date+type], type, amount_ml",

      // Reminders - add type+is_active compound index for active queries
      reminders:
        "id, type, title, message, time, days, date, is_active, related_id, related_type, priority, start_date, end_date, advance_minutes, repeat_type, repeat_interval, custom_unit, monthly_day, sound, vibration, persistent, last_triggered_at, last_completed_at, streak, longest_streak, total_completed, created_at, updated_at",

      // Books - add compound indexes
      books:
        "id, title, [title+published_year], isbn13, published_year, language, format, series_id, created_at, updated_at",
      userBooks:
        "id, book_id, [book_id+status], status, rating, started_at, finished_at, created_at, updated_at",

      // Recipe - add compound indexes for ingredient lookups
      recipeIngredients: "id, name, [name+category], category, subcategory",
      recipeIngredientItems: "id, recipe_id, [recipe_id+order], ingredient_id, order",
      recipeSteps: "id, recipe_id, [recipe_id+order], order",

      // Categories - add compound index
      categories: "id, type, [type+name], name",

      // Entity translations - add compound index
      entityTranslations: "id, entity_type, entity_id, [entity_type+entity_id+locale], locale",
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

/**
 * Optimized date range query using compound index [type+date]
 * Much faster than using .and() filter
 */
export async function getLogsByDateRange(
  type: string,
  startDate: string,
  endDate: string
): Promise<Log[]> {
  try {
    // Use compound index [type+date] - O(log n) instead of O(n)
    return await db.logs
      .where(["type", "date"])
      .between([type, startDate], [type, endDate], true, true)
      .toArray()
  } catch {
    // Fallback for older data without compound index
    return await db.logs
      .where("type")
      .equals(type)
      .and((log) => log.date >= startDate && log.date <= endDate)
      .toArray()
  }
}

/**
 * Get logs for a specific date using compound index
 */
export async function getLogsByDate(type: string, date: string): Promise<Log[]> {
  try {
    return await db.logs.where(["type", "date"]).equals([type, date]).toArray()
  } catch {
    return await db.logs
      .where("type")
      .equals(type)
      .and((log) => log.date === date)
      .toArray()
  }
}

/**
 * Get logs for today using compound index
 */
export async function getLogsByDateToday(type: string): Promise<Log[]> {
  const today = new Date().toISOString().split("T")[0]
  return getLogsByDate(type, today)
}

// ============================================
// Pagination Helpers
// ============================================

export interface PaginationOptions {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Get paginated logs by type
 */
export async function getLogsPaginated(
  type: string,
  options: PaginationOptions
): Promise<PaginatedResult<Log>> {
  const { page = 1, pageSize = 20, sortBy = "date", sortOrder = "desc" } = options

  const collection = db.logs.where("type").equals(type)
  const total = await collection.count()

  const data = await collection.toArray().then((items) => {
    // Sort in memory
    items.sort((a, b) => {
      const aVal = (a as any)[sortBy] || ""
      const bVal = (b as any)[sortBy] || ""
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortOrder === "desc" ? -cmp : cmp
    })
    // Paginate
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  })

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get paginated items by type
 */
export async function getItemsPaginated(
  type: string,
  options: PaginationOptions
): Promise<PaginatedResult<Item>> {
  const { page = 1, pageSize = 20, sortBy = "name", sortOrder = "asc" } = options

  const collection = db.items.where("type").equals(type)
  const total = await collection.count()

  const data = await collection.toArray().then((items) => {
    items.sort((a, b) => {
      const aVal = (a as any)[sortBy] || ""
      const bVal = (b as any)[sortBy] || ""
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortOrder === "desc" ? -cmp : cmp
    })
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  })

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get paginated content by type
 */
export async function getContentPaginated(
  type: string,
  options: PaginationOptions
): Promise<PaginatedResult<Content>> {
  const { page = 1, pageSize = 20, sortBy = "title", sortOrder = "asc" } = options

  const collection = db.content.where("type").equals(type)
  const total = await collection.count()

  const data = await collection.toArray().then((items) => {
    items.sort((a, b) => {
      const aVal = (a as any)[sortBy] || ""
      const bVal = (b as any)[sortBy] || ""
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortOrder === "desc" ? -cmp : cmp
    })
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  })

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
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

// ============================================
// Search - Optimized with Indexes
// ============================================

/**
 * Optimized search for logs using indexed queries
 * Uses title index for prefix matching, then falls back to filter for partial matches
 */
export async function searchLogs(query: string, limit = 50): Promise<Log[]> {
  if (!query || query.trim().length === 0) {
    return []
  }

  const trimmedQuery = query.trim()
  const lowerQuery = trimmedQuery.toLowerCase()

  try {
    // First try: exact prefix match using index (fastest)
    const prefixMatches = await db.logs
      .where("title")
      .startsWithIgnoreCase(trimmedQuery)
      .limit(limit)
      .toArray()

    if (prefixMatches.length >= limit) {
      return prefixMatches
    }

    // Second: get remaining slots
    const remaining = limit - prefixMatches.length
    const prefixIds = new Set(prefixMatches.map((l) => l.id))

    // Third: partial match with filter (slower but comprehensive)
    const partialMatches = await db.logs
      .filter((log) => !prefixIds.has(log.id) && log.title.toLowerCase().includes(lowerQuery))
      .limit(remaining)
      .toArray()

    return [...prefixMatches, ...partialMatches]
  } catch {
    // Fallback to filter if index not available
    return await db.logs
      .filter((log) => log.title.toLowerCase().includes(lowerQuery))
      .limit(limit)
      .toArray()
  }
}

/**
 * Optimized search for items using indexed queries
 */
export async function searchItems(query: string, limit = 50): Promise<Item[]> {
  if (!query || query.trim().length === 0) {
    return []
  }

  const trimmedQuery = query.trim()
  const lowerQuery = trimmedQuery.toLowerCase()

  try {
    // First try: exact prefix match using index
    const prefixMatches = await db.items
      .where("name")
      .startsWithIgnoreCase(trimmedQuery)
      .limit(limit)
      .toArray()

    if (prefixMatches.length >= limit) {
      return prefixMatches
    }

    const remaining = limit - prefixMatches.length
    const prefixIds = new Set(prefixMatches.map((i) => i.id))

    // Second: partial match
    const partialMatches = await db.items
      .filter((item) => !prefixIds.has(item.id) && item.name.toLowerCase().includes(lowerQuery))
      .limit(remaining)
      .toArray()

    return [...prefixMatches, ...partialMatches]
  } catch {
    return await db.items
      .filter((item) => item.name.toLowerCase().includes(lowerQuery))
      .limit(limit)
      .toArray()
  }
}

/**
 * Optimized search for content using indexed queries
 */
export async function searchContent(query: string, limit = 50): Promise<Content[]> {
  if (!query || query.trim().length === 0) {
    return []
  }

  const trimmedQuery = query.trim()
  const lowerQuery = trimmedQuery.toLowerCase()

  try {
    const prefixMatches = await db.content
      .where("title")
      .startsWithIgnoreCase(trimmedQuery)
      .limit(limit)
      .toArray()

    if (prefixMatches.length >= limit) {
      return prefixMatches
    }

    const remaining = limit - prefixMatches.length
    const prefixIds = new Set(prefixMatches.map((c) => c.id))

    const partialMatches = await db.content
      .filter(
        (content) => !prefixIds.has(content.id) && content.title.toLowerCase().includes(lowerQuery)
      )
      .limit(remaining)
      .toArray()

    return [...prefixMatches, ...partialMatches]
  } catch {
    return await db.content
      .filter((content) => content.title.toLowerCase().includes(lowerQuery))
      .limit(limit)
      .toArray()
  }
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

    // Seed default currency units if empty
    const unitsCount = await db.units.count()
    if (unitsCount === 0) {
      await db.units.bulkAdd([
        {
          id: "USD",
          name: "US Dollar",
          abbreviation: "$",
          type: "money" as const,
          created_at: now,
          updated_at: now,
        },
        {
          id: "EUR",
          name: "Euro",
          abbreviation: "€",
          type: "money" as const,
          created_at: now,
          updated_at: now,
        },
        {
          id: "RUB",
          name: "Russian Ruble",
          abbreviation: "₽",
          type: "money" as const,
          created_at: now,
          updated_at: now,
        },
        {
          id: "kg",
          name: "Kilogram",
          abbreviation: "kg",
          type: "weight" as const,
          created_at: now,
          updated_at: now,
        },
        {
          id: "g",
          name: "Gram",
          abbreviation: "g",
          type: "weight" as const,
          created_at: now,
          updated_at: now,
        },
        {
          id: "ml",
          name: "Milliliter",
          abbreviation: "ml",
          type: "volume" as const,
          created_at: now,
          updated_at: now,
        },
        {
          id: "l",
          name: "Liter",
          abbreviation: "l",
          type: "volume" as const,
          created_at: now,
          updated_at: now,
        },
        {
          id: "pcs",
          name: "Pieces",
          abbreviation: "pcs",
          type: "count" as const,
          created_at: now,
          updated_at: now,
        },
      ])
    }

    // Seed default finance categories if empty
    const categoriesCount = await db.categories.count()
    if (categoriesCount === 0) {
      await db.categories.bulkAdd([
        // Income categories
        {
          id: "salary",
          name: "Salary",
          type: LogType.FINANCE,
          finance_type: FinanceType.INCOME,
          icon: "💵",
          created_at: now,
          updated_at: now,
        },
        {
          id: "freelance",
          name: "Freelance",
          type: LogType.FINANCE,
          finance_type: FinanceType.INCOME,
          icon: "💻",
          created_at: now,
          updated_at: now,
        },
        {
          id: "investments",
          name: "Investments",
          type: LogType.FINANCE,
          finance_type: FinanceType.INCOME,
          icon: "📈",
          created_at: now,
          updated_at: now,
        },
        // Expense categories
        {
          id: "food",
          name: "Food",
          type: LogType.FINANCE,
          finance_type: FinanceType.EXPENSE,
          icon: "🍔",
          created_at: now,
          updated_at: now,
        },
        {
          id: "transport",
          name: "Transport",
          type: LogType.FINANCE,
          finance_type: FinanceType.EXPENSE,
          icon: "🚗",
          created_at: now,
          updated_at: now,
        },
        {
          id: "entertainment",
          name: "Entertainment",
          type: LogType.FINANCE,
          finance_type: FinanceType.EXPENSE,
          icon: "🎬",
          created_at: now,
          updated_at: now,
        },
        {
          id: "health",
          name: "Health",
          type: LogType.FINANCE,
          finance_type: FinanceType.EXPENSE,
          icon: "💊",
          created_at: now,
          updated_at: now,
        },
        {
          id: "shopping",
          name: "Shopping",
          type: LogType.FINANCE,
          finance_type: FinanceType.EXPENSE,
          icon: "🛒",
          created_at: now,
          updated_at: now,
        },
        {
          id: "housing",
          name: "Housing",
          type: LogType.FINANCE,
          finance_type: FinanceType.EXPENSE,
          icon: "🏠",
          created_at: now,
          updated_at: now,
        },
        // Transfer categories
        {
          id: "transfer",
          name: "Transfer",
          type: LogType.FINANCE,
          finance_type: FinanceType.TRANSFER,
          icon: "🔄",
          created_at: now,
          updated_at: now,
        },
      ])
    }

    // Seed default accounts if empty
    const accountsCount = await db.accounts.count()
    if (accountsCount === 0) {
      await db.accounts.bulkAdd([
        {
          id: "cash",
          name: "Cash",
          type: "cash" as const,
          balance: 0,
          currency: "RUB",
          created_at: now,
          updated_at: now,
        },
        {
          id: "card",
          name: "Bank Card",
          type: "card" as const,
          balance: 0,
          currency: "RUB",
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

// ============================================
// Database Stats
// ============================================

export interface DatabaseStats {
  tables: Record<string, number>
  totalRecords: number
  dbSize: number // estimated bytes
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  const tableNames = [
    "logs",
    "items",
    "content",
    "categories",
    "tags",
    "units",
    "accounts",
    "exercises",
    "syncQueue",
    "recipeIngredients",
    "recipeIngredientItems",
    "recipeSteps",
    "books",
    "userBooks",
    "authors",
    "bookAuthors",
    "series",
    "genres",
    "bookGenres",
    "bookQuotes",
    "bookReviews",
    "goals",
    "habits",
    "habitLogs",
    "streaks",
    "sleepLogs",
    "waterLogs",
    "moodLogs",
    "bodyMeasurements",
    "reminders",
    "reminderLogs",
    "templates",
    "recurringTransactions",
    "entityTranslations",
  ]

  const stats: Record<string, number> = {}
  let totalRecords = 0

  for (const tableName of tableNames) {
    try {
      const count = await (db as any)[tableName].count()
      stats[tableName] = count
      totalRecords += count
    } catch {
      stats[tableName] = 0
    }
  }

  // Estimate size: ~2KB per record average
  const estimatedSize = totalRecords * 2048

  return {
    tables: stats,
    totalRecords,
    dbSize: estimatedSize,
  }
}

// ============================================
// Database Cleanup Utilities
// ============================================

export interface CleanupResult {
  deletedRecords: number
  freedBytes: number
  details: Record<string, number>
}

/**
 * Clean up old data from the database
 * @param daysToKeep - Keep records from the last N days (default: 90)
 * @param options - Additional cleanup options
 */
export async function cleanupDatabase(
  daysToKeep: number = 90,
  options: {
    cleanupOldLogs?: boolean
    cleanupSyncedItems?: boolean
    cleanupOldReminders?: boolean
  } = {}
): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedRecords: 0,
    freedBytes: 0,
    details: {},
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  const cutoffDateStr = cutoffDate.toISOString().split("T")[0]

  // 1. Clean up old logs (optional)
  if (options.cleanupOldLogs !== false) {
    try {
      const oldLogs = await db.logs.where("date").below(cutoffDateStr).toArray()

      // Filter to only keep non-important logs
      const logsToDelete = oldLogs.filter((log) => !(log as any).important)

      if (logsToDelete.length > 0) {
        await db.logs.bulkDelete(logsToDelete.map((l) => l.id))
        result.deletedRecords += logsToDelete.length
        result.details.logs = logsToDelete.length
      }
    } catch (e) {
      console.error("Error cleaning up logs:", e)
    }
  }

  // 2. Clean up synced items from sync queue
  if (options.cleanupSyncedItems !== false) {
    try {
      const syncedItems = await db.syncQueue.where("synced").equals(1).toArray()

      if (syncedItems.length > 0) {
        await db.syncQueue.bulkDelete(syncedItems.map((s) => s.id))
        result.deletedRecords += syncedItems.length
        result.details.syncedQueue = syncedItems.length
      }
    } catch (e) {
      console.error("Error cleaning up sync queue:", e)
    }
  }

  // 3. Clean up old reminder logs (keep last 30 days)
  if (options.cleanupOldReminders !== false) {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

      const oldReminderLogs = await db.reminderLogs
        .filter((log) => log.triggered_at < thirtyDaysAgoStr)
        .toArray()

      if (oldReminderLogs.length > 0) {
        await db.reminderLogs.bulkDelete(oldReminderLogs.map((l) => l.id))
        result.deletedRecords += oldReminderLogs.length
        result.details.reminderLogs = oldReminderLogs.length
      }
    } catch (e) {
      console.error("Error cleaning up reminder logs:", e)
    }
  }

  // Calculate estimated freed space (~2KB per record)
  result.freedBytes = result.deletedRecords * 2048

  return result
}

/**
 * Vacuum/compact the database (rebuild indexes)
 * This can help after major deletions
 */
export async function compactDatabase(): Promise<void> {
  // IndexedDB doesn't have a direct vacuum, but we can export/import
  // For now, this is a placeholder for future implementation
  if (process.env.NODE_ENV === "development") {
    console.log("[DB] Compact requested - no action needed for IndexedDB")
  }
}

/**
 * Export database to JSON for backup
 */
export async function exportDatabase(): Promise<Record<string, unknown[]>> {
  const tables = [
    "logs",
    "items",
    "content",
    "categories",
    "tags",
    "units",
    "accounts",
    "exercises",
    "goals",
    "habits",
    "habitLogs",
    "streaks",
    "sleepLogs",
    "waterLogs",
    "moodLogs",
    "bodyMeasurements",
    "reminders",
    "reminderLogs",
    "templates",
    "recurringTransactions",
  ]

  const backup: Record<string, unknown[]> = {}

  for (const table of tables) {
    try {
      backup[table] = await (db as any)[table].toArray()
    } catch {
      backup[table] = []
    }
  }

  return backup
}

/**
 * Import database from JSON backup
 */
export async function importDatabase(backup: Record<string, unknown[]>): Promise<void> {
  for (const [table, records] of Object.entries(backup)) {
    try {
      await (db as any)[table].clear()
      if (records.length > 0) {
        await (db as any)[table].bulkAdd(records)
      }
    } catch (e) {
      console.error(`Error importing ${table}:`, e)
    }
  }
}
