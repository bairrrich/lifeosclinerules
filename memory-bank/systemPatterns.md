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
│   └── ui/                # shadcn/ui компоненты
├── lib/
│   ├── utils.ts           # Утилиты
│   └── db/                # Dexie database
├── stores/                # Zustand stores
├── hooks/                 # React hooks
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

## Отношения компонентов

### Layout иерархия

```
AppLayout
├── Header
│   ├── Theme Toggle
│   └── Menu
├── Main Content
│   └── Page Component
└── BottomNav
    ├── Dashboard
    ├── Logs
    ├── Items
    ├── Content
    └── Settings
```

### Форма создания/редактирования

```
AddDialog
├── DialogTrigger (Button +)
├── DialogContent
│   ├── DialogHeader
│   │   └── DialogTitle
│   ├── Form
│   │   ├── FormField(s)
│   │   └── Submit Button
│   └── DialogFooter
└── DialogClose
```

## Критические пути реализации

### Путь создания записи

1. User нажимает FAB (+)
2. Открывается Dialog/Переход на страницу new
3. Заполняется форма
4. Валидация (Zod)
5. Сохранение в Dexie
6. Добавление в SyncQueue
7. Редирект на список

### Путь синхронизации

1. Network status change → online
2. Проверка SyncQueue (synced: false)
3. Отправка на сервер
4. Mark synced: true
5. UI update (pending count)

## Повторяющиеся шаблоны

### Список страниц

```typescript
// Паттерн страницы списка
export default function ListPage() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  return (
    <AppLayout title="Title">
      {/* Search */}
      {/* Filters */}
      {/* List */}
      {/* FAB */}
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

## Интеграции

### Dexie ↔ React

```typescript
// Чтение данных
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