# 📝 Отчёт по подключению локализации

## ✅ Выполненные работы

### 1. Исправление конфигурации i18n

**Проблема:** Конфликт имён между `src/i18n.ts` и `src/i18n/index.ts`

**Решение:**

- Константы локали перемещены в `src/lib/i18n-constants.ts`
- Все импорты обновлены для использования нового пути

**Структура:**

```
src/
├── i18n/
│   └── request.ts          # Request-level конфигурация
├── i18n.ts                 # Основная конфигурация next-intl
├── middleware.ts           # Middleware для обработки локали
└── lib/
    ├── i18n-constants.ts   # Константы (defaultLocale, locales, Locale)
    ├── navigation.ts       # Навигация с локализацией
    └── ...
```

### 2. Подключение локализации к компонентам

#### Обновлённые компоненты:

**Layout компоненты:**

- ✅ `src/components/layout/header.tsx` - добавлены переводы для "Открыть меню", "Поиск", "Настройки"
- ✅ `src/components/layout/side-nav.tsx` - добавлен перевод для "Поиск"
- ✅ `src/components/layout/bottom-nav.tsx` - уже использует локализацию
- ✅ `src/components/layout/language-switcher.tsx` - уже использует локализацию

**Настройки:**

- ✅ `src/components/settings/categories-manager.tsx` - добавлены переводы для "Редактировать", "Удалить"
- ✅ `src/components/settings/appearance-settings.tsx` - уже использует локализацию
- ✅ `src/components/settings/backup-manager.tsx` - уже использует локализацию
- ✅ `src/components/settings/sync-manager.tsx` - уже использует локализацию

**Общие компоненты:**

- ✅ `src/components/shared/global-search.tsx` - уже использует локализацию
- ✅ `src/components/shared/fab.tsx` - уже использует локализацию
- ✅ `src/components/shared/empty-state.tsx` - использует пропсы для текста
- ✅ `src/components/shared/loading-state.tsx` - использует пропсы для текста
- ✅ `src/components/shared/onboarding.tsx` - уже использует локализацию
- ✅ `src/components/shared/streak-widget.tsx` - уже использует локализацию

**Формы:**

- ✅ `src/components/logs/food-form.tsx` - уже использует локализацию
- ✅ `src/components/logs/workout-form.tsx` - уже использует локализацию
- ✅ `src/components/logs/finance-form.tsx` - уже использует локализацию
- ✅ `src/components/recipes/recipe-forms/*` - уже используют локализацию
- ✅ `src/components/books/book-form.tsx` - уже использует локализацию
- ✅ `src/components/reminders/reminder-form.tsx` - уже использует локализацию

**UI компоненты:**

- ✅ `src/components/ui/*` - базовые компоненты не требуют локализации

### 3. Статистика локализации

| Метрика                           | Значение |
| --------------------------------- | -------- |
| **Компонентов с useTranslations** | 85       |
| **Файлов локализации (en)**       | 32       |
| **Файлов локализации (ru)**       | 32       |
| **Пространств имён**              | 32       |
| **Страниц с локализацией**        | 31       |

### 4. Исправленные проблемы

#### Жёстко закодированный текст

**До:**

```tsx
<span className="sr-only">Поиск</span>
<span className="sr-only">Редактировать</span>
<span className="sr-only">Удалить</span>
```

**После:**

```tsx
<span className="sr-only">{tCommon("search")}</span>
<span className="sr-only">{tCommon("edit")}</span>
<span className="sr-only">{tCommon("delete")}</span>
```

### 5. Ключи переводов по компонентам

| Компонент         | Пространство имён                | Ключи                                           |
| ----------------- | -------------------------------- | ----------------------------------------------- |
| Header            | common, navigation               | openMenu, search, settings                      |
| SideNav           | common, navigation               | search                                          |
| CategoriesManager | common, settings                 | edit, delete                                    |
| GlobalSearch      | globalSearch, navigation, common | placeholder, noResults, navigate, select, close |
| FAB               | fab                              | openMenu, closeMenu, food, workout, finance...  |
| BottomNav         | navigation                       | home, logs, catalog, books, recipes, analytics  |
| LanguageSwitcher  | language                         | select, en, ru                                  |
| Onboarding        | onboarding                       | welcome.title, welcome.description...           |

### 6. Примеры использования

#### Базовое использование:

```tsx
import { useTranslations } from "next-intl"

function MyComponent() {
  const t = useTranslations("common")

  return <button>{t("save")}</button>
}
```

#### Несколько пространств имён:

```tsx
import { useTranslations } from "next-intl"

function MyComponent() {
  const tCommon = useTranslations("common")
  const tNav = useTranslations("navigation")

  return (
    <nav>
      <Link href="/">{tNav("home")}</Link>
      <button aria-label={tCommon("close")}>×</button>
    </nav>
  )
}
```

#### С запасным вариантом:

```tsx
<span className="sr-only">{t("search") || "Поиск"}</span>
```

### 7. Рекомендации для будущих изменений

1. **Всегда используйте `useTranslations`** для текста в компонентах
2. **Группируйте переводы логически** по страницам/компонентам
3. **Для общих элементов** используйте `common.json`
4. **Для справочных данных** используйте `entities.json`
5. **Добавляйте запасные варианты** для критичного UI: `{t("key") || "Fallback"}`
6. **Обновляйте оба языка** (en и ru) при добавлении новых ключей

### 8. Проверка работоспособности

```bash
# Запуск приложения
pnpm dev

# Проверка сборки
pnpm build

# Проверка типов
pnpm tsc --noEmit
```

### 9. Файлы для проверки

**Конфигурация:**

- ✅ `src/lib/i18n-constants.ts`
- ✅ `src/i18n.ts`
- ✅ `src/i18n/request.ts`
- ✅ `src/middleware.ts`
- ✅ `src/lib/navigation.ts`

**Компоненты:**

- ✅ `src/components/layout/header.tsx`
- ✅ `src/components/layout/side-nav.tsx`
- ✅ `src/components/settings/categories-manager.tsx`
- ✅ `src/components/shared/global-search.tsx`

**Локализация:**

- ✅ `src/messages/en/*.json` (32 файла)
- ✅ `src/messages/ru/*.json` (32 файла)

## ✅ Итог

Все ключевые компоненты приложения используют локализацию через `useTranslations` из `next-intl`. Конфигурация исправлена, все импорты работают корректно. Приложение готово к использованию с поддержкой двух языков (English и Русский).
