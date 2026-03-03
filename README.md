# Life OS

Универсальное приложение для управления личной жизнью: книги, рецепты, финансы, привычки, тренировки и многое другое.

## 🚀 Возможности

### 📚 Книги

- Каталог книг с метаданными (авторы, жанры, ISBN, обложки)
- Отслеживание статуса чтения (запланировано, читаю, прочитано, отложено, брошено)
- Рейтинг и прогресс чтения
- Цитаты из книг
- **MultiCombobox для выбора авторов/жанров с возможностью добавления новых**

### 🍳 Рецепты

- Рецепты еды, напитков и коктейлей
- Ингредиенты с КБЖУ
- Пошаговые инструкции
- Категории и сложность

### 💰 Финансы

- Учёт доходов и расходов
- Бюджеты по категориям
- Повторяющиеся транзакции
- Счета и переводы

### 🏋️ Тренировки

- Силовые, кардио, йога
- Метрики: длительность, калории, пульс
- Подкатегории по типу и оборудованию

### 🎯 Привычки и цели

- Ежедневные/еженедельные привычки
- Серии (streaks)
- Цели с прогрессом

### 😴 Трекеры

- Сон с качеством и фазами
- Вода с напоминаниями
- Настроение и энергия
- Измерения тела

### ⏰ Напоминания

- Гибкое расписание
- Приоритеты
- Повторяющиеся события

## 🎨 Дизайн-система

### Централизованная система цветов

Приложение использует единую централизованную систему цветов на основе OKLCH цветового пространства:

- **`theme-colors.ts`** — все цвета определены в одном месте
- **15+ цветовых групп** для разных модулей и состояний:
  - `moduleColors` — 12 модулей (food, workout, finance, water, sleep, mood, books, recipes, habits, goals, logs, settings)
  - `workoutColors`, `foodColors`, `recipeColors`, `bookStatusColors`
  - `priorityColors`, `itemColors`, `habitStatusColors`, `waterDrinkColors`
  - `statusColors`, `streakColors`, `analyticsColors`, `bmiColors`
  - `moodColors`, `sleepColors`, и другие

**Преимущества:**

- ✅ Полная консистентность UI
- ✅ Легкая темизация и dark mode
- ✅ TypeScript типы для безопасности
- ✅ DRY принцип
- ✅ Простота поддержки

**Использование:**

```typescript
import { moduleColors, statusColors } from "@/lib/theme-colors"

// Модульные цвета
<div className={moduleColors.food.DEFAULT}>Еда</div>
<div className={moduleColors.workout.text}>Тренировка</div>

// Статусные цвета
<div className={statusColors.success.icon}>Успех</div>
<div className={statusColors.error.icon}>Ошибка</div>
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

### OKLCH цветовое пространство

Все цвета используют современное OKLCH цветовое пространство для лучшего восприятия и консистентности:

- **L (Lightness)**: 0-1 (светлота)
- **C (Chroma)**: 0.18-0.36 (насыщенность)
- **H (Hue)**: 0-360 (оттенок)

Пример: `oklch(0.76_0.28_68)` — теплый оранжевый для еды

## 🛠 Технологии

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI, Radix UI
- **Database**: IndexedDB (Dexie.js)
- **State**: React Hooks + Zustand
- **PWA**: Progressive Web App
- **Color System**: OKLCH color space with centralized theme

## 📦 Установка

```bash
# Клонировать репозиторий
git clone https://github.com/bairrrich/lifeosclinerules.git
cd lifeosclinerules

# Установить зависимости
pnpm install

# Запустить в режиме разработки
pnpm run dev

# Собрать для продакшена
pnpm run build
```

## 🗂 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── books/             # Книги
│   ├── recipes/           # Рецепты
│   ├── logs/              # Логи (еда, тренировки, финансы)
│   ├── habits/            # Привычки
│   ├── goals/             # Цели
│   ├── reminders/         # Напоминания
│   ├── settings/          # Настройки
│   └── ...
├── components/
│   ├── ui/                # Базовые UI компоненты
│   ├── books/             # Компоненты книг
│   ├── recipes/           # Компоненты рецептов
│   ├── layout/            # Layout компоненты
│   └── shared/            # Общие компоненты
├── lib/
│   ├── theme-colors.ts    # 🎨 Централизованная система цветов
│   └── db/                # IndexedDB (Dexie)
├── hooks/                 # React хуки
├── stores/                # State management
└── types/                 # TypeScript типы
```

## 📱 PWA

Приложение работает как Progressive Web App:

- Офлайн-режим
- Установка на главный экран
- Push-уведомления (для напоминаний)

## 🔧 Основные компоненты

### MultiCombobox

Компонент для множественного выбора с возможностью добавления своих вариантов:

```tsx
<MultiCombobox
  label="Автор(ы)"
  options={authorOptions}
  selectedIds={selectedAuthorIds}
  onChange={handleAuthorsChange}
  placeholder="Выберите авторов..."
  addPlaceholder="Имя нового автора..."
/>
```

## 📝 Лицензия

MIT
