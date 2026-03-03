# 🎨 План рефакторинга цветов

## Цель

Заменить все хардкод цветов на централизованную систему из `src/lib/theme-colors.ts`

---

## 📦 Этап 1: Расширение theme-colors.ts

Добавить следующие цветовые группы в конец файла (после `fabColor`):

### 1. analyticsColors

```ts
export const analyticsColors = {
  calories: "oklch(0.76_0.28_68)", // food.DEFAULT
  protein: "oklch(0.70_0.30_218)", // workout.DEFAULT
  fat: "oklch(0.80_0.30_58)", // recipes.DEFAULT
  carbs: "oklch(0.74_0.30_138)", // financeColors.income.DEFAULT
  income: "oklch(0.74_0.30_138)",
  expense: "oklch(0.68_0.36_18)", // financeColors.expense.DEFAULT
  workout: "oklch(0.70_0.32_218)", // workout.DEFAULT
  pie: [
    "oklch(0.76_0.28_68)", // food
    "oklch(0.70_0.30_218)", // workout
    "oklch(0.74_0.30_138)", // income
    "oklch(0.80_0.30_58)", // recipes
    "oklch(0.68_0.34_38)", // goals
    "oklch(0.70_0.26_208)", // water
  ],
}
```

### 2. bmiColors

```ts
export const bmiColors = {
  underweight: {
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    DEFAULT: "bg-blue-500/10",
  },
  normal: {
    text: "text-green-500",
    bg: "bg-green-500/10",
    DEFAULT: "bg-green-500/10",
  },
  overweight: {
    text: "text-yellow-500",
    bg: "bg-yellow-500/10",
    DEFAULT: "bg-yellow-500/10",
  },
  obese: {
    text: "text-red-500",
    bg: "bg-red-500/10",
    DEFAULT: "bg-red-500/10",
  },
}
```

### 3. tagColors (для тегов рецептов)

```ts
export const tagColors = {
  orange: {
    light: "bg-orange-50",
    DEFAULT: "bg-orange-500 text-white",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  green: {
    light: "bg-green-50",
    DEFAULT: "bg-green-500 text-white",
    text: "text-green-700",
    border: "border-green-200",
  },
  blue: {
    light: "bg-blue-50",
    DEFAULT: "bg-blue-500 text-white",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  red: {
    light: "bg-red-50",
    DEFAULT: "bg-red-500 text-white",
    text: "text-red-700",
    border: "border-red-200",
  },
  purple: {
    light: "bg-purple-50",
    DEFAULT: "bg-purple-500 text-white",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  cyan: {
    light: "bg-cyan-50",
    DEFAULT: "bg-cyan-500 text-white",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  sky: {
    light: "bg-sky-50",
    DEFAULT: "bg-sky-500 text-white",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  pink: {
    light: "bg-pink-50",
    DEFAULT: "bg-pink-500 text-white",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  slate: {
    light: "bg-slate-50",
    DEFAULT: "bg-slate-500 text-white",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  amber: {
    light: "bg-amber-50",
    DEFAULT: "bg-amber-500 text-white",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  lime: {
    light: "bg-lime-50",
    DEFAULT: "bg-lime-500 text-white",
    text: "text-lime-700",
    border: "border-lime-200",
  },
  emerald: {
    light: "bg-emerald-50",
    DEFAULT: "bg-emerald-500 text-white",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  violet: {
    light: "bg-violet-50",
    DEFAULT: "bg-violet-500 text-white",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  fuchsia: {
    light: "bg-fuchsia-50",
    DEFAULT: "bg-fuchsia-500 text-white",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
  },
  indigo: {
    light: "bg-indigo-50",
    DEFAULT: "bg-indigo-500 text-white",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  teal: {
    light: "bg-teal-50",
    DEFAULT: "bg-teal-500 text-white",
    text: "text-teal-700",
    border: "border-teal-200",
  },
}
```

### 4. reminderTypeColors

```ts
export const reminderTypeColors = {
  reminder: {
    icon: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  scheduled: {
    icon: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  completed: {
    icon: "text-green-500",
    bg: "bg-green-500/10",
  },
  overdue: {
    icon: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500",
  },
  stats: {
    icon: "text-purple-500",
    bg: "bg-purple-500/10",
  },
}
```

### 5. statusColors

```ts
export const statusColors = {
  success: {
    icon: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500",
  },
  error: {
    icon: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500",
  },
  info: {
    icon: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500",
  },
  warning: {
    icon: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500",
  },
  syncing: {
    icon: "text-blue-500",
    bg: "bg-blue-500/10",
  },
}
```

### 6. streakColors

```ts
export const streakColors = {
  trophy: {
    bg: "bg-amber-500/10",
    icon: "text-amber-500",
  },
  flame: {
    icon: "text-orange-500",
  },
  first: {
    bg: "bg-amber-500 text-white",
  },
  second: {
    bg: "bg-gray-300 text-gray-700",
  },
  third: {
    bg: "bg-amber-700 text-white",
  },
}
```

---

## 🔧 Этап 2: Критические исправления

### 2.1 src/components/reminders/reminder-form.tsx

**Строки 680-721:** Заменить hex-цвета на `priorityColors`

Было:

```tsx
style={
  formData.priority === "low"
    ? { backgroundColor: "#6b7280", color: "white", borderColor: "#6b7280" }
    : {}
}
```

Стало:

```tsx
className={cn(
  formData.priority === "low" && cn(priorityColors.low.DEFAULT, "text-white border-[oklch(0.70_0.23_242)]")
)}
```

Аналогично для medium, high, critical.

---

### 2.2 src/app/[locale]/analytics/page.tsx

**Строки 31-41:** Удалить локальные COLORS и PIE_COLORS, использовать `analyticsColors`

Было:

```tsx
const COLORS = {
  calories: "#f97316",
  protein: "#3b82f6",
  // ...
}
```

Стало:

```tsx
import { analyticsColors } from "@/lib/theme-colors"
// Использовать analyticsColors.calories, analyticsColors.pie
```

**Строка 637:** `fill="#10b981"` → `fill={analyticsColors.income}` или подобрать из палитры

---

### 2.3 src/app/[locale]/layout.tsx

**Строки 37-40:** Заменить hex на CSS-переменные

Было:

```tsx
themeColor: [
  { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
]
```

Стало:

```tsx
themeColor: [
  { media: "(prefers-color-scheme: light)", color: "oklch(98.8% 0.004 220)" }, // --background
  { media: "(prefers-color-scheme: dark)", color: "oklch(11% 0.018 240)" }, // --background (dark)
]
```

---

## 🟡 Этап 3: Высокоприоритетные исправления

### 3.1 src/app/[locale]/page.tsx

**Строки 225-414:** Заменить Tailwind классы на `moduleColors` или `logTypeColors`

Примеры:

- `text-green-500` → `text-[oklch(0.74_0.30_138)]` (или использовать `moduleColors.food.text` если подходит)
- `stroke-orange-500` → `stroke-[oklch(0.76_0.28_68)]`
- `stroke-blue-500` → `stroke-[oklch(0.70_0.30_218)]`
- `stroke-purple-500` → `stroke-[oklch(0.70_0.32_218)]`

---

### 3.2 src/app/[locale]/mood/page.tsx

**Строки 37-43:** Использовать `moodLevelColors`

Было:

```tsx
const moods = {
  great: { color: "text-green-500" },
  good: { color: "text-lime-500" },
  okay: { color: "text-yellow-500" },
  bad: { color: "text-orange-500" },
  terrible: { color: "text-red-500" },
}
```

Стало:

```tsx
const moods = {
  great: { color: moodLevelColors.energy.text.replace("text-", "text-") }, // green
  good: { color: "text-lime-500" }, // можно оставить или добавить в moodLevelColors
  okay: { color: "text-yellow-500" },
  bad: { color: moodLevelColors.stress.text.replace("text-", "text-") }, // orange
  terrible: { color: "text-red-500" },
}
```

**Строки 337-497:** Заменить все `text-green-500`, `text-orange-500`, `text-red-500`, `text-blue-500`, `text-indigo-500` на соответствующие цвета из `moodLevelColors`, `moduleColors.water`, `moduleColors.workout` и т.д.

---

### 3.3 src/app/[locale]/water/page.tsx

**Строки 128-136, 148:** Использовать `moduleColors.water` или `waterDrinkColors`

Было:

```tsx
progress >= 100 ? "text-green-500" : "text-blue-500"
```

Стало:

```tsx
progress >= 100 ? "text-[oklch(0.74_0.30_138)]" : moduleColors.water.text
```

---

### 3.4 src/app/[locale]/habits/page.tsx

**Строки 146, 164, 375-509:** Использовать `habitPalette` и `habitStatusColors`

---

### 3.5 src/app/[locale]/goals/page.tsx

**Строки 238, 267-289:** Использовать `progressColors.complete.DEFAULT`

---

### 3.6 src/app/[locale]/logs/page.tsx

**Строки 101-110:** Использовать `moduleColors.food.DEFAULT`, `moduleColors.workout.DEFAULT`, `moduleColors.finance.DEFAULT`

---

## 🟢 Этап 4: Средние исправления

Остальные файлы из списка аудита, включая:

- templates/page.tsx
- books/_, books/[id]/_
- body/page.tsx
- items/page.tsx
- reminders/page.tsx
- recipes/[id]/page.tsx (самый большой)

---

## 🔵 Этап 5: Оставшиеся файлы

- global-search.tsx
- streak-widget.tsx
- ui/toast.tsx
- settings/\* (sync-manager, backup-manager)
- finance/\* (budget-manager, recurring-transactions)
- water/reminder-settings.tsx
- templates/template-forms.tsx
- logs/workout-form.tsx
- logs/[type]/[id]/page.tsx
- content/[type]/[id]/page.tsx

---

## 📝 Правила замены

1. **Hex-цвета** → соответствующие OKLCH из theme-colors
2. **Tailwind классы** (text-_, bg-_, border-\*) → OKLCH классы или CSS-переменные
3. **50-оттенки** → использовать `tagColors` или созданные light-версии
4. **Стандартные цвета** (green-500, red-500, blue-500) → найти соответствующий модуль или добавить в новую группу
5. **Сохранить консистентность** — использовать одинаковые цвета для одинаковых семантических значений

---

## ✅ Проверка

После каждого этапа:

1. Запустить dev-сервер и проверить UI
2. Убедиться, что цвета выглядят идентично
3. Проверить темный режим
4. Проверить контрастность доступности

---

## 📊 Статистика

- Всего мест для исправления: ~151
- Критических: 3 файла
- Высоких: 6 файлов
- Средних: 6 файлов
- Низких: 10+ файлов

---

## 🎯 Ожидаемый результат

- 100% централизованных цветов
- Единая цветовая система
- Легкая поддержка и темизация
- Правильная работа темного режима
- Соответствие принципам DRY
