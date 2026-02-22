// ============================================
// Базовые типы
// ============================================

export type UUID = string
export type ISODate = string
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue }

// ============================================
// Перечисления
// ============================================

export enum LogType {
  FOOD = 'food',
  WORKOUT = 'workout',
  FINANCE = 'finance',
}

export enum ItemType {
  VITAMIN = 'vitamin',
  MEDICINE = 'medicine',
  HERB = 'herb',
  COSMETIC = 'cosmetic',
  PRODUCT = 'product',
}

export enum ContentType {
  BOOK = 'book',
  RECIPE = 'recipe',
}

export enum FinanceType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export enum BookStatus {
  PLANNED = 'planned',
  READING = 'reading',
  DONE = 'done',
}

// ============================================
// Базовые интерфейсы
// ============================================

export interface BaseEntity {
  id: UUID
  created_at: ISODate
  updated_at: ISODate
}

export interface Taggable {
  tags: string[]
}

export interface Notable {
  notes?: string
}

// ============================================
// Группа A — Учет (Logs)
// ============================================

export interface BaseLog extends BaseEntity, Taggable, Notable {
  type: LogType
  date: ISODate
  title: string
  category_id?: UUID
  quantity?: number
  unit?: string
  value?: number
}

// Метаданные для разных типов логов
export interface FoodMetadata {
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
}

export interface WorkoutMetadata {
  duration?: number
  intensity?: 'low' | 'medium' | 'high'
  exercise_id?: UUID
}

export interface FinanceMetadata {
  account_id?: UUID
  finance_type: FinanceType
}

// Полные типы логов
export interface FoodLog extends BaseLog {
  type: LogType.FOOD
  metadata?: FoodMetadata
}

export interface WorkoutLog extends BaseLog {
  type: LogType.WORKOUT
  metadata?: WorkoutMetadata
}

export interface FinanceLog extends BaseLog {
  type: LogType.FINANCE
  metadata?: FinanceMetadata
}

export type Log = FoodLog | WorkoutLog | FinanceLog

// ============================================
// Группа B — Каталог веществ (Items)
// ============================================

export interface BaseItem extends BaseEntity, Taggable, Notable {
  type: ItemType
  name: string
  category?: string
  description?: string
  usage?: string
  benefits?: string
  contraindications?: string
  dosage?: string
  form?: string
  manufacturer?: string
  composition?: string
  storage?: string
  expiration?: ISODate
}

export type Item = BaseItem

// ============================================
// Группа C — Контент (Content)
// ============================================

export interface BaseContent extends BaseEntity, Taggable {
  type: ContentType
  title: string
  cover?: string
  description?: string
  body?: string
  rating?: number
}

export interface BookMetadata {
  author?: string
  year?: number
  pages?: number
  status: BookStatus
}

export interface RecipeMetadata {
  ingredients?: Ingredient[]
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  cook_time?: number
}

export interface Ingredient {
  name: string
  amount: number
  unit: string
}

export interface BookContent extends BaseContent {
  type: ContentType.BOOK
  metadata?: BookMetadata
}

export interface RecipeContent extends BaseContent {
  type: ContentType.RECIPE
  metadata?: RecipeMetadata
}

export type Content = BookContent | RecipeContent

// ============================================
// Справочники
// ============================================

export interface Category extends BaseEntity {
  type: LogType | ItemType | ContentType
  name: string
  icon?: string
  color?: string
}

export interface Tag extends BaseEntity {
  name: string
  color?: string
}

export interface Unit extends BaseEntity {
  name: string
  abbreviation: string
  type: 'weight' | 'volume' | 'count' | 'time' | 'money'
}

export interface Account extends BaseEntity {
  name: string
  type: 'cash' | 'card' | 'bank' | 'crypto'
  balance: number
  currency: string
}

export interface Exercise extends BaseEntity {
  name: string
  category: string
  muscle_groups: string[]
  description?: string
}

// ============================================
// Синхронизация
// ============================================

export type SyncAction = 'create' | 'update' | 'delete'

export interface SyncQueueItem extends BaseEntity {
  table_name: 'logs' | 'items' | 'content' | 'categories' | 'tags'
  record_id: UUID
  action: SyncAction
  data: JSONValue
  synced: boolean
}