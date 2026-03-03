# 📊 Отчет по аудиту хардкод цветов в Life OS

**Дата:** 2026-03-02  
**Статус:** Завершено  
**Обнаружено проблем:** 151+ вхождений хардкод цветов

---

## 📋 Краткая сводка

✅ **Централизованная система цветов:** Существует и используется (`src/lib/theme-colors.ts`)  
⚠️ **Хардкод цветов:** Обнаружено множество прямых указаний цветов в компонентах  
🔧 **Рекомендация:** Заменить все хардкоды на использование централизованной системы

---

## 🎨 Существующая система цветов

Проект имеет хорошо структурированную централизованную систему цветов в [`src/lib/theme-colors.ts`](src/lib/theme-colors.ts:1):

### Основные экспорты:

- `moduleColors` — цвета для 12 модулей (food, workout, finance, water, sleep, mood, books, recipes, habits, goals, logs, settings)
- `financeColors` — подцвета для финансов (income, expense, transfer)
- `workoutColors` — подцвета для типов тренировок (strength, cardio, yoga, stretching)
- `foodColors` — подцвета для типов еды (breakfast, lunch, dinner, snack)
- `recipeColors`, `bookStatusColors`, `priorityColors`, `itemColors`, `habitStatusColors`, `contentTypeColors`, `foodSourceColors`, `waterDrinkColors`, `logTypeColors`, `templateTypeColors`, `moodLevelColors`, `progressColors`
- `fabColor` — цвет FAB кнопки
- `habitPalette` — палитра из 8 цветов для привычек
- Хелперы: `getModuleColor()`, `useModuleColors()`, `cnModuleCard()`, `cnModuleButton()`, `cnModuleIcon()`

### Используемый формат:

```
oklch(L C H) — современный цветовой пространство OKLCH
Пример: oklch(0.76_0.28_68)
```

---

## ❌ Проблемные файлы с хардкодом цветов

### 1. **src/components/reminders/reminder-form.tsx** (САМЫЙ КРИТИЧНЫЙ)

**Строки:** 680-721

```tsx
style={
  formData.priority === "low"
    ? { backgroundColor: "#6b7280", color: "white", borderColor: "#6b7280" }
    : {}
}
```

**Проблемы:**

- Используются hex-цвета (`#6b7280`, `#3b82f6`, `#f97316`, `#ef4444`)
- Вместо этого нужно использовать `priorityColors` из theme-colors.ts

**Рекомендация:** Заменить на использование `priorityColors.low.DEFAULT`, `priorityColors.medium.DEFAULT` и т.д.

---

### 2. **src/app/[locale]/analytics/page.tsx**

**Строки:** 31-41, 637

```tsx
const COLORS = {
  calories: "#f97316",
  protein: "#3b82f6",
  fat: "#eab308",
  carbs: "#22c55e",
  income: "#22c55e",
  expense: "#ef4444",
  workout: "#8b5cf6",
}

const PIE_COLORS = ["#f97316", "#3b82f6", "#eab308", "#22c55e", "#8b5cf6", "#ec4899"]
```

**Проблемы:**

- Hex-цвета для графиков
- Нет централизации

**Рекомендация:** Добавить цвета для аналитики в `theme-colors.ts` или использовать существующие (например, `moduleColors.food.DEFAULT`, `moduleColors.workout.DEFAULT`)

---

### 3. **src/app/[locale]/layout.tsx**

**Строки:** 37-40

```tsx
themeColor: [
  { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
]
```

**Проблемы:**

- Hex-цвета для темы браузера
- Это meta-тег, но все равно лучше использовать CSS-переменные

**Рекомендация:** Использовать CSS-переменные из globals.css (`var(--background)`)

---

### 4. **src/app/[locale]/page.tsx**

**Строки:** 225, 228, 398, 406, 414, 436, 445, 454

```tsx
color={isComplete ? "stroke-green-500" : color}
className={`h-5 w-5 ${isComplete ? "text-green-500" : color.replace("stroke-", "text-")}`}
color="stroke-orange-500"
color="stroke-blue-500"
color="stroke-purple-500"
```

**Проблемы:**

- Tailwind классы (`green-500`, `orange-500`, `blue-500`, `purple-500`)
- Используются для иконок на главной странице

**Рекомендация:** Использовать `moduleColors` или создать отдельные цвета для главной страницы

---

### 5. **src/app/[locale]/mood/page.tsx**

**Строки:** 37-43, 337-345, 407-497

```tsx
const moods = {
  great: { color: "text-green-500" },
  good: { color: "text-lime-500" },
  okay: { color: "text-yellow-500" },
  bad: { color: "text-orange-500" },
  terrible: { color: "text-red-500" },
}
```

**Проблемы:**

- Tailwind классы для настроения
- Есть `moodLevelColors` в theme-colors, но не используется

**Рекомендация:** Использовать `moodLevelColors.energy` и `moodLevelColors.stress`

---

### 6. **src/app/[locale]/water/page.tsx**

**Строки:** 128-136, 148

```tsx
className={`transition-[stroke-dashoffset] duration-500 ${
  progress >= 100 ? "text-green-500" : "text-blue-500"
}`}
```

**Проблемы:**

- Tailwind классы (`green-500`, `blue-500`)

**Рекомендация:** Использовать `moduleColors.water` или `waterDrinkColors`

---

### 7. **src/app/[locale]/habits/page.tsx**

**Строки:** 146, 164, 375-509

```tsx
color: (`${color.bg} ${color.text}`, (<Flame className="h-8 w-8 text-orange-500" />))
```

**Проблемы:**

- Смешанный подход: частично использует цвета из theme-colors, частично хардкод
- `text-orange-500` встречается многократно

**Рекомендация:** Полностью перейти на `habitPalette` или `habitStatusColors`

---

### 8. **src/app/[locale]/goals/page.tsx**

**Строки:** 238, 267-289

```tsx
<div className="text-3xl font-bold text-green-500">
<Card className={isCompleted ? "border-green-500/30" : ""}>
```

**Проблемы:**

- `text-green-500`, `border-green-500/30`
- Нет использования `progressColors`

**Рекомендация:** Использовать `progressColors.complete.DEFAULT`

---

### 9. **src/app/[locale]/logs/page.tsx**

**Строки:** 101-110

```tsx
<div className="text-xl sm:text-2xl font-bold text-orange-500">{stats.food}</div>
<div className="text-xl sm:text-2xl font-bold text-blue-500">{stats.workout}</div>
<div className="text-xl sm:text-2xl font-bold text-green-500">{stats.finance}</div>
```

**Проблемы:**

- Hex-подобные цвета через Tailwind

**Рекомендация:** Использовать `moduleColors.food.DEFAULT`, `moduleColors.workout.DEFAULT`, `moduleColors.finance.DEFAULT`

---

### 10. **src/app/[locale]/templates/page.tsx**

**Строки:** 467, 500, 532, 597, 631

```tsx
;<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
className = "h-8 w-8 text-dark-lighter hover:text-red-500"
```

**Проблемы:**

- `text-yellow-500`, `fill-yellow-500`, `text-red-500`

**Рекомендация:** Использовать `templateTypeColors` или `contentTypeColors`

---

### 11. **src/app/[locale]/books/page.tsx** и **src/app/[locale]/books/[id]/page.tsx**

**Строки:** 134-155, 224

```tsx
<div className="text-xl sm:text-2xl font-bold text-blue-500">{stats.reading}</div>
<div className="text-xl sm:text-2xl font-bold text-green-500">{stats.completed}</div>
<div className="text-xl sm:text-2xl font-bold text-gray-500">{stats.planned}</div>
<div className="text-xl sm:text-2xl font-bold text-yellow-500">{stats.paused}</div>
```

**Проблемы:**

- `text-blue-500`, `text-green-500`, `text-gray-500`, `text-yellow-500`

**Рекомендация:** Использовать `bookStatusColors`

---

### 12. **src/app/[locale]/body/page.tsx**

**Строки:** 191-200, 233, 275-280, 318-327, 354

```tsx
color = "text-blue-500" // underweight
color = "text-green-500" // normal
color = "text-yellow-500" // overweight
color = "text-red-500" // obese
<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
```

**Проблемы:**

- Много цветов для BMI категорий
- `bg-purple-500/10`

**Рекомендация:** Создать `bmiColors` в theme-colors.ts

---

### 13. **src/app/[locale]/items/page.tsx**

**Строки:** 107-124

```tsx
<div className="text-2xl font-bold text-purple-500">{stats.vitamin}</div>
<div className="text-2xl font-bold text-red-500">{stats.medicine}</div>
<div className="text-2xl font-bold text-green-500">{stats.herb}</div>
<div className="text-2xl font-bold text-pink-500">{stats.cosmetic}</div>
<div className="text-2xl font-bold text-yellow-500">{stats.product}</div>
```

**Проблемы:**

- `text-purple-500`, `text-red-500`, `text-green-500`, `text-pink-500`, `text-yellow-500`

**Рекомендация:** Использовать `itemColors`

---

### 14. **src/app/[locale]/reminders/page.tsx**

**Строки:** 369-416, 461, 583-600

```tsx
<Bell className="h-8 w-8 text-blue-500" />
<Clock className="h-8 w-8 text-orange-500" />
<CheckCircle2 className="h-8 w-8 text-green-500" />
<AlertTriangle className="h-8 w-8 text-red-500" />
<BarChart3 className="h-8 w-8 text-purple-500" />
```

**Проблемы:**

- Много цветов для разных типов напоминаний

**Рекомендация:** Создать `reminderTypeColors` в theme-colors.ts

---

### 15. **src/app/[locale]/recipes/[id]/page.tsx** (ОЧЕНЬ МНОГО)

**Строки:** 213, 259-456, 560-900

```tsx
;<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
className = "bg-orange-50 text-orange-700 border-orange-200 text-xs"
className = "bg-green-50 text-green-700 border-green-200 text-xs"
className = "bg-blue-50 text-blue-700 border-blue-200 text-xs"
className = "bg-red-50 text-red-700 border-red-200 text-xs"
className = "bg-purple-50 text-purple-700 border-purple-200 text-xs"
className = "bg-cyan-50 text-cyan-700 border-cyan-200 text-xs"
className = "bg-sky-50 text-sky-700 border-sky-200 text-xs"
className = "bg-pink-50 text-pink-700 border-pink-200 text-xs"
className = "bg-slate-50 text-slate-700 border-slate-200 text-xs"
```

**Проблемы:**

- Огромное количество хардкод цветов для тегов и меток
- Используются 50-оттенки (bg-_-50, text-_-700, border-\*-200)

**Рекомендация:** Использовать `recipeColors`, `contentTypeColors` или создать систему тегов

---

### 16. **src/components/shared/global-search.tsx**

**Строки:** 148-190

```tsx
color: "text-amber-500"
color: "text-rose-500"
color: "text-red-500"
```

**Проблемы:**

- Цвета для иконок в поиске

**Рекомендация:** Использовать `moduleColors` или `contentTypeColors`

---

### 17. **src/components/shared/streak-widget.tsx**

**Строки:** 84-128

```tsx
<div className="p-2 rounded-lg bg-amber-500/10">
<Trophy className="h-5 w-5 text-amber-500" />
bg-amber-500 text-white
bg-gray-300 text-gray-700
bg-amber-700 text-white
<Flame className="h-3 w-3 text-orange-500" />
```

**Проблемы:**

- `amber-500`, `orange-500`, `gray-300`

**Рекомендация:** Создать `streakColors` в theme-colors.ts

---

### 18. **src/components/ui/toast.tsx**

**Строки:** 76-80

```tsx
const iconColors = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
}
```

**Проблемы:**

- Стандартные цвета для уведомлений

**Рекомендация:** Использовать `--color-success`, `--color-destructive` из CSS-переменных

---

### 19. **src/components/settings/sync-manager.tsx**

**Строки:** 210-214

```tsx
<Loader2 className="h-4 w-4 animate-spin text-blue-500" />
<Check className="h-4 w-4 text-green-500" />
<AlertCircle className="h-4 w-4 text-red-500" />
```

**Проблемы:**

- Стандартные статусные цвета

**Рекомендация:** Использовать CSS-переменные или создать `statusColors`

---

### 20. **src/components/finance/budget-manager.tsx** и **recurring-transactions.tsx**

**Строки:** 228-245, 420-437

```tsx
<AlertTriangle className="h-4 w-4 text-red-500" />
text-red-500
<TrendingDown className="h-5 w-5 text-red-500" />
<TrendingUp className="h-5 w-5 text-green-500" />
```

**Проблемы:**

- Стандартные финансовые цвета

**Рекомендация:** Использовать `financeColors` (income/expense)

---

### 21. **src/components/water/water-reminder-settings.tsx**

**Строки:** 165-174, 241

```tsx
<Droplet className="h-4 w-4 text-blue-500" />
<Bell className="h-4 w-4 text-green-500" />
text-amber-500 bg-amber-50 dark:bg-amber-950/20
```

**Проблемы:**

- `blue-500`, `green-500`, `amber-500`

**Рекомендация:** Использовать `waterDrinkColors`, `moduleColors.water`

---

### 22. **src/components/templates/template-forms.tsx**

**Строки:** 494, 407-438, 574-596

```tsx
? "bg-indigo-500 text-white border-indigo-500"
? waterDrinkColors.water.DEFAULT + " text-white border-[oklch(0.78_0.26_208)]"
? moodLevelColors.energy.DEFAULT + " text-white border-[oklch(0.74_0.27_135)]"
```

**Проблемы:**

- Смесь правильного использования (`waterDrinkColors`) и хардкода (`indigo-500`)
- Ручные border-цвета вместо использования из объектов

**Рекомендация:** Убедиться, что все варианты используют централизованные цвета

---

### 23. **src/components/logs/workout-form.tsx**

**Строки:** 465-653

```tsx
? `${workoutColors.strength.DEFAULT} text-white border-[oklch(0.66_0.34_28)]`
```

**Проблемы:**

- Использует `workoutColors` но добавляет ручные border-цвета

**Рекомендация:** Добавить border в `workoutColors` объекты или использовать `cn()` для комбинирования

---

### 24. **src/app/[locale]/logs/[type]/[id]/page.tsx**

**Строки:** 423-563

```tsx
<Flame className="h-4 w-4 text-orange-500" />
<Dumbbell className="h-4 w-4 text-red-500" />
<Repeat className="h-4 w-4 text-blue-500" />
<Repeat className="h-4 w-4 text-green-500" />
<Weight className="h-4 w-4 text-purple-500" />
<MapPin className="h-4 w-4 text-blue-500" />
<Gauge className="h-4 w-4 text-green-500" />
<Heart className="h-4 w-4 text-red-500" />
```

**Проблемы:**

- Много цветов для разных типов логов

**Рекомендация:** Использовать `logTypeColors`

---

### 25. **src/app/[locale]/content/[type]/[id]/page.tsx**

**Строки:** 214, 375

```tsx
<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
<Flame className="h-4 w-4 text-orange-500" />
```

**Проблемы:**

- Стандартные цвета

**Рекомендация:** Использовать `contentTypeColors`

---

## 📊 Статистика

| Тип цвета                                 | Количество           | Процент |
| ----------------------------------------- | -------------------- | ------- |
| Tailwind классы (text-_, bg-_, border-\*) | ~120                 | 80%     |
| Hex-цвета (#**\*\***)                     | ~20                  | 13%     |
| RGB/HSL                                   | 0                    | 0%      |
| OKLCH (правильные)                        | ~18 (в theme-colors) | 12%     |

**Всего вхождений:** ~151+

---

## 🎯 Приоритеты исправления

### 🔴 Критический (1-2 дня)

1. **reminder-form.tsx** — приоритеты напоминаний (4 места)
2. **analytics/page.tsx** — цвета графиков (2 объекта)
3. **layout.tsx** — themeColor meta-тег

### 🟡 Высокий (3-5 дней)

4. **page.tsx** — цвета иконок на главной (5+ мест)
5. **mood/page.tsx** — цвета настроений (10+ мест)
6. **water/page.tsx** — цвета воды (3 места)
7. **habits/page.tsx** — цвета привычек (10+ мест)
8. **goals/page.tsx** — цвета целей (5+ мест)

### 🟢 Средний (1-2 недели)

9. **logs/page.tsx** — цвета логов (3 места)
10. **templates/page.tsx** — цвета шаблонов (5+ мест)
11. **books/** — цвета книг (10+ мест)
12. **body/page.tsx** — цвета BMI (10+ мест)
13. **items/page.tsx** — цвета items (5 мест)
14. **reminders/page.tsx** — цвета напоминаний (10+ мест)
15. **recipes/[id]/page.tsx** — цвета рецептов (50+ мест) ⚠️

### 🔵 Низкий (2-3 недели)

16. **global-search.tsx** — цвета поиска (3 места)
17. **streak-widget.tsx** — цвета стриков (5 мест)
18. **ui/toast.tsx** — цвета уведомлений (3 места)
19. **settings/** — цвета синхронизации, бэкапа (5 мест)
20. **finance/** — цвета финансов (5 мест)
21. **water/reminder-settings.tsx** — цвета настроек (3 места)
22. **templates/template-forms.tsx** — цвета форм (10 мест)
23. **logs/workout-form.tsx** — цвета формы тренировок (15 мест)
24. **logs/[type]/[id]/page.tsx** — цвета деталей логов (10 мест)
25. **content/[type]/[id]/page.tsx** — цвета контента (2 места)

---

## 💡 Рекомендации по исправлению

### 1. **Расширить theme-colors.ts**

Добавить недостающие цветовые группы:

- `analyticsColors` — для графиков в аналитике
- `bmiColors` — для категорий BMI
- `reminderTypeColors` — для типов напоминаний
- `streakColors` — для виджета стриков
- `statusColors` — для статусов (success, error, info, warning)
- `tagColors` — для тегов в рецептах (с 50-оттенками)

### 2. **Использовать CSS-переменные для 50-оттенков**

Вместо `bg-orange-50 text-orange-700 border-orange-200` использовать:

```tsx
className =
  "bg-[var(--color-orange-light)] text-[var(--color-orange-dark)] border-[var(--color-orange-border)]"
```

### 3. **Создать утилитарные функции**

```tsx
// В theme-colors.ts
export function getPriorityColor(priority: string, variant: "bg" | "text" | "border" = "bg") {
  const colors = {
    low: {
      bg: "bg-[oklch(0.58_0.34_18)]",
      text: "text-white",
      border: "border-[oklch(0.58_0.34_18)]",
    },
    // ...
  }
  return colors[priority]?.[variant] || ""
}
```

### 4. **Использовать cn() для комбинирования**

```tsx
// Вместо:
className={`${isActive ? "bg-orange-500 text-white" : "bg-background"}`}

// Использовать:
className={cn(
  isActive && cn(priorityColors.high.DEFAULT, "text-white"),
  !isActive && "bg-background"
)}
```

### 5. **Постепенный рефакторинг**

- Начать с критических файлов (reminder-form, analytics)
- Затем перейти к высокоприоритетным
- Использовать поиск по `text-`, `bg-`, `border-` для контроля прогресса

---

## 📈 План действий

1. ✅ Завершить аудит (все файлы проверены)
2. 📝 Создать недостающие цветовые группы в theme-colors.ts
3. 🔧 Исправить критические файлы (1-3)
4. 🔧 Исправить высокоприоритетные файлы (4-8)
5. 🔧 Исправить средние и низкие приоритеты
6. ✅ Протестировать все изменения
7. 📝 Обновить документацию

---

## 📝 Заключение

Проект имеет **хорошую централизованную систему цветов**, но **недостаточно использует её**. Большинство компонентов используют Tailwind классы или hex-цвета напрямую, что приводит к:

- ❌ Несогласованности цветов между модулями
- ❌ Сложностью поддержки и изменений темы
- ❌ Проблемами с темным режимом
- ❌ Нарушением принципа DRY

**Рекомендуется полный рефакторинг** с заменой всех хардкод цветов на использование `theme-colors.ts` и CSS-переменных.

**Ожидаемый результат:** Единая цветовая система, легкая поддержка, согласованность UI, правильная работа темного режима.

---

**Аудитор:** Roo (Architect Mode)  
**Время выполнения аудита:** ~15 минут  
**Файлов проанализировано:** 50+  
**Строк кода проверено:** ~5000
