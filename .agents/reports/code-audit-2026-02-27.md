# Отчёт аудита кодовой базы Life OS

**Дата:** 27 февраля 2026  
**Версия проекта:** latest (commit e852a24f)

---

## 📊 Общая сводка

| Категория                | Критичность    | Количество проблем |
| ------------------------ | -------------- | ------------------ |
| Barrel Imports           | 🔴 КРИТИЧЕСКАЯ | 62 файла           |
| Accessibility            | 🟡 СРЕДНЯЯ     | ~47+ элементов     |
| "use client" оптимизация | 🟡 СРЕДНЯЯ     | 88 файлов          |
| Form controls            | 🟢 НИЗКАЯ      | Много случаев      |

---

## 🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 1. Barrel Imports из lucide-react

**Проблема:** Использование barrel imports (`import { Icon1, Icon2 } from "lucide-react"`) полностью ломает tree-shaking. Даже если используется одна иконка, в bundle попадает весь пакет.

**Найдено:** 62 файла с таким импортом.

**Примеры проблемного кода:**

```tsx
// ❌ Плохо - ломает tree-shaking
import { Menu, Settings, Plus, X } from "lucide-react"

// ✅ Хорошо - tree-shaking работает
import Menu from "lucide-react/dist/esm/icons/menu"
import Settings from "lucide-react/dist/esm/icons/settings"
```

**Альтернативное решение (рекомендуемое):**

```tsx
// Создать файл src/lib/icons.ts с реэкспортом
export { default as Menu } from "lucide-react/dist/esm/icons/menu"
export { default as Settings } from "lucide-react/dist/esm/icons/settings"
// ... и т.д.

// Использовать в компонентах
import { Menu, Settings } from "@/lib/icons"
```

**Влияние:** Размер bundle может быть уменьшен на 100-300KB после исправления.

---

## 🟡 СРЕДНИЕ ПРОБЛЕМЫ

### 2. Accessibility - Icon-only Buttons

**Проблема:** Кнопки с `size="icon"` должны иметь `aria-label` или `<span className="sr-only">` для screen readers.

**Найдено:** 47 случаев использования `size="icon"`.

**Хороший пример (header.tsx):**

```tsx
<Button variant="ghost" size="icon" onClick={onMenuClick}>
  <Menu className="h-5 w-5" />
  <span className="sr-only">Открыть меню</span> // ✅ Есть скрытый текст
</Button>
```

**Плохие примеры (categories-manager.tsx):**

```tsx
<Button size="icon" variant="ghost" onClick={() => setEditingCategory(category)}>
  <Edit2 className="h-4 w-4" />  // ❌ Нет aria-label или sr-only
</Button>
<Button size="icon" variant="ghost" onClick={() => handleDelete(category.id)}>
  <Trash2 className="h-4 w-4 text-destructive" />  // ❌ Нет aria-label или sr-only
</Button>
```

**Рекомендация:** Добавить `aria-label` ко всем icon-only кнопкам:

```tsx
<Button size="icon" variant="ghost" onClick={...} aria-label="Редактировать">
  <Edit2 className="h-4 w-4" />
</Button>
```

### 3. Form Controls без Label

**Проблема:** Много Input полей с `placeholder`, но без явного `<Label>` или `aria-label`.

**Найдено:** 183 случая использования `placeholder=` в компонентах.

**Примеры:**

```tsx
// ❌ Плохо - только placeholder
<Input placeholder="Название" value={name} onChange={...} />

// ✅ Хорошо - есть Label
<Label htmlFor="name">Название</Label>
<Input id="name" placeholder="Название" value={name} onChange={...} />
```

**Файлы с проблемами:**

- `src/components/settings/categories-manager.tsx`
- `src/components/settings/units-manager.tsx`
- `src/components/recipes/recipe-ingredients.tsx`
- `src/app/habits/page.tsx`
- и многие другие

### 4. "use client" Directive Optimization

**Проблема:** 88 файлов используют `"use client"`. Не все компоненты действительно должны быть клиентскими.

**Рекомендация:** Проверить каждый файл и по возможности:

1. Вынести серверные части в отдельные Server Components
2. Использовать `'use client'` только для компонентов с:
   - useState, useEffect, useContext
   - Event handlers (onClick, onChange и т.д.)
   - Browser APIs (localStorage, window и т.д.)

---

## 🟢 НИЗКИЕ ПРОБЛЕМЫ

### 5. Интерактивные элементы (div с onClick)

**Проблема:** Есть случаи использования `<div>` или `<span>` с `onClick` вместо `<button>`.

**Найдено в:**

- `src/components/shared/fab.tsx` - backdrop с onClick (допустимо)
- `src/components/shared/global-search.tsx` - overlay с onClick (допустимо)

**Примечание:** Большинство случаев допустимы (overlay/backdrop), но стоит проверить все.

### 6. Semantic HTML

**Хорошая практика наблюдается:**

- Используются `<button>` для действий ✅
- Используются `<a>`/`<Link>` для навигации ✅
- Dialog имеет правильную структуру ✅

---

## 📋 Чек-лист исправлений

### Приоритет 1 (Критично)

- [ ] Создать `src/lib/icons.ts` с реэкспортом иконок
- [ ] Обновить все 62 файла с lucide-react imports

### Приоритет 2 (Важно)

- [ ] Добавить aria-label ко всем icon-only кнопкам (~47 мест)
- [ ] Добавить Label к Input полям без label

### Приоритет 3 (Опционально)

- [ ] Оптимизировать "use client" директивы
- [ ] Провести accessibility аудит с помощью инструмента типа axe-core

---

## 🛠️ Рекомендуемые инструменты

1. **Для barrel imports:**
   - ESLint правило: `import/no-barrel-files`
   - Скрипт для автоматической замены импортов

2. **Для accessibility:**
   - `eslint-plugin-jsx-a11y`
   - `@axe-core/react` для runtime проверок

3. **Для анализа bundle:**
   - `next-bundle-analyzer`
   - `source-map-explorer`

---

## 📈 Ожидаемый эффект от исправлений

| Исправление                     | Эффект                  |
| ------------------------------- | ----------------------- |
| Barrel imports → Direct imports | -100..300KB bundle size |
| Accessibility fixes             | +WCAG 2.1 AA compliance |
| "use client" оптимизация        | -10..50KB client JS     |

---

_Отчёт сгенерирован автоматически на основе анализа кодовой базы._
