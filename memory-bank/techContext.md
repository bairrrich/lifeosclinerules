# 🔧 Tech Context: Life OS

## Технологический стек

### Frontend Framework
| Технология | Версия | Назначение |
|------------|--------|------------|
| Next.js | 16.1.6 | React фреймворк с App Router |
| React | 19.2.3 | UI библиотека |
| TypeScript | 5.x | Типизация |

### Styling
| Технология | Версия | Назначение |
|------------|--------|------------|
| TailwindCSS | 4.x | Utility-first CSS |
| shadcn/ui | latest | UI компоненты |
| Radix UI | various | Headless UI примитивы |
| lucide-react | 0.575.0 | Иконки |

### Data & State
| Технология | Версия | Назначение |
|------------|--------|------------|
| Dexie | 4.3.0 | IndexedDB wrapper |
| Zustand | 5.0.11 | State management |
| React Hook Form | 7.71.2 | Формы |
| Zod | 4.3.6 | Валидация схем |

### Utilities
| Технология | Версия | Назначение |
|------------|--------|------------|
| date-fns | 4.1.0 | Работа с датами |
| recharts | 3.7.0 | Графики |
| clsx | 2.1.1 | Условные классы |
| tailwind-merge | 3.5.0 | Merge Tailwind классов |
| class-variance-authority | 0.7.1 | Варианты компонентов |

## Настройка разработки

### Скрипты package.json

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

### Конфигурационные файлы

| Файл | Назначение |
|------|------------|
| `next.config.ts` | Конфигурация Next.js |
| `tsconfig.json` | Настройки TypeScript |
| `tailwind.config.ts` | Настройки Tailwind (в postcss) |
| `eslint.config.mjs` | Настройки ESLint |
| `components.json` | Конфигурация shadcn/ui |

### Пакетный менеджер

**pnpm** — быстрый и эффективный менеджер пакетов

```bash
pnpm install    # Установка зависимостей
pnpm add <pkg>  # Добавление пакета
pnpm dev        # Запуск разработки
```

## Технические ограничения

### Browser Support
- Современные браузеры с поддержкой IndexedDB
- ES2022+ features
- CSS Grid и Flexbox

### Storage Limits
- IndexedDB: зависит от браузера (обычно ~50MB+)
- localStorage: ~5MB (для настроек)

### Performance Considerations
- React 19 Compiler включен
- Turbopack для разработки
- Dynamic imports для code splitting

## Зависимости

### Production Dependencies

```json
{
  "@hookform/resolvers": "Zod интеграция для форм",
  "@radix-ui/react-*": "Headless UI компоненты",
  "class-variance-authority": "CVA для вариантов",
  "clsx": "Условные классы",
  "date-fns": "Манипуляции с датами",
  "dexie": "IndexedDB ORM",
  "lucide-react": "Иконки",
  "next": "React фреймворк",
  "next-themes": "Переключение тем",
  "react": "UI библиотека",
  "react-dom": "React DOM",
  "react-hook-form": "Формы",
  "recharts": "Графики",
  "tailwind-merge": "Merge классов",
  "zod": "Валидация",
  "zustand": "State management"
}
```

### Dev Dependencies

```json
{
  "@tailwindcss/postcss": "PostCSS для Tailwind 4",
  "@types/*": "TypeScript типы",
  "babel-plugin-react-compiler": "React Compiler",
  "eslint": "Линтер",
  "eslint-config-next": "ESLint для Next.js",
  "tailwindcss": "CSS фреймворк",
  "typescript": "Типизация"
}
```

## Паттерны использования инструментов

### Dexie Database

```typescript
// Определение таблицы
class LifeOSDatabase extends Dexie {
  logs!: EntityTable<Log, 'id'>
  items!: EntityTable<Item, 'id'>
  // ...
}

// Создание записи
await db.logs.add({ ...data, ...createBaseEntity() })

// Запрос по индексу
await db.logs.where('type').equals('food').toArray()
```

### Zustand Store

```typescript
// Создание store с persist
export const useStore = create<State>()(
  persist(
    (set) => ({
      state: initialValue,
      action: (value) => set({ state: value }),
    }),
    { name: 'storage-key' }
  )
)

// Использование в компоненте
const { state, action } = useStore()
```

### React Hook Form + Zod

```typescript
// Схема валидации
const schema = z.object({
  title: z.string().min(1, 'Обязательно'),
  date: z.date(),
})

// Форма
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { title: '', date: new Date() },
})
```

### shadcn/ui Components

```typescript
// Импорт компонента
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Использование с вариантами
<Button variant="default" size="sm">Save</Button>
```

## Пути импорта

Настроены в `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Примеры:
- `@/components/ui/button`
- `@/lib/db`
- `@/types`
- `@/stores`

## Сборка и деплой

### Development
```bash
pnpm dev
# → http://localhost:3000
# → Turbopack для быстрой перезагрузки
```

### Production Build
```bash
pnpm build
# → Создает .next/ директорию
# → Статический экспорт возможен
```

### Production Start
```bash
pnpm start
# → Запускает production сервер
```

## CSS и темизация

### CSS Variables

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --card: 0 0% 100%;
  --border: 214.3 31.8% 91.4%;
  --destructive: 0 84.2% 60.2%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Tailwind Utility Classes

```typescript
// Типичные классы
"rounded-2xl"        // Скругление карточек
"border"             // Границы вместо теней
"hover:bg-accent"    // Hover эффекты
"text-muted-foreground"  // Вторичный текст
"bg-primary/10"      // Полупрозрачный фон