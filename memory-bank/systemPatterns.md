# 🏗 System Patterns: Life OS

## Архитектура системы

### Общая структура

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Dashboard
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Глобальные стили
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
- Last-write-wins для конфликтов

```
User Action → Local DB → Sync Queue → Network (when available)
```

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

**Решение**: Три уровня оптимизации

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
```

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
    { name: 'life-os-settings' }
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
│   └── Рецепт → /recipes/new
└── Main Button (+ / ×)
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
persist(store, { name: 'life-os-settings' })
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