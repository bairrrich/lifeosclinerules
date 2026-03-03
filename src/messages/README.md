# 🌍 Локализация Life OS

## 📁 Структура файлов

Файлы локализации разделены по страницам приложения для удобства поддержки и возможности добавления новых языков.

```
src/messages/
├── en/                    # Английский язык (32 файла)
│   ├── common.json        # Общие UI элементы
│   ├── navigation.json    # Навигационное меню
│   ├── home.json          # Главная страница
│   ├── analytics.json     # Аналитика
│   ├── settings.json      # Настройки
│   ├── books.json         # Книги
│   ├── recipes.json       # Рецепты
│   ├── logs.json          # Логи/Записи
│   ├── habits.json        # Привычки
│   ├── goals.json         # Цели
│   ├── reminders.json     # Напоминания
│   ├── water.json         # Вода
│   ├── sleep.json         # Сон
│   ├── mood.json          # Настроение
│   ├── body.json          # Тело
│   ├── templates.json     # Шаблоны
│   ├── items.json         # Каталог/Вещи
│   ├── content.json       # Контент
│   ├── entities.json      # Справочные данные
│   ├── language.json      # Названия языков
│   ├── onboarding.json    # Онбординг
│   ├── food.json          # Продукты питания
│   ├── fab.json           # Плавающая кнопка
│   ├── finance.json       # Финансы
│   ├── financeCategories.json  # Финансовые категории
│   ├── errors.json        # Ошибки
│   ├── loading.json       # Состояния загрузки
│   ├── confirmations.json # Диалоги подтверждения
│   ├── empty.json         # Пустые состояния
│   ├── globalSearch.json  # Глобальный поиск
│   ├── timePicker.json    # Выбор времени
│   └── workout.json       # Типы тренировок
├── ru/                    # Русский язык (32 файла)
│   └── ... (та же структура)
├── index.ts               # Индексный файл
└── README.md              # Этот файл
```

---

## 🔧 Конфигурация

### Файлы конфигурации

```
src/
├── lib/
│   ├── i18n-constants.ts  # Константы: defaultLocale, locales, Locale
│   └── navigation.ts      # Link, usePathname, useRouter
├── i18n/
│   └── request.ts         # Request-level конфигурация
├── i18n.ts                # Основная конфигурация next-intl
└── middleware.ts          # Middleware для обработки локали
```

### i18n-constants.ts

```typescript
export const defaultLocale = "en" as const
export const locales = ["en", "ru"] as const
export type Locale = (typeof locales)[number]
```

---

## 📝 Использование в коде

### Базовый пример

```typescript
import { useTranslations } from "next-intl"

function MyComponent() {
  const t = useTranslations("common")

  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{t("save")}</button>
      <button>{t("cancel")}</button>
    </div>
  )
}
```

### Несколько пространств имён

```typescript
import { useTranslations } from "next-intl"

function Header() {
  const tCommon = useTranslations("common")
  const tNav = useTranslations("navigation")

  return (
    <header>
      <h1>{tCommon("title")}</h1>
      <nav>
        <Link href="/">{tNav("home")}</Link>
        <Link href="/analytics">{tNav("analytics")}</Link>
      </nav>
    </header>
  )
}
```

### С запасным вариантом (fallback)

```typescript
<span className="sr-only">{t("search") || "Поиск"}</span>
```

### В серверных компонентах

```typescript
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("home")

  return <h1>{t("title")}</h1>
}
```

---

## 📄 Пространства имён и ключи

### common.json - Общие элементы

```typescript
const t = useTranslations("common")

t("title") // "Life OS"
t("save") // "Сохранить"
t("cancel") // "Отмена"
t("delete") // "Удалить"
t("edit") // "Редактировать"
t("add") // "Добавить"
t("search") // "Поиск"
t("loading") // "Загрузка..."
t("noData") // "Нет данных"
t("error") // "Ошибка"
t("success") // "Успешно"
```

### navigation.json - Навигация

```typescript
const t = useTranslations("navigation")

t("home") // "Главная"
t("analytics") // "Аналитика"
t("books") // "Книги"
t("recipes") // "Рецепты"
t("settings") // "Настройки"
```

### home.json - Главная страница

```typescript
const t = useTranslations("home")

t("title") // "Life OS"
t("todayProgress") // "Прогресс на сегодня"
t("quickActionsTitle") // "Быстрые действия"
t("trackers") // "Трекеры"
```

### settings.json - Настройки

```typescript
const t = useTranslations("settings")

t("title") // "Настройки"
t("tabs.general") // "Общие"
t("tabs.logs") // "Учёт"
t("theme.title") // "Тема"
t("language.title") // "Язык"
```

---

## 🌐 Добавление нового языка

### Шаг 1: Создайте папку с языком

```bash
mkdir src/messages/de  # Например, для немецкого
```

### Шаг 2: Скопируйте файлы

```bash
cp src/messages/en/*.json src/messages/de/
```

### Шаг 3: Переведите значения

Отредактируйте каждый файл в `src/messages/de/`, заменив английский текст на немецкий.

### Шаг 4: Добавьте язык в конфигурацию

**src/lib/i18n-constants.ts:**

```typescript
export const locales = ["en", "ru", "de"] as const
```

**src/i18n.ts:** Добавьте импорты для нового языка (автоматически подхватывается)

**src/i18n/request.ts:** Убедитесь, что язык поддерживается

### Шаг 5: Обновите переключатель языков

**src/components/layout/language-switcher.tsx:**

```typescript
<DropdownMenuItem onClick={() => handleLanguageChange("de")}>
  🇩🇪 {t("de")}
</DropdownMenuItem>
```

---

## 📊 Статус локализации

| Язык         | Файлов | Статус    |
| ------------ | ------ | --------- |
| English (en) | 32     | ✅ Полная |
| Russian (ru) | 32     | ✅ Полная |

---

## 🎯 Лучшие практики

### ✅ Делайте

1. **Используйте `useTranslations`** для всего текста в компонентах
2. **Группируйте переводы** по страницам/компонентам
3. **Используйте общие ключи** для одинакового текста
4. **Добавляйте fallback** для критичного UI
5. **Обновляйте оба языка** при добавлении новых ключей

### ❌ Не делайте

1. **Не используйте жёстко закодированный текст** в компонентах
2. **Не дублируйте ключи** в разных файлах
3. **Не переводите ключи**, только значения
4. **Не используйте динамические ключи** без fallback

---

## 🔍 Поиск и исправление проблем

### Компонент не переводится

Проверьте:

1. Импортирован ли `useTranslations`
2. Правильное ли пространство имён
3. Существует ли ключ в файле локализации

### Ошибка "Module not found"

Проверьте:

1. Путь импорта (`@/lib/i18n-constants`)
2. Существует ли файл `src/lib/i18n-constants.ts`
3. Экспортируются ли константы

### Сборка падает с ошибкой локализации

Проверьте:

1. Все ли файлы локализации существуют
2. Правильный ли формат JSON
3. Все ли ключи используются корректно

---

## 📚 Дополнительные ресурсы

- [next-intl документация](https://next-intl-docs.vercel.app)
- [LOCALIZATION.md](../../LOCALIZATION.md) - Основная документация
- [LOCALIZATION-REPORT.md](../../LOCALIZATION-REPORT.md) - Отчёт о локализации

---

## 🛠️ Примеры компонентов

### Header с локализацией

```typescript
"use client"

import { useTranslations } from "next-intl"

export function Header() {
  const t = useTranslations("common")
  const tNav = useTranslations("navigation")

  return (
    <header>
      <h1>{t("title")}</h1>
      <nav>
        <Link href="/">{tNav("home")}</Link>
        <button aria-label={t("search")}>🔍</button>
      </nav>
    </header>
  )
}
```

### Форма с локализацией

```typescript
"use client"

import { useTranslations } from "next-intl"

export function LoginForm() {
  const t = useTranslations("common")

  return (
    <form>
      <label>{t("email")}</label>
      <input type="email" />

      <label>{t("password")}</label>
      <input type="password" />

      <button type="submit">{t("login")}</button>
      <button type="button">{t("cancel")}</button>
    </form>
  )
}
```

### Empty State с локализацией

```typescript
"use client"

import { useTranslations } from "next-intl"

export function EmptyState() {
  const t = useTranslations("empty")

  return (
    <div>
      <h3>{t("noData")}</h3>
      <p>{t("noResults")}</p>
    </div>
  )
}
```

---

**Версия:** 1.0.0  
**Последнее обновление:** 2026-03-04
