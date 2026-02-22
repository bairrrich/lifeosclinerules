# 📘 Руководство по разработке приложения учета

**Стек:** Next.js + Tailwind + shadcn/ui
**Принципы:** Offline-first · Mobile-first · Минимализм · Нормализованная БД · Единый стиль интерфейса

---

# 1. 🎯 Цель проекта

Создать единое приложение для учета:

* Питания
* Тренировок
* Витаминов
* Лекарств
* Трав
* Косметики
* Продуктов
* Рецептов
* Книг
* Личных финансов

Приложение должно:

* Работать офлайн
* Иметь одинаковую архитектуру страниц
* Иметь максимально унифицированные поля
* Использовать единый UI-стиль
* Быть mobile-first
* Поддерживать светлую и темную темы
* Использовать нормализованную БД

---

# 2. 🏗 Архитектура проекта

## 2.1 Технологический стек

| Технология            | Назначение                     |
| --------------------- | ------------------------------ |
| Next.js (App Router)  | SSR + SPA                      |
| TailwindCSS           | Стилизация                     |
| shadcn/ui             | UI компоненты (адаптированные) |
| IndexedDB (Dexie)     | Offline-first                  |
| Service Worker        | PWA                            |
| Zustand               | Состояние                      |
| React Hook Form + Zod | Формы                          |
| date-fns              | Даты                           |

---

# 3. 🎨 UI/UX Концепция

## 3.1 Принципы

* Минимализм
* Максимально одинаковые layout
* Карточная система
* Повторяющиеся паттерны
* Одинаковые формы

## 3.2 Цветовая система

Использовать CSS variables + Tailwind theme:

```ts
--background
--foreground
--muted
--card
--border
--primary
--destructive
```

Темы:

* light
* dark

Переключение через class на `<html>`.

---

# 4. 📱 Mobile-first Layout

## 4.1 Структура

```
<AppLayout>
 ├── Header
 ├── Content
 └── BottomNav
```

### BottomNav разделы:

* Dashboard
* Учет
* Каталог
* Аналитика
* Настройки

---

# 5. 📦 Унификация доменов

Все сущности делятся на 3 группы:

---

## 🧾 5.1 Группа A — Учет (Logs)

* Питание
* Тренировки
* Финансы

### Унифицированные поля:

| Поле        | Тип      |
| ----------- | -------- |
| id          | uuid     |
| date        | date     |
| title       | string   |
| category_id | fk       |
| quantity    | number   |
| unit        | string   |
| value       | number   |
| notes       | text     |
| tags        | array    |
| created_at  | datetime |
| updated_at  | datetime |

#### Дополнительные:

**Финансы**

* account_id
* type (income/expense)

**Питание**

* calories
* protein
* fat
* carbs

**Тренировки**

* duration
* intensity
* exercise_id

---

## 💊 5.2 Группа B — Каталог веществ

* Витамины
* Лекарства
* Травы
* Косметика
* Продукты

### Унифицированные поля:

| Поле             | Тип      |
| ---------------- | -------- |
| id               | uuid     |
| name             | string   |
| category         | enum     |
| description      | text     |
| usage            | text     |
| benefits         | text     |
| противопоказания | text     |
| dosage           | text     |
| form             | string   |
| manufacturer     | string   |
| composition      | text     |
| storage          | text     |
| expiration       | date     |
| notes            | text     |
| tags             | array    |
| created_at       | datetime |
| updated_at       | datetime |

Максимально одинаковая структура карточки.

---

## 📚 5.3 Группа C — Контент

* Книги
* Рецепты

### Общая структура (в стиле сайта):

| Поле        | Тип      |
| ----------- | -------- |
| id          | uuid     |
| title       | string   |
| cover       | image    |
| description | text     |
| content     | richtext |
| tags        | array    |
| rating      | number   |
| created_at  | datetime |

#### Книги

* author
* year
* pages
* status (planned/reading/done)

#### Рецепты

* ingredients (json)
* calories
* protein
* fat
* carbs
* cook_time

---

# 6. 🗄 Нормализованная БД

## 6.1 Базовые таблицы

### users

### categories

### tags

### units

### accounts (финансы)

### exercises

---

## 6.2 Таблица logs

```sql
logs
- id
- type (finance, food, workout)
- date
- title
- category_id
- quantity
- unit_id
- value
- metadata (json)
- created_at
- updated_at
```

---

## 6.3 Таблица items

```sql
items
- id
- type (vitamin, medicine, herb, cosmetic, product)
- name
- description
- usage
- benefits
- contraindications
- dosage
- metadata (json)
- created_at
- updated_at
```

---

## 6.4 Таблица content

```sql
content
- id
- type (book, recipe)
- title
- cover
- description
- body
- metadata (json)
```

---

# 7. 🔄 Offline-first

## 7.1 IndexedDB структура

* logs
* items
* content
* categories
* tags
* sync_queue

## 7.2 Sync стратегия

1. Все изменения сохраняются локально
2. Добавляются в sync_queue
3. При появлении сети → отправка
4. Конфликт → last-write-wins

---

# 8. 🧩 Компонентная архитектура

## 8.1 Базовые компоненты (shadcn адаптированные)

* Button
* Card
* Input
* Textarea
* Select
* Badge
* Tabs
* Dialog
* Sheet
* DropdownMenu

⚠ Не использовать дефолтный стиль — только адаптированные theme tokens.

---

## 8.2 Повторяющиеся шаблоны

### 1. List Page

```
Header
Search
Filter
List (Card)
FAB (+)
```

### 2. Detail Page

```
Header
Summary Card
Tabs:
  - Общее
  - Дополнительно
  - История
```

### 3. Form Page

Единый layout:

```
Section
Label
Input
Helper text
Divider
```

---

# 9. 📊 Аналитика

* Графики (Recharts)
* Прогресс по дням
* Финансовая динамика
* Калории по неделям
* Прогресс тренировок

---

# 10. 🔍 Навигация

```
/dashboard
/logs/[type]
/logs/[type]/new
/items/[type]
/content/books
/content/recipes
/analytics
/settings
```

---

# 11. 🧠 Состояние

Zustand stores:

* useThemeStore
* useAuthStore
* useSettingsStore
* useSyncStore

---

# 12. 🛠 Формы

React Hook Form + Zod schema.

Пример унифицированной схемы:

```ts
const baseLogSchema = z.object({
  date: z.date(),
  title: z.string().min(1),
  category_id: z.string(),
  quantity: z.number().optional(),
  value: z.number().optional(),
  notes: z.string().optional(),
})
```

---

# 13. 🎛 Минималистичный стиль

* Без лишних теней
* Rounded-2xl
* Border вместо heavy shadow
* Максимум 2 шрифта
* Отступы 8px grid

---

# 14. 🧩 Одинаковость страниц

## Правило:

* Все списки выглядят одинаково
* Все карточки имеют одинаковый header
* Все формы имеют одинаковую структуру
* Все detail страницы имеют Tabs
* Все категории используют Badge

---

# 15. 🚀 Этапы разработки

1. Инициализация Next.js
2. Настройка Tailwind
3. Интеграция shadcn
4. Настройка темы
5. База IndexedDB
6. CRUD для logs
7. CRUD для items
8. CRUD для content
9. Аналитика
10. PWA
11. Sync сервер

---

# 16. 🧭 Дизайн-философия

> Одно приложение — один стиль — одна логика — одна структура.

Все сущности должны ощущаться частью единой системы.

---

Если нужно, могу дальше написать:

* 📂 структуру папок проекта
* 📐 детальный UI-гайд
* 🗃 ER-диаграмму
* 🔄 схему синхронизации
* 🧩 примеры адаптации shadcn под минимализм
* 🧪 тестовую архитектуру
* 🚀 продакшн-деплой стратегию
