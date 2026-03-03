# 🏗 System Patterns: Life OS

## Архитектура системы

### Общая структура

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Dashboard
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Глобальные стили + CSS переменные
│   ├── logs/              # Группа A — Учет
│   │   └── [type]/        # food, workout, finance
│   ├── items/             # Группа B — Каталог
│   │   └── [type]/        # vitamin, medicine, herb, cosmetic, product
│   ├── content/           # Группа C — Контент
│   │   └── [type]/        # book, recipe
│   └── settings/          # Настройки
├── components/
│   ├── layout/            # Layout компоненты
│   ├── shared/            # Общие компоненты
│   │   ├── fab.tsx        # FAB кнопка
│   │   ├── virtual-list.tsx # Виртуализированный список
│   │   └── lazy-load.tsx  # Lazy loading компонент
│   ├── finance/           # Финансовые компоненты
│   │   └── budget-manager.tsx
│   └── ui/                # shadcn/ui компоненты
├── lib/
│   ├── utils.ts           # Утилиты
│   ├── theme-colors.ts    # Централизованная система цветов
│   └── db/                # Dexie database
├── stores/                # Zustand stores
├── hooks/                 # React hooks
│   ├── use-units.ts       # Единицы измерения
│   ├── use-notifications.ts # Уведомления
│   └── use-cached-data.ts # Кэширование данных
└── types/                 # TypeScript типы
```

## Ключевые технические решения

### 1. Offline-first архитектура

**Проблема**: Приложение должно работать без интернета

**Решение**: IndexedDB через Dexie

- Все данные хранятся локально
- Sync queue для отложенной синхронизации
- Улучшенная обработка конфликтов (local priority + 5s порог)

```
User Action → Local DB → Sync Queue → Batch Processing → Network (when available)
```

**Обновление (2026-03-03)**: Добавлен batch processing (50 элементов/батч) для оптимизации памяти

### 2. Унификация данных

**Проблема**: Разные типы данных должны иметь единый интерфейс

**Решение**: Три группы сущностей с базовыми интерфейсами

```typescript
// Базовый интерфейс
interface BaseEntity {
  id: UUID
  created_at: ISODate
  updated_at: ISODate
}

// Расширение для разных групп
interface BaseLog extends BaseEntity, Taggable, Notable { ... }
interface BaseItem extends BaseEntity, Taggable, Notable { ... }
interface BaseContent extends BaseEntity, Taggable { ... }
```

### 3. Динамическая маршрутизация

**Проблема**: Множество похожих страниц для разных типов

**Решение**: Динамические маршруты с [type]

```
/logs/[type]/new → /logs/food/new, /logs/workout/new
/items/[type]/[id] → /items/vitamin/uuid
```

### 4. Оптимизация производительности

**Проблема**: Большие списки и тяжёлые компоненты замедляют работу

**Решение**: Четыре уровня оптимизации

```typescript
// 1. Виртуализация списков
import { VirtualList } from "@/components/shared/virtual-list"
<VirtualList items={logs} renderItem={(log) => <LogCard log={log} />} />

// 2. Кэширование данных
import { useCachedData } from "@/hooks/use-cached-data"
const { data } = useCachedData("logs", () => db.logs.toArray())

// 3. Lazy loading
import { LazyLoad } from "@/components/shared/lazy-load"
<LazyLoad><HeavyChart /></LazyLoad>

// 4. Debounce для поиска
import { useDebounce } from "@/hooks/use-debounce"
const debouncedQuery = useDebounce(query, 300)
```

**Обновление (2026-03-03)**:

- ✅ Добавлен `useDebounce` хук
- ✅ Batch processing в SyncService (50 элементов/батч, макс 500)

### 6. Централизованные константы

**Проблема**: Магические числа разбросаны по всему коду, что затрудняет поддержку

**Решение**: Файл `constants.ts` с централизованными константами

```typescript
// src/lib/constants.ts
export const NOTIFICATION_CHECK_INTERVAL = 30000 // 30 секунд
export const SYNC_BATCH_SIZE = 50
export const SYNC_MAX_MEMORY_ITEMS = 500
export const SYNC_CONFLICT_THRESHOLD = 5000 // 5 секунд
export const MAX_RETRY_ATTEMPTS = 3
export const RETRY_DELAY_MS = 1000
export const DEBOUNCE_DELAY_MS = 300
export const DEFAULT_PAGE_SIZE = 20
export const CACHE_TTL_MS = 300000 // 5 минут
export const ANIMATION_DURATION_MS = 200
```

**Обновление (2026-03-03)**: Создан файл `src/lib/constants.ts` с 30+ константами

### 7. Retry паттерн

**Проблема**: При временных ошибках нет автоматического повторного запроса

**Решение**: Хук `useEntityList` с retry механизмом

```typescript
// src/hooks/use-entity-list.ts
const fetchData = useCallback(
  async (isRetry = false) => {
    try {
      // ... загрузка данных
    } catch (err) {
      if (isRetry && retryCount < MAX_RETRY_ATTEMPTS) {
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1)
            fetchData(true)
          },
          RETRY_DELAY_MS * (retryCount + 1)
        ) // Экспоненциальная задержка
      }
    }
  },
  [entity, filter, retryCount]
)
```

### 8. Безопасность (XSS защита)

**Проблема**: Пользовательский контент из базы данных может содержать вредоносный код

**Решение**: Функция санитизации `sanitizeText`

```typescript
// src/components/shared/global-search.tsx
function sanitizeText(text: string | undefined | null): string {
  if (!text) return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
```

### 9. Graceful degradation

**Проблема**: При отсутствии конфигурации приложение падает с ошибкой

**Решение**: Проверка переменных окружения с mock объектом

```typescript
// src/lib/supabase/client.ts
if (!url || !key) {
  console.warn("Supabase not configured")
  return mockClient // Возвращает объект с описательными ошибками
}
```

### 10. Единообразие цветов (Theme Colors System)

**Проблема**: Hardcoded цвета в компонентах нарушают консистентность UI

**Решение**: Централизованная система цветов через OKLCH цветовое пространство

```typescript
// src/lib/theme-colors.ts
import { moduleColors, statusColors, workoutColors } from "@/lib/theme-colors"

// Использование в компоненте
const colors = moduleColors.food
// colors.light → bg-[oklch(0.88_0.22_68)]
// colors.DEFAULT → bg-[oklch(0.76_0.28_68)]
// colors.text → text-[oklch(0.88_0.22_68)]
// colors.border → border-[oklch(0.76_0.28_68)/0.45]
```

**Доступные цветовые группы:**

| Группа                | Назначение                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| `moduleColors`        | 12 модулей (food, workout, finance, water, sleep, mood, books, recipes, habits, goals, logs, settings) |
| `workoutColors`       | Типы тренировок (strength, cardio, yoga, stretching) + calories                                        |
| `foodColors`          | Типы еды (breakfast, lunch, dinner, snack)                                                             |
| `recipeColors`        | Типы рецептов + метаданные (rating, calories, protein, etc.)                                           |
| `bookStatusColors`    | Статусы книг (reading, completed, planned, paused)                                                     |
| `priorityColors`      | Приоритеты (low, medium, high, urgent)                                                                 |
| `itemColors`          | Типы items (vitamin, medicine, herb, cosmetic, product)                                                |
| `habitStatusColors`   | Статусы привычек (completed, skipped, active, weekend)                                                 |
| `contentTypeColors`   | Типы контента                                                                                          |
| `waterDrinkColors`    | Типы напитков (water, tea, coffee, other)                                                              |
| `logTypeColors`       | Типы логов для иконок                                                                                  |
| `templateTypeColors`  | Типы шаблонов                                                                                          |
| `moodLevelColors`     | Уровни энергии и стресса                                                                               |
| `progressColors`      | Стадии прогресса (not-started, in-progress, complete)                                                  |
| `analyticsColors`     | Цвета для графиков                                                                                     |
| `bmiColors`           | Категории BMI (underweight, normal, overweight, obese)                                                 |
| `tagColors`           | 16 цветовых вариантов для тегов                                                                        |
| `reminderTypeColors`  | Типы напоминаний                                                                                       |
| `statusColors`        | Статусные цвета (success, error, warning, info, syncing)                                               |
| `streakColors`        | Стрики (trophy, flame, ranking badges, gradient)                                                       |
| `statColors`          | Статистика                                                                                             |
| `uiColors`            | UI действия (favorite, delete, success)                                                                |
| `bookColors`          | Статистика книг                                                                                        |
| `bodyColors`          | Модуль тела/веса                                                                                       |
| `reminderStatsColors` | Статистика напоминаний                                                                                 |
| `sleepColors`         | Качество сна (5 уровней)                                                                               |
| `moodColors`          | Настроения (5 уровней)                                                                                 |
| `sleepQualityColors`  | Кнопки качества сна                                                                                    |

**Преимущества:**

- 100% OKLCH консистентность
- TypeScript типы для безопасности
- Легкая темизация и dark mode
- DRY принцип
- Централизованное управление цветами

## Паттерны проектирования

### Repository Pattern (Database Layer)

```typescript
// lib/db/index.ts
export async function createEntity<T>(table, data)
export async function updateEntity<T>(table, id, data)
export async function deleteEntity<T>(table, id)
export async function getEntityById<T>(table, id)
```

### State Management Pattern

```typescript
// Zustand с persist
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // state & actions
    }),
    { name: "life-os-settings" }
  )
)
```

### Compound Components (UI)

```typescript
// Card компонент
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Cache Pattern

```typescript
// Кэширование с TTL
const cache = new Map<string, { data: unknown; timestamp: number }>()
const DEFAULT_TTL = 5 * 60 * 1000 // 5 минут

// Автоматическая инвалидиция по истечении TTL
if (Date.now() - cached.timestamp >= ttl) {
  cache.delete(key)
}
```

## Отношения компонентов

### Layout иерархия

```
AppLayout
├── Header
│   ├── Theme Toggle
│   └── Menu
├── Main Content
│   └── Page Component
├── FAB (плавающая кнопка)
└── BottomNav
    ├── Dashboard
    ├── Logs
    ├── Items
    ├── Content
    └── Settings
```

### FAB компонент

```
FAB
├── Backdrop (when open)
├── Action Grid (when open)
│   ├── Еда → /logs/food/new
│   ├── Тренировка → /logs/workout/new
│   ├── Финансы → /logs/finance/new
│   ├── Вода → /water
│   ├── Сон → /sleep
│   ├── Настроение → /mood
│   ├── Книга → /books/new
│   ├── Рецепт → /recipes/new
│   └── ... (все используют moduleColors)
└── Main Button (+ / ×)
```

### ModuleCard компоненты

```
ModuleCard
├── ModuleCard — полная карточка с иконкой, заголовком, подзаголовком
├── ModuleCardCompact — компактная карточка для сетки
├── ModuleListItem — элемент списка
└── ModuleBadge — бейдж с цветовой схемой модуля
```

## Критические пути реализации

### Путь создания записи

1. User нажимает FAB (+)
2. Открывается Dialog/Переход на страницу new
3. Заполняется форма
4. Валидация (Zod)
5. Сохранение в Dexie
6. Инвалидация кэша
7. Редирект на список

### Путь синхронизации

1. Network status change → online
2. Проверка SyncQueue (synced: false)
3. Отправка на сервер
4. Mark synced: true
5. UI update (pending count)

## Повторяющиеся шаблоны

### Список страниц с кэшированием

```typescript
// Паттерн страницы списка с оптимизацией
export default function ListPage() {
  const { data, isLoading, refetch } = useCachedData("logs", fetchLogs)

  return (
    <AppLayout title="Title">
      {/* Search */}
      {/* Filters */}
      {isLoading ? (
        <Skeleton />
      ) : data && data.length > 100 ? (
        <VirtualList items={data} renderItem={renderItem} />
      ) : (
        <SimpleList items={data} />
      )}
      <FAB />
    </AppLayout>
  )
}
```

### Карточка сущности

```typescript
<Card className="hover:bg-accent">
  <CardContent className="p-4 flex items-center gap-4">
    <Icon />
    <div className="flex-1">
      <Title />
      <Description />
    </div>
    <Badge />
  </CardContent>
</Card>
```

### Форма с автоподсчётом

```typescript
// Паттерн формы с вычисляемыми полями
<Card>
  <CardHeader>
    <CardTitle>Расчётные данные</CardTitle>
    <Button onClick={calculate}>Рассчитать</Button>
  </CardHeader>
  <CardContent>
    <Grid>
      <Input label="Ккал" />
      <Input label="Белки" />
      ...
    </Grid>
  </CardContent>
</Card>
```

## Интеграции

### Dexie ↔ React

```typescript
// Чтение данных с кэшированием
const { data } = useCachedData("logs", () => db.logs.toArray())

// Или напрямую для простых случаев
useEffect(() => {
  async function loadData() {
    const data = await db.logs.toArray()
    setData(data)
  }
  loadData()
}, [])
```

### Zustand ↔ localStorage

```typescript
// Автоматическое сохранение через persist middleware
persist(store, { name: "life-os-settings" })
```

### Virtual List ↔ Data

```typescript
// Виртуализация для больших списков
<VirtualList
  items={logs}
  renderItem={(log, i) => <LogCard key={log.id} log={log} />}
  estimateSize={72}
  overscan={5}
/>
```

## Color Refactoring Pattern

**Проблема:** Hardcoded цвета (`text-red-500`, `bg-blue-500`, `#ff0000`) в 151+ местах

**Решение:** Централизованная система с OKLCH

```typescript
// До (hardcoded)
<div className="text-red-500 bg-blue-500" />

// После (theme colors)
import { statusColors, moduleColors } from "@/lib/theme-colors"
<div className={`${statusColors.error.icon} ${moduleColors.workout.DEFAULT}`} />
```

**Структура цветовой группы:**

```typescript
interface ColorScheme {
  light: string // light variant (e.g., bg-[oklch(0.88_0.22_68)])
  DEFAULT: string // main color (e.g., bg-[oklch(0.76_0.28_68)])
  text: string // text color (e.g., text-[oklch(0.88_0.22_68)])
  border: string // border color (e.g., border-[oklch(0.76_0.28_68)/0.45])
  shadow?: string // optional shadow
}
```

**Принципы:**

- Все цвета в OKLCH пространстве
- Единая структура для всех групп
- TypeScript типы для безопасности
- Импорт только нужных цветов
- Сохранение визуальной идентичности
