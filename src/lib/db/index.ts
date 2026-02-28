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
  // Книги
  Book,
  UserBook,
  Author,
  BookAuthor,
  Series,
  Genre,
  BookGenre,
  BookQuote,
  BookReview,
  // Новые типы
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

  // Таблицы для рецептов
  recipeIngredients!: EntityTable<RecipeIngredient, "id">
  recipeIngredientItems!: EntityTable<RecipeIngredientItem, "id">
  recipeSteps!: EntityTable<RecipeStep, "id">

  // Таблицы для книг
  books!: EntityTable<Book, "id">
  userBooks!: EntityTable<UserBook, "id">
  authors!: EntityTable<Author, "id">
  bookAuthors!: EntityTable<BookAuthor, "id">
  series!: EntityTable<Series, "id">
  genres!: EntityTable<Genre, "id">
  bookGenres!: EntityTable<BookGenre, "id">
  bookQuotes!: EntityTable<BookQuote, "id">
  bookReviews!: EntityTable<BookReview, "id">

  // Новые таблицы - цели и привычки
  goals!: EntityTable<Goal, "id">
  habits!: EntityTable<Habit, "id">
  habitLogs!: EntityTable<HabitLog, "id">
  streaks!: EntityTable<Streak, "id">

  // Новые таблицы - трекеры
  sleepLogs!: EntityTable<SleepLog, "id">
  waterLogs!: EntityTable<WaterLog, "id">
  moodLogs!: EntityTable<MoodLog, "id">
  bodyMeasurements!: EntityTable<BodyMeasurement, "id">

  // Новые таблицы - напоминания и шаблоны
  reminders!: EntityTable<Reminder, "id">
  reminderLogs!: EntityTable<ReminderLog, "id">
  templates!: EntityTable<Template, "id">

  // Повторяющиеся транзакции
  recurringTransactions!: EntityTable<RecurringTransaction, "id">

  // Локализация сущностей
  entityTranslations!: EntityTable<EntityTranslation, "id">

  constructor() {
    super("LifeOSDB")

    this.version(7).stores({
      // Основные таблицы
      logs: "id, type, date, title, category_id, created_at, updated_at",
      items: "id, type, name, category, created_at, updated_at",
      content: "id, type, title, created_at, updated_at",

      // Справочники
      categories: "id, type, name",
      tags: "id, name",
      units: "id, type",
      accounts: "id, type",
      exercises: "id, category",

      // Рецепты
      recipeIngredients: "id, name, category, subcategory",
      recipeIngredientItems: "id, recipe_id, ingredient_id, order",
      recipeSteps: "id, recipe_id, order",

      // Книги
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

      // Цели и привычки
      goals: "id, type, period, is_active, start_date, end_date",
      habits: "id, name, frequency, is_active",
      habitLogs: "id, habit_id, date, completed",
      streaks: "id, habit_id, current_streak, longest_streak",

      // Трекеры
      sleepLogs: "id, date, quality, created_at, updated_at",
      waterLogs: "id, date, amount_ml, type",
      moodLogs: "id, date, mood, energy, stress",
      bodyMeasurements: "id, date, type, value",

      // Напоминания и шаблоны
      reminders: "id, type, time, days, is_active, related_id, priority",
      reminderLogs: "id, reminder_id, triggered_at, action",
      templates: "id, name, type, is_favorite",

      // Повторяющиеся транзакции
      recurringTransactions: "id, type, frequency, is_active, next_due, account_id",

      // Синхронизация
      syncQueue: "id, table_name, record_id, action, synced",
    })

    this.version(8).stores({
      // Локализация сущностей
      entityTranslations: "id, entity_type, entity_id, locale",
    })
  }
}

// ============================================
// Database Instance
// ============================================

export const db = new LifeOSDatabase()

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

// Импорт статических переводов сущностей
import enEntities from "@/messages/en/entities.json"
import ruEntities from "@/messages/ru/entities.json"

const entityTranslations: Record<string, typeof enEntities> = {
  en: enEntities,
  ru: ruEntities,
}

/**
 * Получить перевод сущности из статических файлов
 * @param entityType - тип сущности (categories, units, accounts)
 * @param entityKey - ключ сущности (например, "food", "salary")
 * @param locale - язык (en, ru)
 * @param subKey - подкатегория (например, "finance" для категорий)
 */
export function getStaticEntityTranslation(
  entityType: "categories" | "units" | "accounts",
  entityKey: string,
  locale: string,
  subKey?: string
): string {
  const translations = entityTranslations[locale] || entityTranslations["en"]

  if (!translations) return entityKey

  const entityData = (translations as Record<string, Record<string, unknown>>)[entityType]
  if (!entityData) return entityKey

  // Для категорий используем подкатегорию
  if (entityType === "categories" && subKey) {
    const subData = entityData[subKey] as Record<string, string> | undefined
    if (subData && subData[entityKey]) {
      return subData[entityKey]
    }
  }

  // Для units и accounts - прямой перевод по ключу
  const directTranslation = (entityData as Record<string, string>)[entityKey]
  return directTranslation || entityKey
}

/**
 * Получить все переводы для типа сущности
 */
export function getEntityTranslationsByType(
  entityType: "categories" | "units" | "accounts",
  locale: string
): Record<string, string> | Record<string, Record<string, string>> {
  const translations = entityTranslations[locale] || entityTranslations["en"]

  if (!translations) return {}

  return (translations as Record<string, Record<string, unknown>>)[entityType] || {}
}

/**
 * Получить локализованное название сущности
 * @param entityType - тип сущности (category, unit, account)
 * @param entityId - ID сущности
 * @param locale - язык (en, ru)
 * @param defaultName - название по умолчанию (из основной таблицы)
 * @param categoryType - тип категории для категорий (food, workout, finance)
 */
export async function getLocalizedEntityName(
  entityType: "category" | "unit" | "account",
  entityId: string,
  locale: string,
  defaultName: string,
  categoryType?: string
): Promise<string> {
  if (!locale || !["en", "ru"].includes(locale)) {
    return defaultName
  }

  // Сначала пробуем найти перевод по ID в базе данных
  const translation = await db.entityTranslations
    .where({
      entity_type: entityType,
      entity_id: entityId,
      locale: locale as "en" | "ru",
    })
    .first()

  if (translation?.name) {
    return translation.name
  }

  // Если нет в БД, пробуем статический перевод по ключу
  let staticTranslation: string

  if (entityType === "category" && categoryType) {
    // Для категорий используем подкатегорию (food, workout, finance)
    staticTranslation = getStaticEntityTranslation("categories", defaultName, locale, categoryType)
  } else {
    // Для units и accounts - прямой перевод по ключу
    staticTranslation = getStaticEntityTranslation(
      entityType === "category" ? "categories" : entityType === "unit" ? "units" : "accounts",
      defaultName,
      locale
    )
  }

  return staticTranslation !== defaultName ? staticTranslation : defaultName
}

/**
 * Сохранить перевод названия сущности
 */
export async function saveEntityTranslation(
  entityType: "category" | "unit" | "account",
  entityId: string,
  locale: "en" | "ru",
  name: string
): Promise<void> {
  const existing = await db.entityTranslations
    .where({
      entity_type: entityType,
      entity_id: entityId,
      locale,
    })
    .first()

  if (existing) {
    await db.entityTranslations.update(existing.id, { name, updated_at: getTimestamp() })
  } else {
    await db.entityTranslations.add({
      id: generateId(),
      entity_type: entityType,
      entity_id: entityId,
      locale,
      name,
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    })
  }
}

/**
 * Удалить перевод сущности
 */
export async function deleteEntityTranslation(
  entityType: "category" | "unit" | "account",
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
 * Получить все переводы для сущности
 */
export async function getEntityTranslations(
  entityType: "category" | "unit" | "account",
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
    // Создаём новый streak
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

export async function initializeDatabase(): Promise<void> {
  try {
    const now = getTimestamp()

    // Базовые цели (с current_value для корректной работы) - создаём если нет
    const goalsCount = await db.goals.count()
    if (goalsCount === 0) {
      await db.goals.bulkAdd([
        {
          id: generateId(),
          type: "calories",
          name: "Калории в день",
          target_value: 2000,
          current_value: 0,
          period: "daily",
          start_date: now.split("T")[0],
          is_active: true,
          unit: "ккал",
          created_at: now,
          updated_at: now,
        },
        {
          id: generateId(),
          type: "water",
          name: "Вода в день",
          target_value: 2000,
          current_value: 0,
          period: "daily",
          start_date: now.split("T")[0],
          is_active: true,
          unit: "мл",
          created_at: now,
          updated_at: now,
        },
        {
          id: generateId(),
          type: "workout",
          name: "Тренировки в неделю",
          target_value: 3,
          current_value: 0,
          period: "weekly",
          start_date: now.split("T")[0],
          is_active: true,
          unit: "шт",
          created_at: now,
          updated_at: now,
        },
        {
          id: generateId(),
          type: "sleep",
          name: "Сон в день",
          target_value: 480,
          current_value: 0,
          period: "daily",
          start_date: now.split("T")[0],
          is_active: true,
          unit: "мин",
          created_at: now,
          updated_at: now,
        },
      ])
    }

    // Категории и единицы измерения создаются через seed-функции
    // Они проверяют существование перед созданием
    const { seedCategories, seedUnits, cleanupDuplicateCategories } = await import("./seed")
    await seedCategories()
    await seedUnits()

    // Очищаем дубликаты категорий если есть
    await cleanupDuplicateCategories()

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Failed to initialize database:", error)
  }
}

// Re-export seed functions
export { seedDatabase, clearDatabase, reseedDatabase } from "./seed"
