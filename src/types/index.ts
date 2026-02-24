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

// ============================================
// Типы тренировок
// ============================================

export type WorkoutType = 'strength' | 'cardio' | 'yoga'

// Силовые тренировки - подкатегории
export type StrengthSubcategory = 
  // По анатомическому принципу
  | 'chest' // Грудь
  | 'back' // Спина
  | 'legs' // Ноги
  | 'shoulders' // Плечи
  | 'arms' // Руки
  | 'core' // Пресс (Кор)
  // По типу оборудования
  | 'free_weights' // Свободные веса
  | 'machines' // Тренажеры
  | 'bodyweight' // С собственным весом
  | 'functional' // Функциональный тренинг

// Кардио - подкатегории
export type CardioSubcategory = 
  // По типу активности
  | 'running' // Бег
  | 'walking' // Ходьба
  | 'cycling' // Велосипед
  | 'rowing' // Гребля
  | 'jumping' // Прыжки
  // По интенсивности
  | 'liss' // LISS
  | 'hiit' // HIIT
  | 'tabata' // Табата

// Йога - подкатегории
export type YogaSubcategory = 
  // По стилям
  | 'hatha' // Хатха-йога
  | 'vinyasa' // Виньяса-йога
  | 'ashtanga' // Аштанга-йога
  | 'kundalini' // Кундалини-йога
  | 'iyengar' // Айенгар-йога
  // По целям
  | 'stretching' // Стретчинг / Гибкость
  | 'power' // Силовая йога
  | 'relax' // Релакс / Восстановление
  | 'breathing' // Дыхание и медитация
  // По уровню
  | 'beginner' // Для начинающих
  | 'intermediate' // Для продолжающих
  | 'advanced' // Для опытных

// Цели тренировок
export type WorkoutGoal = 
  | 'mass' // Набор массы
  | 'relief' // Рельеф
  | 'strength' // Сила
  | 'endurance' // Выносливость
  | 'flexibility' // Гибкость
  | 'relaxation' // Расслабление
  | 'balance' // Баланс
  | 'fat_loss' // Сжигание жира
  | 'recovery' // Восстановление

// Метрики для силовой тренировки
export interface StrengthMetrics {
  exercises_count?: number // Количество упражнений
  sets_count?: number // Количество подходов
  reps_count?: number // Количество повторов
  total_weight?: number // Общий вес (кг)
}

// Метрики для кардио тренировки
export interface CardioMetrics {
  distance?: number // Дистанция (км)
  average_speed?: number // Средняя скорость (км/ч)
  average_pace?: string // Средний темп (мин/км)
  rounds?: number // Количество раундов (для HIIT/Tabata)
}

// Метрики для йоги
export interface YogaMetrics {
  level?: 'beginner' | 'intermediate' | 'advanced' // Уровень
  focus?: 'flexibility' | 'strength' | 'relaxation' | 'meditation' | 'breathing' // Фокус
}

// Объединённые метаданные тренировки
export interface WorkoutMetadata {
  // Общие поля
  duration?: number // Длительность в минутах
  intensity?: 'low' | 'medium' | 'high'
  exercise_id?: UUID
  
  // Подкатегория в зависимости от типа тренировки
  subcategory?: StrengthSubcategory | CardioSubcategory | YogaSubcategory
  
  // Дополнительные параметры
  equipment?: string | string[] // Инвентарь (одно или несколько)
  goal?: WorkoutGoal // Цель тренировки
  calories_burned?: number // Сожженные калории
  
  // Пульс (общее для кардио и силовых)
  heart_rate_avg?: number // Средний пульс
  heart_rate_max?: number // Максимальный пульс
  
  // Специфические метрики для силовой
  exercises_count?: number
  sets_count?: number
  reps_count?: number
  total_weight?: number
  
  // Специфические метрики для кардио
  distance?: number // Дистанция (км)
  average_speed?: number // Средняя скорость
  average_pace?: string // Средний темп
  rounds?: number // Количество раундов
  
  // Специфические метрики для йоги
  level?: 'beginner' | 'intermediate' | 'advanced'
  focus?: 'flexibility' | 'strength' | 'relaxation' | 'meditation' | 'breathing'
}

export interface FinanceMetadata {
  account_id?: UUID
  finance_type: FinanceType
  target_account_id?: UUID
  category?: string
  subcategory?: string
  item?: string
  supplier?: string
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
  type: 'cash' | 'card' | 'bank' | 'crypto' | 'investment' | 'deposit'
  balance: number
  currency: string
  icon?: string
  color?: string
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