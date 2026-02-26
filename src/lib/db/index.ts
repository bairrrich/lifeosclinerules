import Dexie, { type EntityTable } from 'dexie'
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
} from '@/types'
import { LogType, ItemType, ContentType } from '@/types'

// ============================================
// Database Schema
// ============================================

class LifeOSDatabase extends Dexie {
  logs!: EntityTable<Log, 'id'>
  items!: EntityTable<Item, 'id'>
  content!: EntityTable<Content, 'id'>
  categories!: EntityTable<Category, 'id'>
  tags!: EntityTable<Tag, 'id'>
  units!: EntityTable<Unit, 'id'>
  accounts!: EntityTable<Account, 'id'>
  exercises!: EntityTable<Exercise, 'id'>
  syncQueue!: EntityTable<SyncQueueItem, 'id'>
  
  // Таблицы для рецептов
  recipeIngredients!: EntityTable<RecipeIngredient, 'id'>
  recipeIngredientItems!: EntityTable<RecipeIngredientItem, 'id'>
  recipeSteps!: EntityTable<RecipeStep, 'id'>
  
  // Таблицы для книг
  books!: EntityTable<Book, 'id'>
  userBooks!: EntityTable<UserBook, 'id'>
  authors!: EntityTable<Author, 'id'>
  bookAuthors!: EntityTable<BookAuthor, 'id'>
  series!: EntityTable<Series, 'id'>
  genres!: EntityTable<Genre, 'id'>
  bookGenres!: EntityTable<BookGenre, 'id'>
  bookQuotes!: EntityTable<BookQuote, 'id'>
  bookReviews!: EntityTable<BookReview, 'id'>
  
  // Новые таблицы - цели и привычки
  goals!: EntityTable<Goal, 'id'>
  habits!: EntityTable<Habit, 'id'>
  habitLogs!: EntityTable<HabitLog, 'id'>
  streaks!: EntityTable<Streak, 'id'>
  
  // Новые таблицы - трекеры
  sleepLogs!: EntityTable<SleepLog, 'id'>
  waterLogs!: EntityTable<WaterLog, 'id'>
  moodLogs!: EntityTable<MoodLog, 'id'>
  bodyMeasurements!: EntityTable<BodyMeasurement, 'id'>
  
  // Новые таблицы - напоминания и шаблоны
  reminders!: EntityTable<Reminder, 'id'>
  reminderLogs!: EntityTable<ReminderLog, 'id'>
  templates!: EntityTable<Template, 'id'>
  
  // Повторяющиеся транзакции
  recurringTransactions!: EntityTable<RecurringTransaction, 'id'>

  constructor() {
    super('LifeOSDB')
    
    this.version(7).stores({
      // Основные таблицы
      logs: 'id, type, date, title, category_id, created_at, updated_at',
      items: 'id, type, name, category, created_at, updated_at',
      content: 'id, type, title, created_at, updated_at',
      
      // Справочники
      categories: 'id, type, name',
      tags: 'id, name',
      units: 'id, type',
      accounts: 'id, type',
      exercises: 'id, category',
      
      // Рецепты
      recipeIngredients: 'id, name, category, subcategory',
      recipeIngredientItems: 'id, recipe_id, ingredient_id, order',
      recipeSteps: 'id, recipe_id, order',
      
      // Книги
      books: 'id, title, isbn13, published_year, language, format, series_id, created_at, updated_at',
      userBooks: 'id, book_id, status, rating, started_at, finished_at, created_at, updated_at',
      authors: 'id, name, created_at, updated_at',
      bookAuthors: 'id, book_id, author_id, role, order',
      series: 'id, name, created_at, updated_at',
      genres: 'id, name, parent_id, created_at, updated_at',
      bookGenres: 'id, book_id, genre_id',
      bookQuotes: 'id, user_book_id, created_at, updated_at',
      bookReviews: 'id, userBook_id, created_at, updated_at',
      
      // Цели и привычки
      goals: 'id, type, period, is_active, start_date, end_date',
      habits: 'id, name, frequency, is_active',
      habitLogs: 'id, habit_id, date, completed',
      streaks: 'id, habit_id, current_streak, longest_streak',
      
      // Трекеры
      sleepLogs: 'id, date, quality, created_at, updated_at',
      waterLogs: 'id, date, amount_ml, type',
      moodLogs: 'id, date, mood, energy, stress',
      bodyMeasurements: 'id, date, type, value',
      
      // Напоминания и шаблоны
      reminders: 'id, type, time, days, is_active, related_id, priority',
      reminderLogs: 'id, reminder_id, triggered_at, action',
      templates: 'id, name, type, is_favorite',
      
      // Повторяющиеся транзакции
      recurringTransactions: 'id, type, frequency, is_active, next_due, account_id',
      
      // Синхронизация
      syncQueue: 'id, table_name, record_id, action, synced',
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
  table: EntityTable<T, 'id'>,
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
  table: EntityTable<T, 'id'>,
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
  table: EntityTable<T, 'id'>,
  id: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (table as any).delete(id)
}

export async function getEntityById<T extends { id: string }>(
  table: EntityTable<T, 'id'>,
  id: string
): Promise<T | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (table as any).get(id)
}

export async function getAllEntities<T extends { id: string }>(
  table: EntityTable<T, 'id'>
): Promise<T[]> {
  return await table.toArray()
}

// ============================================
// Specific Queries
// ============================================

// Logs
export async function getLogsByType(type: string): Promise<Log[]> {
  return await db.logs.where('type').equals(type).toArray()
}

export async function getLogsByDateRange(
  type: string,
  startDate: string,
  endDate: string
): Promise<Log[]> {
  return await db.logs
    .where('type')
    .equals(type)
    .and((log) => log.date >= startDate && log.date <= endDate)
    .toArray()
}

// Items
export async function getItemsByType(type: string): Promise<Item[]> {
  return await db.items.where('type').equals(type).toArray()
}

// Content
export async function getContentByType(type: string): Promise<Content[]> {
  return await db.content.where('type').equals(type).toArray()
}

// Categories
export async function getCategoriesByType(type: string): Promise<Category[]> {
  return await db.categories.where('type').equals(type).toArray()
}

// Search
export async function searchLogs(query: string): Promise<Log[]> {
  const lowerQuery = query.toLowerCase()
  return await db.logs
    .filter((log) => log.title.toLowerCase().includes(lowerQuery))
    .toArray()
}

export async function searchItems(query: string): Promise<Item[]> {
  const lowerQuery = query.toLowerCase()
  return await db.items
    .filter((item) => item.name.toLowerCase().includes(lowerQuery))
    .toArray()
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
  const today = new Date().toISOString().split('T')[0]
  
  const existingStreak = await db.streaks.where('habit_id').equals(habitId).first()
  
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
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
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
    // Проверяем, есть ли уже данные
    const categoriesCount = await db.categories.count()
    
    if (categoriesCount === 0) {
      // Добавляем базовые категории
      const now = getTimestamp()
      
      // Категории для логов
      await db.categories.bulkAdd([
        { id: generateId(), type: LogType.FOOD as LogType, name: 'Завтрак', icon: 'sunrise', created_at: now, updated_at: now },
        { id: generateId(), type: LogType.FOOD as LogType, name: 'Обед', icon: 'sun', created_at: now, updated_at: now },
        { id: generateId(), type: LogType.FOOD as LogType, name: 'Ужин', icon: 'moon', created_at: now, updated_at: now },
        { id: generateId(), type: LogType.FOOD as LogType, name: 'Перекус', icon: 'cookie', created_at: now, updated_at: now },
        { id: generateId(), type: LogType.WORKOUT as LogType, name: 'Силовая', icon: 'dumbbell', created_at: now, updated_at: now },
        { id: generateId(), type: LogType.WORKOUT as LogType, name: 'Кардио', icon: 'heart', created_at: now, updated_at: now },
        { id: generateId(), type: LogType.WORKOUT as LogType, name: 'Йога', icon: 'stretch', created_at: now, updated_at: now },
        { id: generateId(), type: LogType.FINANCE as LogType, name: 'Зарплата', icon: 'wallet', created_at: now, updated_at: now },
        { id: generateId(), type: LogType.FINANCE as LogType, name: 'Продукты', icon: 'shopping-cart', created_at: now, updated_at: now },
        { id: generateId(), type: LogType.FINANCE as LogType, name: 'Транспорт', icon: 'car', created_at: now, updated_at: now },
        { id: generateId(), type: LogType.FINANCE as LogType, name: 'Развлечения', icon: 'gamepad', created_at: now, updated_at: now },
      ])
      
      // Единицы измерения
      await db.units.bulkAdd([
        { id: generateId(), name: 'Грамм', abbreviation: 'г', type: 'weight', created_at: now, updated_at: now },
        { id: generateId(), name: 'Килограмм', abbreviation: 'кг', type: 'weight', created_at: now, updated_at: now },
        { id: generateId(), name: 'Миллилитр', abbreviation: 'мл', type: 'volume', created_at: now, updated_at: now },
        { id: generateId(), name: 'Литр', abbreviation: 'л', type: 'volume', created_at: now, updated_at: now },
        { id: generateId(), name: 'Штука', abbreviation: 'шт', type: 'count', created_at: now, updated_at: now },
        { id: generateId(), name: 'Минута', abbreviation: 'мин', type: 'time', created_at: now, updated_at: now },
        { id: generateId(), name: 'Час', abbreviation: 'ч', type: 'time', created_at: now, updated_at: now },
        { id: generateId(), name: 'Рубль', abbreviation: '₽', type: 'money', created_at: now, updated_at: now },
      ])
      
      // Базовые цели (с current_value для корректной работы)
      await db.goals.bulkAdd([
        { id: generateId(), type: 'calories', name: 'Калории в день', target_value: 2000, current_value: 0, period: 'daily', start_date: now.split('T')[0], is_active: true, unit: 'ккал', created_at: now, updated_at: now },
        { id: generateId(), type: 'water', name: 'Вода в день', target_value: 2000, current_value: 0, period: 'daily', start_date: now.split('T')[0], is_active: true, unit: 'мл', created_at: now, updated_at: now },
        { id: generateId(), type: 'workout', name: 'Тренировки в неделю', target_value: 3, current_value: 0, period: 'weekly', start_date: now.split('T')[0], is_active: true, unit: 'шт', created_at: now, updated_at: now },
        { id: generateId(), type: 'sleep', name: 'Сон в день', target_value: 480, current_value: 0, period: 'daily', start_date: now.split('T')[0], is_active: true, unit: 'мин', created_at: now, updated_at: now },
      ])
    }
    
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

// Re-export seed functions
export { seedDatabase, clearDatabase, reseedDatabase } from './seed'