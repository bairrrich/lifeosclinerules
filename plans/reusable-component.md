# Analysis of Reusable Elements in Life OS Application

After analyzing the codebase, I've identified numerous opportunities to increase reusability and reduce code duplication. Here's a comprehensive breakdown:

## 1. FORM COMPONENTS - High Priority

### Common Pattern Identified

All form components ([`BookForm`](src/components/books/book-form.tsx), [`FoodForm`](src/components/logs/food-form.tsx), [`WorkoutForm`](src/components/logs/workout-form.tsx), [`FinanceForm`](src/components/logs/finance-form.tsx), recipe forms, etc.) share:

- Card-based layout with CardHeader/CardContent
- `updateField` helper function for state updates
- Similar validation schemas using Zod
- Localized configuration functions (`get*Config`)

### Recommended Reusable Components

**A. Generic Form Layout Component**

```typescript
// components/shared/form-layout.tsx
interface FormLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}
```

All forms wrap content in identical Card structure.

**B. Reusable Field Wrapper**

```typescript
// components/shared/form-field.tsx
interface FormFieldProps {
  label: string
  htmlFor: string
  children: React.ReactNode
  required?: boolean
  description?: string
}
```

Eliminates repeated `<div className="space-y-2">` patterns.

**C. Array Item Manager (for ingredients, steps, quotes, etc.)**

```typescript
// components/shared/array-manager.tsx
interface ArrayManagerProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  renderItem: (
    item: T,
    index: number,
    onUpdate: (field: string, value: any) => void,
    onRemove: () => void
  ) => React.ReactNode
  onAdd: () => T
  onMove?: (index: number, direction: "up" | "down") => void
  emptyMessage?: string
}
```

Used by: RecipeIngredients, RecipeSteps, BookQuotes, and similar components.

## 2. SETTINGS MANAGERS - High Priority

### Common Pattern

All managers ([`CategoriesManager`](src/components/settings/categories-manager.tsx), [`AccountsManager`](src/components/settings/accounts-manager.tsx), [`UnitsManager`](src/components/settings/units-manager.tsx), etc.) follow identical structure:

- Card with icon + title + description
- List of items with edit/delete actions
- New item form at bottom
- Confirmation dialogs for deletions

### Recommended: Generic CRUD Manager

```typescript
// components/shared/crud-manager.tsx
interface CrudManagerProps<T> {
  title: string
  description: string
  icon: React.ElementType
  items: T[]
  editingItem: T | null
  onEdit: (item: T) => void
  onCreate: (item: T) => Promise<void>
  onUpdate: (id: string, updates: Partial<T>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  renderForm: (item: T | null, onChange: (updates: Partial<T>) => void) => React.ReactNode
  renderItem: (item: T, onEdit: () => void, onDelete: () => void) => React.ReactNode
  getKey: (item: T) => string
}
```

This would replace all 6+ settings managers with a single reusable component.

## 3. CONFIGURATION FUNCTIONS - Medium Priority

### Pattern

Multiple `get*Config` functions exist across components:

- [`getFoodSourceTypes`](src/components/logs/food-form.tsx), [`getFoodProducts`](src/components/logs/food-form.tsx)
- [`getStrengthSubcategories`](src/components/logs/workout-form.tsx), [`getCardioSubcategories`](src/components/logs/workout-form.tsx), etc.
- [`getCourseTypes`](src/components/recipes/food-recipe-form.tsx), [`getCookingMethods`](src/components/recipes/food-recipe-form.tsx), etc.
- [`getReminderTypesConfig`](src/components/reminders/reminder-form.tsx), [`getPriorityConfig`](src/components/reminders/reminder-form.tsx), etc.

### Recommended: Centralized Configuration Registry

```typescript
// lib/configurations.ts
export const configurations = {
  food: {
    sourceTypes: [...],
    products: {...},
    categories: [...]
  },
  workout: {
    strengthSubcategories: {...},
    cardioSubcategories: {...},
    yogaSubcategories: {...}
  },
  recipes: {
    courseTypes: [...],
    cookingMethods: [...],
    cuisines: [...]
  },
  reminders: {
    types: [...],
    priorities: [...],
    advanceOptions: [...]
  }
}
```

Benefits: Single source of truth, easier testing, can be used in both components and non-React code.

## 4. STATS DISPLAY COMPONENTS - Medium Priority

### Pattern

Multiple components display stats in identical card grids:

- [`BooksManager`](src/components/settings/books-manager.tsx)
- [`RecipesManager`](src/components/settings/recipes-manager.tsx)
- [`ItemsManager`](src/components/settings/items-manager.tsx)
- [`DataStats`](src/components/settings/data-stats.tsx)

### Recommended: Generic Stats Grid

```typescript
// components/shared/stats-grid.tsx
interface StatsGridProps {
  title: string
  description?: string
  icon: React.ElementType
  stats: Array<{ value: number | string; label: string; icon?: React.ElementType }>
  columns?: 2 | 3 | 4
}
```

## 5. COMBobox COMPONENTS - Medium Priority

### Pattern

Two similar combobox implementations:

- [`ComboboxSelect`](src/components/logs/combobox-select.tsx) - single select with custom value option
- [`MultiCombobox`](src/components/ui/multi-combobox.tsx) - multi-select with search

### Recommended: Unified Combobox System

```typescript
// components/ui/combobox.tsx
interface ComboboxProps<T> {
  mode: "single" | "multiple"
  options: ComboboxOption[]
  value: T | T[]
  onChange: (value: T | T[]) => void
  allowCustom?: boolean
  searchable?: boolean
  // ... other common props
}
```

Currently, `NativeSelect` is also a select variant - consider if all three can be unified.

## 6. DIALOG PATTERNS - Low Priority

### Pattern

Multiple dialogs with similar structure:

- All use Dialog/DialogContent/DialogHeader/DialogFooter
- Similar button layouts (Cancel + Save/Delete)
- [`FormActions`](src/components/shared/form-actions.tsx) already abstracts button patterns

### Recommended: Dialog Wrapper Component

```typescript
// components/shared/confirmation-dialog.tsx
interface ConfirmationDialogProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onConfirm: () => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}
```

Used for delete confirmations and other simple actions.

## 7. SEARCH/NAVIGATION COMPONENTS - Low Priority

### Pattern

- [`GlobalSearch`](src/components/shared/global-search.tsx) has hardcoded typeConfig and quickActions
- [`BottomNav`](src/components/layout/bottom-nav.tsx) has hardcoded navItems

### Recommended: Configuration-Driven Navigation

Move typeConfig and quickActions to configuration files that can be shared between components.

## 8. LAYOUT COMPONENTS - Already Good

- [`AppLayout`](src/components/layout/app-layout.tsx) is already reusable
- [`Header`](src/components/layout/header.tsx) and [`BottomNav`](src/components/layout/bottom-nav.tsx) are well-abstracted

## 9. UI COMPONENTS - Already Well Abstracted

The existing UI component library (Button, Card, Input, etc.) is properly abstracted using Radix UI primitives and class-variance-authority.

## 10. SHARED UTILITIES - Medium Priority

### Pattern

Multiple components implement similar data fetching patterns:

- [`StreakWidget`](src/components/shared/streak-widget.tsx)
- [`BackupManager`](src/components/settings/backup-manager.tsx)
- Various settings managers

### Recommended: Custom Hooks

Extract data fetching logic into reusable hooks:

```typescript
// hooks/use-entity-list.ts
function useEntityList<T>(
  entity: Entity<T>,
  filter?: Filter<T>
): { data: T[]; isLoading: boolean; error: Error | null }

// hooks/use-stats.ts
function useStats(): Stats
```

## Implementation Priority

1. **CRUD Manager** - Would eliminate 6+ similar components immediately
2. **Array Item Manager** - Used in multiple forms, high impact
3. **Form Layout & Field wrappers** - Used in all forms, reduces boilerplate
4. **Configuration Registry** - Centralizes business logic, improves maintainability
5. **Stats Grid** - Simple but reduces duplication in settings
6. **Unified Combobox** - Medium effort, could be done incrementally
7. **Custom Hooks** - Extract business logic from components

## Additional Observations

- The codebase already has good separation of concerns with index.ts barrel files
- Settings context provides good abstraction for common settings operations
- Zod schemas are duplicated across forms - consider extracting base schemas
- Many components have similar loading/error states that could be abstracted
- The `updateField` pattern appears in multiple forms - could be a custom hook

This analysis provides a roadmap for improving code reusability while maintaining the current architecture.

Теперь у меня достаточно информации для комплексного анализа. Составлю отчёт.

Анализ приложения: переиспользуемые компоненты
На основе анализа кода выявил следующие возможности для создания переиспользуемых компонентов:

📦 Уже существующие переиспользуемые компоненты (хорошо сделано)
Компонент Назначение
ui/\* Базовые UI-компоненты (Button, Input, Card, Dialog и т.д.)
shared/lazy-load.tsx Ленивая загрузка с IntersectionObserver
shared/virtual-list.tsx Виртуализированный список для больших данных
shared/form-actions.tsx Кнопки действий формы (сохранить/удалить/отмена)
shared/error-boundary.tsx Обработка ошибок с UI fallback
hooks/use-cached-data.ts Кэширование данных
hooks/use-async-error.ts Управление асинхронными ошибками
🔍 Выявленные дублирования и возможности для рефакторинга

1. Формы сущностей — выделить общий паттерн
   Проблема: Формы FoodForm, FinanceForm, BookForm, RecipeSteps имеют схожую структуру:

Карточки с заголовками секций
Зависимые выпадающие списки
Теги/мульти-выбор
КБЖУ поля (калории, белки, жиры, углеводы)
Решение: Создать универсальные компоненты:

src/components/shared/forms/
├── form-section.tsx // Карточка-секция формы с заголовком
├── dependent-select.tsx // Зависимые выпадающие списки
├── nutrition-fields.tsx // Поля КБЖУ (calories, protein, fat, carbs)
├── tag-manager.tsx // Управление тегами (добавление/удаление)
├── source-type-selector.tsx // Переключатель типа источника (custom/recipe/product)
└── step-editor.tsx // Редактор шагов (для рецептов, тренировок и т.п.) 2. NutritionFields — вынести КБЖУ поля
Где встречается: food-form.tsx (строки ~974+)

// src/components/shared/forms/nutrition-fields.tsx
interface NutritionFieldsProps {
register: UseFormRegister<any>
errors: Record<string, { message?: string }>
labels?: { calories?: string; protein?: string; fat?: string; carbs?: string }
}

export function NutritionFields({ register, errors, labels }: NutritionFieldsProps) 3. DependentSelect — универсальные зависимые списки
Где встречается: finance-form.tsx (категория → подкатегория → товар), food-form.tsx (категория продукта → продукт)

// src/components/shared/forms/dependent-select.tsx
interface DependentSelectProps {
levels: Array<{
label: string
options: string[]
value: string
onChange: (value: string) => void
placeholder?: string
}>
}

export function DependentSelect({ levels }: DependentSelectProps) 4. TagManager — управление тегами
Где встречается: book-form.tsx (теги книг), потенциально в других местах

// src/components/shared/forms/tag-manager.tsx
interface TagManagerProps {
tags: string[]
onChange: (tags: string[]) => void
placeholder?: string
addPlaceholder?: string
}

export function TagManager({ tags, onChange, placeholder }: TagManagerProps) 5. StepEditor — редактор шагов
Где встречается: recipe-steps.tsx

Может использоваться для:

Шагов рецепта
Шагов тренировки
Чек-листов привычек
// src/components/shared/forms/step-editor.tsx
interface Step<T = { text: string; timer_min?: number }> {
order: number
data: T
}

interface StepEditorProps<T> {
steps: Step<T>[]
onChange: (steps: Step<T>[]) => void
renderStepContent: (step: T, index: number) => React.ReactNode
addStepText?: string
}

export function StepEditor<T>({ steps, onChange, renderStepContent }: StepEditorProps<T>) 6. AccountSelector — выбор финансового аккаунта
Где встречается: finance-form.tsx

// src/components/shared/forms/account-selector.tsx
interface AccountSelectorProps {
accounts: Account[]
value: string
onChange: (id: string) => void
label?: string
excludeId?: string
showBalance?: boolean
}

export function AccountSelector({ accounts, value, onChange }: AccountSelectorProps) 7. SourceTypeSelector — переключатель источника
Где встречается: food-form.tsx (custom/recipe/product)

// src/components/shared/forms/source-type-selector.tsx
interface SourceOption {
value: string
label: string
icon: React.ComponentType
}

interface SourceTypeSelectorProps {
options: SourceOption[]
value: string
onChange: (value: string) => void
}

export function SourceTypeSelector({ options, value, onChange }: SourceTypeSelectorProps) 8. EmptyState — универсальное состояние “пусто”
Где встречается: Виртуальный список, рецепты, другие компоненты

// src/components/shared/empty-state.tsx
interface EmptyStateProps {
icon?: React.ComponentType
title: string
description?: string
action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) 9. LoadingState — состояние загрузки
// src/components/shared/loading-state.tsx
interface LoadingStateProps {
message?: string
size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({ message, size }: LoadingStateProps) 10. DateRangePicker — выбор диапазона дат
Где встречается: Аналитика, фильтры логов, финансы

// src/components/shared/date-range-picker.tsx
interface DateRangePickerProps {
startDate: string
endDate: string
onChange: (start: string, end: string) => void
presets?: Array<{ label: string; start: string; end: string }>
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps)
📊 Сводная таблица рекомендаций
Приоритет Компонент Где использовать Экономия кода
Высокий FormSection Все формы (books, recipes, logs) ~100 строк
Высокий NutritionFields Food, Recipes ~80 строк
Высокий DependentSelect Finance, Food, Items ~120 строк
Средний TagManager Books, Recipes, Logs ~60 строк
Средний StepEditor Recipes, Workouts, Habits ~100 строк
Средний AccountSelector Finance, Transfers ~50 строк
Низкий EmptyState Списки, виджеты ~30 строк
Низкий LoadingState Все async компоненты ~40 строк
Низкий DateRangePicker Analytics, Filters ~70 строк
🏗️ Рекомендуемая структура
src/components/shared/
├── forms/
│ ├── form-section.tsx
│ ├── nutrition-fields.tsx
│ ├── dependent-select.tsx
│ ├── tag-manager.tsx
│ ├── step-editor.tsx
│ ├── account-selector.tsx
│ └── source-type-selector.tsx
├── empty-state.tsx
├── loading-state.tsx
├── date-range-picker.tsx
├── confirm-dialog.tsx
└── index.ts (баррель-экспорт)
💡 Дополнительные рекомендации
Хуки для форм — вынести общую логику форм в hooks/use-form-data.ts
Валидация — создать прешеты схем Zod в lib/validations/
Типы для форм — унифицировать типы данных форм в types/forms.ts
