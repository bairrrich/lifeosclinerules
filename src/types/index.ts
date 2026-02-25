// ============================================
// Базовые типы
// ============================================

// ============================================
// Книги — Перечисления
// ============================================

export type BookFormat = 'paperback' | 'hardcover' | 'ebook' | 'audiobook'

export type ReadingStatus = 
  | 'planned' 
  | 'reading' 
  | 'completed' 
  | 'paused' 
  | 'dropped'

export type AuthorRole = 'author' | 'translator' | 'editor' | 'illustrator'

// ============================================
// Книги — Метаданные (объективная информация)
// ============================================

export interface Book extends BaseEntity {
  title: string
  subtitle?: string
  description?: string
  isbn10?: string
  isbn13?: string
  published_year?: number
  original_publication_year?: number
  publisher?: string
  language: string
  page_count?: number
  format: BookFormat
  cover_image_url?: string
  series_id?: UUID
  series_number?: number
  
  // Внешние ID
  goodreads_id?: string
  google_books_id?: string
  
  // Вычисляемые поля
  rating_avg?: number
  rating_count?: number
  
  // Связи (не хранятся в таблице, заполняются при запросе)
  authors?: BookAuthorWithDetails[]
  genres?: Genre[]
  tags?: string[]
}

// ============================================
// Книги — Пользовательские данные
// ============================================

export interface UserBook extends BaseEntity {
  book_id: UUID
  status: ReadingStatus
  rating?: number // 1-5
  progress_pages?: number
  progress_percent?: number
  started_at?: ISODate
  finished_at?: ISODate
  personal_notes?: string
  is_owned?: boolean
  owned_format?: BookFormat
  location?: string
  reread_count?: number
}

// ============================================
// Автор
// ============================================

export interface Author extends BaseEntity {
  name: string
  name_original?: string
  birth_year?: number
  death_year?: number
  bio?: string
  photo_url?: string
  goodreads_author_id?: string
}

// ============================================
// Связь Книга-Автор
// ============================================

export interface BookAuthor extends BaseEntity {
  book_id: UUID
  author_id: UUID
  role: AuthorRole
  order: number
}

// Расширенная связь с деталями автора
export interface BookAuthorWithDetails extends BookAuthor {
  author?: Author
}

// ============================================
// Серия книг
// ============================================

export interface Series extends BaseEntity {
  name: string
  description?: string
  total_books?: number
}

// ============================================
// Жанры
// ============================================

export interface Genre extends BaseEntity {
  name: string
  parent_id?: UUID
  description?: string
}

export interface BookGenre extends BaseEntity {
  book_id: UUID
  genre_id: UUID
}

// ============================================
// Цитаты из книги
// ============================================

export interface BookQuote extends BaseEntity {
  user_book_id: UUID
  text: string
  page?: number
  location?: string
}

// ============================================
// Рецензия на книгу
// ============================================

export interface BookReview extends BaseEntity {
  user_book_id: UUID
  title?: string
  text: string
}


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

// Типы рецептов
export enum RecipeType {
  FOOD = 'food',       // Еда (блюда)
  DRINK = 'drink',     // Напитки безалкогольные
  COCKTAIL = 'cocktail' // Коктейли
}

// Тип блюда (для еды)
export type CourseType = 
  | 'breakfast' | 'lunch' | 'dinner' 
  | 'soup' | 'salad' | 'dessert' | 'snack' | 'sauce' | 'appetizer'

// Метод приготовления еды
export type CookingMethod = 
  | 'bake' | 'fry' | 'boil' | 'steam' | 'grill' | 'raw' | 'stew' | 'roast'

// Метод для коктейлей
export type CocktailMethod = 
  | 'shaken' | 'stirred' | 'blended' | 'built' | 'muddled' | 'layered'

// Сложность
export type Difficulty = 'easy' | 'medium' | 'hard' | 'pro'

// Категория ингредиента
export type IngredientCategory = 
  | 'vegetable' | 'fruit' | 'meat' | 'poultry' | 'seafood' | 'dairy' 
  | 'grain' | 'pasta' | 'spice' | 'alcohol' | 'liqueur' | 'liquid' 
  | 'sweetener' | 'herb' | 'nut' | 'seed' | 'oil' | 'sauce' | 'other'

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
  // Пищевая ценность (для продуктов)
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  serving_size?: number // размер порции в граммах
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

// Старый упрощённый тип (для обратной совместимости)
export interface RecipeContent extends BaseContent {
  type: ContentType.RECIPE
  metadata?: RecipeMetadata
}

// Используем расширенный тип как основной для контента
export type Content = BookContent | RecipeContentExtended

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

// ============================================
// Расширенные типы для рецептов
// ============================================

// Справочник ингредиентов
export interface RecipeIngredient extends BaseEntity {
  name: string
  name_en?: string
  category: IngredientCategory
  subcategory?: string
  is_alcoholic?: boolean
  default_unit?: string
  calories_per_100?: number
  density?: number // для пересчёта объём ↔ масса
}

// Связка рецепт-ингредиент
export interface RecipeIngredientItem extends BaseEntity {
  recipe_id: UUID
  ingredient_id?: UUID // ссылка на справочник (опционально)
  ingredient_name: string // название (для быстрого доступа или кастомного)
  amount: number
  unit: string
  optional?: boolean
  note?: string // "свежий", "мелко нарезать"
  order?: number
  substitute?: string // альтернатива
}

// Шаг приготовления
export interface RecipeStep extends BaseEntity {
  recipe_id: UUID
  order: number
  text: string
  image?: string
  timer_min?: number // "варить 10 минут"
}

// Типы бокалов для коктейлей
export type GlassType = 
  | 'highball' | 'lowball' | 'martini' | 'coupe' 
  | 'margarita' | 'hurricane' | 'shot' | 'wine'
  | 'champagne' | 'mug' | 'collins' | 'rocks'

// Тип льда
export type IceType = 'cubed' | 'crushed' | 'sphere' | 'none'

// Температура подачи
export type ServingTemperature = 'hot' | 'warm' | 'room' | 'cold' | 'iced'

// Метаданные для еды
export interface FoodRecipeMetadata {
  course_type?: CourseType
  cuisine?: string // "Итальянская", "Японская"
  cooking_method?: CookingMethod[]
  dietary?: string[] // ["vegan", "gluten-free", "keto"]
  serving_temperature?: ServingTemperature
  spicy_level?: 0 | 1 | 2 | 3 // 0 = не острое
}

// Метаданные для напитков
export interface DrinkRecipeMetadata {
  drink_type?: 'tea' | 'coffee' | 'smoothie' | 'juice' | 'lemonade' | 'milkshake' | 'compote' | 'cocoa'
  base?: string // "вода", "молоко", "сок"
  is_carbonated?: boolean
  serving_temperature?: ServingTemperature
  caffeine_mg?: number
  volume_ml?: number
}

// Метаданные для коктейлей
export interface CocktailRecipeMetadata {
  is_alcoholic: boolean
  alcohol_percent?: number
  base_spirit?: string // "водка", "джин", "ром", "текила", "виски"
  cocktail_method?: CocktailMethod
  glass_type?: GlassType
  ice_type?: IceType
  garnish?: string[]
  color?: string
  iba_category?: string // IBA Official Cocktails category
  tools?: string[] // ["шейкер", "джиггер", "мадлер"]
}

// Полный интерфейс рецепта
export interface RecipeContentExtended extends BaseContent {
  type: ContentType.RECIPE
  recipe_type: RecipeType
  metadata?: RecipeMetadata // для обратной совместимости
  
  // Время
  prep_time_min?: number
  cook_time_min?: number
  total_time_min?: number
  
  // Порции
  servings?: number
  serving_unit?: string // "порции", "шт", "литр"
  
  difficulty?: Difficulty
  
  // КБЖУ
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  sugar?: number
  fiber?: number
  
  // Специфичные данные по типу
  food_metadata?: FoodRecipeMetadata
  drink_metadata?: DrinkRecipeMetadata
  cocktail_metadata?: CocktailRecipeMetadata
  
  // Связи (не хранятся в metadata, а в отдельных таблицах)
  ingredients?: RecipeIngredientItem[]
  steps?: RecipeStep[]
}

// Объединённый тип контента
export type ContentExtended = BookContent | RecipeContentExtended

// ============================================
// Цели и прогресс
// ============================================

export type GoalType = 'calories' | 'workout' | 'water' | 'sleep' | 'steps' | 'weight' | 'finance'

export type GoalPeriod = 'daily' | 'weekly' | 'monthly'

export interface Goal extends BaseEntity {
  type: GoalType
  name: string
  target_value: number
  current_value?: number
  period: GoalPeriod
  start_date: ISODate
  end_date?: ISODate
  is_active: boolean
  icon?: string
  color?: string
  unit?: string
}

// ============================================
// Привычки и серии (Streaks)
// ============================================

export interface Habit extends BaseEntity {
  name: string
  icon?: string
  color?: string
  frequency: 'daily' | 'weekly' | 'custom'
  custom_days?: number[] // 0-6 для дней недели
  reminder_time?: string // "08:00"
  is_active: boolean
  start_date: ISODate // Дата начала привычки
  end_date?: ISODate // Дата окончания (опционально)
}

export interface HabitLog extends BaseEntity {
  habit_id: UUID
  date: ISODate
  completed: boolean
  note?: string
}

export interface Streak extends BaseEntity {
  habit_id: UUID
  current_streak: number
  longest_streak: number
  last_completed_date?: ISODate
}

// ============================================
// Трекер сна
// ============================================

export interface SleepLog extends BaseEntity {
  date: ISODate
  start_time: string // "23:00"
  end_time: string // "07:00"
  duration_min: number // вычисляемое
  quality: 1 | 2 | 3 | 4 | 5 // 1 = плохо, 5 = отлично
  deep_sleep_min?: number
  rem_sleep_min?: number
  awake_min?: number
  notes?: string
  factors?: string[] // ["caffeine", "exercise", "stress", "alcohol"]
}

// ============================================
// Трекер воды
// ============================================

export interface WaterLog extends BaseEntity {
  date: ISODate
  amount_ml: number
  time?: string // "08:30"
  type?: 'water' | 'tea' | 'coffee' | 'other'
  note?: string
}

// ============================================
// Трекер настроения
// ============================================

export type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible'

export interface MoodLog extends BaseEntity {
  date: ISODate
  mood: MoodType
  energy: 1 | 2 | 3 | 4 | 5
  stress: 1 | 2 | 3 | 4 | 5 // 1 = низкий, 5 = высокий
  activities?: string[] // ["work", "exercise", "social", "hobby"]
  notes?: string
  factors?: string[] // ["sleep", "weather", "health", "work"]
}

// ============================================
// Измерения тела
// ============================================

export type BodyMeasurementType = 
  | 'weight' | 'height' | 'bmi'
  | 'chest' | 'waist' | 'hips' | 'neck'
  | 'biceps' | 'forearm' | 'thigh' | 'calf'
  | 'body_fat' | 'muscle_mass'

export interface BodyMeasurement extends BaseEntity {
  date: ISODate
  type: BodyMeasurementType
  value: number
  unit: string // "kg", "cm", "%"
  notes?: string
}

// ============================================
// Напоминания
// ============================================

export type ReminderType = 'habit' | 'medicine' | 'water' | 'workout' | 'custom'

export interface Reminder extends BaseEntity {
  type: ReminderType
  title: string
  message?: string
  time: string // "08:00"
  days: number[] // 0-6 для дней недели
  is_active: boolean
  related_id?: UUID // связь с привычкой/лекарством
  sound?: boolean
  vibration?: boolean
}

// ============================================
// Шаблоны записей
// ============================================

export interface Template extends BaseEntity {
  name: string
  type: LogType | 'water' | 'sleep' | 'mood'
  data: JSONValue // сериализованные данные записи
  is_favorite?: boolean
  use_count?: number
}
