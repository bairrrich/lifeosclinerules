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

  constructor() {
    super('LifeOSDB')
    
    this.version(4).stores({
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
      bookReviews: 'id, user_book_id, created_at, updated_at',
      
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
    }
    
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

// Re-export seed functions
export { seedDatabase, clearDatabase, reseedDatabase } from './seed'
