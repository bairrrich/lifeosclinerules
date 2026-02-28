# Localization Audit Report

**Date:** 2025-02-28  
**Project:** Life OS  
**Locale Support:** English (en), Russian (ru)

---

## Executive Summary

The application uses Next.js with `next-intl` for internationalization. The i18n setup is properly configured with two locales (en, ru) and message files exist for both languages. However, **several hardcoded strings** were found that need to be localized to achieve full internationalization support.

---

## ✅ What's Working Well

1. **i18n Configuration** - Properly set up with `src/i18n/index.ts` and `src/i18n/request.ts`
2. **Message Files** - Both `en.json` and `ru.json` exist with comprehensive translations
3. **Component Usage** - Most components correctly use `useTranslations()` hook
4. **Page Localization** - All page components properly use translation functions
5. **Navigation & Common Strings** - Most UI text is properly localized

---

## ❌ Critical Localization Issues

### 1. Hardcoded Strings in Components

#### A. Reminder Components

**File:** `src/components/reminders/reminder-form.tsx`

Hardcoded English strings in configuration arrays (lines 15-58):

```typescript
export const reminderTypesConfig: { type: ReminderType; label: string; icon: string }[] = [
  { type: "habit", label: "habit", icon: "🎯" },
  { type: "medicine", label: "medicine", icon: "💊" },
  { type: "water", label: "water", icon: "💧" },
  { type: "workout", label: "workout", icon: "💪" },
  { type: "food", label: "food", icon: "🍽️" },
  { type: "item", label: "item", icon: "📦" },
  { type: "custom", label: "custom", icon: "🔔" },
]

export const priorityConfig: { value: ReminderPriority; label: string; color: string }[] = [
  { value: "low", label: "low", color: "bg-gray-500" },
  { value: "medium", label: "medium", color: "bg-blue-500" },
  { value: "high", label: "high", color: "bg-orange-500" },
  { value: "critical", label: "critical", color: "bg-red-500" },
]

export const advanceOptions = [
  { value: 0, label: "onTime" },
  { value: 5, label: "5minBefore" },
  { value: 10, label: "10minBefore" },
  { value: 15, label: "15minBefore" },
  { value: 30, label: "30minBefore" },
  { value: 60, label: "1hourBefore" },
  { value: 1440, label: "1dayBefore" },
]

const customIntervalUnits = [
  { value: "hours", label: "hours" },
  { value: "days", label: "days" },
  { value: "weeks", label: "weeks" },
  { value: "months", label: "months" },
]

const timeOfDayOptions = [
  { time: "07:00", label: "morning" },
  { time: "12:00", label: "lunch" },
  { time: "18:00", label: "evening" },
  { time: "21:00", label: "bedtime" },
]

const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
```

**Issues:**

- All labels are hardcoded in English
- Day names are hardcoded in Russian only
- These are used in the UI but not passed through translation function

**File:** `src/components/reminders/reminder-card.tsx`

Hardcoded Russian strings (lines 25, 69-92):

```typescript
const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

const getRepeatDisplay = () => {
  switch (repeatType) {
    case "none":
      return "Один раз"
    case "daily":
      return "Каждый день"
    case "weekly":
      if (reminder.days.length === 7) return "Каждый день"
      if (reminder.days.length === 5 && !reminder.days.includes(0) && !reminder.days.includes(6))
        return "По будням"
      if (reminder.days.length === 2 && reminder.days.includes(0) && reminder.days.includes(6))
        return "По выходным"
      return reminder.days.map((d) => dayNames[d]).join(", ")
    case "monthly":
      return `Каждое ${(reminder as any).monthly_day || 1}-е число`
    case "custom":
      const interval = reminder.repeat_interval || 1
      const unit = (reminder as any).custom_unit || "days"
      const unitLabels: Record<string, string> = {
        hours: interval === 1 ? "час" : interval <= 4 ? "часа" : "часов",
        days: interval === 1 ? "день" : interval <= 4 ? "дня" : "дней",
        weeks: interval === 1 ? "неделю" : "недель",
        months: interval === 1 ? "месяц" : interval <= 4 ? "месяца" : "месяцев",
      }
      return `Каждые ${interval} ${unitLabels[unit]}`
    default:
      return reminder.days.map((d) => dayNames[d]).join(", ")
  }
}
```

**Issues:**

- All strings are hardcoded in Russian only
- No translation support for English

---

#### B. Workout Form Component

**File:** `src/components/logs/workout-form.tsx`

Hardcoded English strings in configuration (lines 42-146):

```typescript
export const strengthSubcategories = {
  anatomical: {
    label: "By Anatomy",
    options: [
      { value: "chest", label: "Chest" },
      { value: "back", label: "Back" },
      { value: "legs", label: "Legs" },
      { value: "shoulders", label: "Shoulders" },
      { value: "arms", label: "Arms" },
      { value: "core", label: "Core" },
    ],
  },
  equipment: {
    label: "By Equipment",
    options: [
      { value: "free_weights", label: "Free Weights" },
      { value: "machines", label: "Machines" },
      { value: "bodyweight", label: "Bodyweight" },
      { value: "functional", label: "Functional" },
    ],
  },
}

export const cardioSubcategories = {
  activity: {
    label: "By Activity",
    options: [
      { value: "running", label: "Running" },
      { value: "walking", label: "Walking" },
      { value: "cycling", label: "Cycling" },
      { value: "rowing", label: "Rowing" },
      { value: "jumping", label: "Jumping" },
    ],
  },
  intensity: {
    label: "By Intensity",
    options: [
      { value: "liss", label: "LISS (Low Intensity)" },
      { value: "hiit", label: "HIIT (Interval)" },
      { value: "tabata", label: "Tabata" },
    ],
  },
}

export const yogaSubcategories = {
  style: {
    label: "By Style",
    options: [
      { value: "hatha", label: "Hatha Yoga" },
      { value: "vinyasa", label: "Vinyasa Yoga" },
      { value: "ashtanga", label: "Ashtanga Yoga" },
      { value: "kundalini", label: "Kundalini Yoga" },
      { value: "iyengar", label: "Iyengar Yoga" },
    ],
  },
  goal: {
    label: "By Goal",
    options: [
      { value: "stretching", label: "Stretching / Flexibility" },
      { value: "power", label: "Power Yoga" },
      { value: "relax", label: "Relax / Recovery" },
      { value: "breathing", label: "Breathing & Meditation" },
    ],
  },
  level: {
    label: "By Level",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
}

export const equipmentOptions: Record<string, string[]> = {
  strength: [
    "Barbell",
    "Dumbbells",
    "Kettlebells",
    "Cable Machine",
    "Leverage Machine",
    "Bench",
    "Pull-up Bar",
    "Parallel Bars",
    "Cable Crossover",
    "Smith Machine",
    "Resistance Bands",
    "Medicine Ball",
    "TRX",
    "No Equipment",
  ],
  cardio: [
    "Treadmill",
    "Elliptical",
    "Exercise Bike",
    "Rowing Machine",
    "Jump Rope",
    "Stepper",
    "No Equipment",
  ],
  yoga: ["Mat", "Blocks", "Strap", "Bolster", "Blanket", "Chair", "Wall", "No Equipment"],
}

export const goalOptions: Record<string, { value: string; label: string }[]> = {
  strength: [
    { value: "mass", label: "Mass Gain" },
    { value: "relief", label: "Definition" },
    { value: "strength", label: "Strength" },
    { value: "endurance", label: "Endurance" },
  ],
  cardio: [
    { value: "endurance", label: "Endurance" },
    { value: "fat_loss", label: "Fat Loss" },
    { value: "recovery", label: "Recovery" },
  ],
  yoga: [
    { value: "flexibility", label: "Flexibility" },
    { value: "strength", label: "Strength" },
    { value: "relaxation", label: "Relaxation" },
    { value: "balance", label: "Balance" },
  ],
}
```

**Issues:**

- All labels are hardcoded in English
- These appear in dropdowns and buttons throughout the workout form

---

#### C. Food Form Component

**File:** `src/components/logs/food-form.tsx`

Hardcoded strings (lines 46-50, 63-193):

```typescript
export const foodSourceTypes = [
  { value: "custom", label: "Свой вариант", icon: Edit3 },
  { value: "recipe", label: "Рецепты", icon: ChefHat },
  { value: "product", label: "Продукты", icon: Package },
]

export const foodProducts: Record<string, Record<string, ProductNutrition>> = {
  Молочные: {
    "Молоко 3.2%": { variants: [], calories: 61, protein: 3, fat: 3.2, carbs: 4.7 },
    // ... more products with Russian names
  },
  Мясо: {
    "Говядина вырезка": { variants: [], calories: 170, protein: 20, fat: 9, carbs: 0 },
    // ... more products
  },
  // ... more categories
}
```

**Issues:**

- Food categories and product names are hardcoded in Russian only
- No English translations available
- This is a large dataset that needs full translation

---

#### D. Recipe Components

**File:** `src/components/recipes/food-recipe-form.tsx`

Hardcoded Russian strings (lines 13-59):

```typescript
export const courseTypes: { value: CourseType; label: string }[] = [
  { value: "breakfast", label: "Завтрак" },
  { value: "lunch", label: "Обед" },
  { value: "dinner", label: "Ужин" },
  { value: "soup", label: "Суп" },
  { value: "salad", label: "Салат" },
  { value: "dessert", label: "Десерт" },
  { value: "snack", label: "Перекус" },
  { value: "sauce", label: "Соус" },
  { value: "appetizer", label: "Закуска" },
]

export const cookingMethods: { value: CookingMethod; label: string }[] = [
  { value: "bake", label: "Запекать" },
  { value: "fry", label: "Жарить" },
  { value: "boil", label: "Варить" },
  { value: "steam", label: "На пару" },
  { value: "grill", label: "Гриль" },
  { value: "raw", label: "Без обработки" },
  { value: "stew", label: "Тушить" },
  { value: "roast", label: "Обжаривать" },
]

export const servingTemperatures: { value: ServingTemperature; label: string }[] = [
  { value: "hot", label: "Горячее" },
  { value: "warm", label: "Тёплое" },
  { value: "room", label: "Комнатной температуры" },
  { value: "cold", label: "Холодное" },
]

export const cuisines = [
  "Русская",
  "Итальянская",
  "Французская",
  "Японская",
  "Китайская",
  "Корейская",
  "Тайская",
  "Индийская",
  "Мексиканская",
  "Грузинская",
  "Узбекская",
  "Арабская",
  "Средиземноморская",
  "Американская",
  "Другая",
]

export const dietaryOptions = [
  { value: "vegan", label: "Веган" },
  { value: "vegetarian", label: "Вегетарианское" },
  { value: "gluten-free", label: "Без глютена" },
  { value: "keto", label: "Кето" },
  { value: "low-carb", label: "Низкоуглеводное" },
  { value: "dairy-free", label: "Без молока" },
  { value: "nut-free", label: "Без орехов" },
  { value: "diabetic", label: "Диабетическое" },
]
```

**File:** `src/components/recipes/cocktail-recipe-form.tsx`

Hardcoded Russian strings (lines 15-105):

```typescript
export const cocktailMethods: { value: CocktailMethod; label: string; description: string }[] = [
  { value: "shaken", label: "Шейк", description: "Взбить в шейкере со льдом" },
  { value: "stirred", label: "Стир", description: "Размешать в смесительном стакане" },
  { value: "blended", label: "Бленд", description: "Смешать в блендере" },
  { value: "built", label: "Билд", description: "Собрать прямо в бокале" },
  { value: "muddled", label: "Мадл", description: "Помять ингредиенты мадлером" },
  { value: "layered", label: "Слоями", description: "Уложить слоями" },
]

export const glassTypes: { value: GlassType; label: string }[] = [
  { value: "highball", label: "Хайбол" },
  { value: "lowball", label: "Лоуболл (Рокс)" },
  { value: "martini", label: "Мартини (Коктейльная рюмка)" },
  // ... more
]

export const iceTypes: { value: IceType; label: string }[] = [
  { value: "cubed", label: "Кубики" },
  { value: "crushed", label: "Дроблёный" },
  { value: "sphere", label: "Сфера" },
  { value: "none", label: "Без льда" },
]

export const baseSpirits = [
  "Водка",
  "Джин",
  "Ром белый",
  // ... more
]

export const ibaCategories = [
  "The Unforgettables",
  "Contemporary Classics",
  "New Era Drinks",
  "Текила",
  "Водка",
  // ... more
]

export const garnishOptions = [
  "Лимон",
  "Лайм",
  "Апельсин",
  // ... more
]

export const cocktailTools = [
  "Шейкер",
  "Шейкер Бостон",
  "Джиггер",
  // ... more
]
```

**Issues:**

- All strings are hardcoded in Russian only
- No translation support for English

---

#### E. Book Form Component

**File:** `src/components/books/book-form.tsx`

Hardcoded placeholder text (lines 273, 345):

```typescript
<Input
  id="google_books_id"
  placeholder="ABC123"
  value={data?.google_books_id || ""}
  onChange={(e) => updateField("google_books_id", e.target.value)}
/>

<Input
  id="cover_image_url"
  placeholder="https://example.com/cover.jpg"
  value={data?.cover_image_url || ""}
  onChange={(e) => updateField("cover_image_url", e.target.value)}
/>
```

**File:** `src/components/books/user-book-form.tsx`

Hardcoded date placeholders (lines 13-16):

```typescript
const datePlaceholders: Record<string, string> = {
  ru: "дд.мм.гггг",
  en: "mm/dd/yyyy",
}
```

**Issues:**

- Placeholder text should use translations
- Date placeholders are okay but should be in message files

---

#### F. Shared Form Actions Component

**File:** `src/components/shared/form-actions.tsx`

Hardcoded Russian strings (lines 43-44, 53, 59, 83, 87, 110, 113, 136, 140):

```typescript
saveText = "Сохранить",
deleteText = "Удалить",
// ...
{isDeleting ? "Удаление..." : deleteText}
// ...
Отмена
// ...
{isSaving ? "Сохранение..." : saveText}
// ...
{isSaving ? "Создание..." : saveText}
// ...
{isLoading ? "Удаление..." : "Удалить"}
```

**Issues:**

- All button text is hardcoded in Russian
- Should use `useTranslations()` hook

---

#### G. Quick Mood Dialog

**File:** `src/components/shared/quick-mood-dialog.tsx`

Hardcoded Russian (line 184, 187):

```typescript
<Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
  Отмена
</Button>
<Button onClick={handleSave} disabled={isSaving} className="flex-1">
  {isSaving ? "Сохранение..." : "Сохранить"}
</Button>
```

---

#### H. Budget Manager

**File:** `src/components/finance/budget-manager.tsx`

Hardcoded Russian (lines 281, 283):

```typescript
<Button variant="outline" onClick={resetForm}>
  Отмена
</Button>
<Button onClick={handleAddBudget}>{editingBudget ? "Сохранить" : "Добавить"}</Button>
```

---

#### I. Reminder Card

**File:** `src/components/reminders/reminder-card.tsx`

Hardcoded Russian strings (lines 225, 230, 236, 249):

```typescript
<Badge variant="outline" className="text-xs">
  Назойливый
</Badge>
<Badge variant="destructive" className="text-xs">
  Курс завершён
</Badge>
<Badge variant="default" className="text-xs bg-green-500">
  <CheckCircle2 className="h-3 w-3 mr-1" />
  Выполнено
</Badge>
title={isLimitReached ? "Лимит выполнений достигнут" : "Выполнено"}
```

---

### 2. Storybook Files

**Files in `src/stories/` and `src/components/ui/*.stories.tsx`**

All storybook files contain hardcoded English text for demonstration purposes. While this is acceptable for Storybook (as it's a development tool), it should be noted that these are not localized.

Example: `src/components/ui/Button.stories.tsx` uses "Default", "Destructive", "Outline", etc.

---

### 3. Test Files

**Files: `*.test.tsx`**

Test files contain hardcoded strings which is acceptable for testing purposes.

---

## 📊 Summary of Missing Translations

### Message File Gaps

Based on the hardcoded strings found, the following keys are **missing or incomplete** in the message files:

#### Reminders (`reminders` namespace)

- `types.habit`, `types.medicine`, `types.water`, `types.workout`, `types.food`, `types.item`, `types.custom`
- `priorities.low`, `priorities.medium`, `priorities.high`, `priorities.critical`
- `repeatTypes.onTime`, `repeatTypes.5minBefore`, `repeatTypes.10minBefore`, `repeatTypes.15minBefore`, `repeatTypes.30minBefore`, `repeatTypes.1hourBefore`, `repeatTypes.1dayBefore`
- `customIntervalUnits.hours`, `customIntervalUnits.days`, `customIntervalUnits.weeks`, `customIntervalUnits.months`
- `timeOfDay.morning`, `timeOfDay.lunch`, `timeOfDay.evening`, `timeOfDay.bedtime`
- `dayNames.su`, `dayNames.mo`, `dayNames.tu`, `dayNames.we`, `dayNames.th`, `dayNames.fr`, `dayNames.sa`
- `form.everyDay`, `form.onDays`
- `reminderCard.persistent`, `reminderCard.overdue`, `reminderCard.completed`
- `reminderCard.limitReached`, `reminderCard.completedAction`

#### Workout (`logs.workout` namespace)

- `strengthSubcategories.anatomical`, `strengthSubcategories.equipment`
- `strengthSubcategories.chest`, `strengthSubcategories.back`, `strengthSubcategories.legs`, etc.
- `cardioSubcategories.activity`, `cardioSubcategories.byIntensity`
- `cardioSubcategories.running`, `cardioSubcategories.walking`, etc.
- `yogaSubcategories.style`, `yogaSubcategories.byGoal`, `yogaSubcategories.byLevel`
- `yogaSubcategories.hatha`, `yogaSubcategories.vinyasa`, etc.
- `equipment` - all equipment strings
- `goals` - all goal strings for all categories

#### Food (`logs.food` namespace)

- `sourceTypes.custom`, `sourceTypes.recipe`, `sourceTypes.product`
- All food product categories and product names (large dataset)

#### Recipes (`recipes` namespace)

- `courseTypes` - all meal types
- `cookingMethods` - all cooking methods
- `servingTemperatures` - all temperature options
- `cuisines` - all cuisine names
- `dietaryOptions` - all dietary restrictions
- `difficulties` - all difficulty levels
- `drinkTypes` - all drink types
- `baseSpirits` - all spirit names
- `ibaCategories` - all IBA categories
- `glassTypes` - all glass types
- `iceTypes` - all ice types
- `garnishOptions` - all garnishes
- `tools` - all bar tools

#### Books (`books` namespace)

- Placeholder strings for ISBN, URLs, etc.

#### Common (`common` namespace)

- Various button texts in shared components

---

## 🎯 Recommended Fixes

### Priority 1: Critical (Must Fix)

1. **Reminder Form Configuration**
   - Move all configuration arrays to use translations
   - Create helper function to get localized labels
   - Update `reminder-form.tsx` to use `useTranslations()`

2. **Reminder Card Display**
   - Move `getRepeatDisplay()` logic to use translations
   - Localize all badge text and titles

3. **Workout Form Configuration**
   - Convert all hardcoded strings to use translations
   - Add missing translation keys to message files

4. **Shared Form Actions**
   - Add `useTranslations()` to component
   - Replace all hardcoded text with `t()` calls

### Priority 2: High (Should Fix)

5. **Recipe Forms**
   - Localize all recipe configuration arrays
   - Add extensive translation keys for recipes

6. **Food Form**
   - Localize food product database (major effort)
   - Consider separate localization file for food items

7. **Book Form**
   - Localize placeholder text

### Priority 3: Medium (Nice to Have)

8. **Storybook Files**
   - Optionally add i18n support for storybook development

---

## 🔧 Implementation Strategy

### Phase 1: Message File Updates

1. Add missing translation keys to `en.json` and `ru.json`
2. Organize by namespace (reminders, logs.workout, logs.food, recipes, etc.)

### Phase 2: Component Refactoring

1. For configuration arrays, either:
   - Option A: Store only keys in arrays, use `t()` in render
   - Option B: Create helper function that returns localized arrays
2. For static text in components, add `useTranslations()` and replace with `t()`

### Phase 3: Testing

1. Test both English and Russian locales
2. Verify all text appears correctly
3. Check for missing translation keys

---

## 📝 Example Fix

### Before (reminder-form.tsx):

```typescript
export const reminderTypesConfig: { type: ReminderType; label: string; icon: string }[] = [
  { type: "habit", label: "habit", icon: "🎯" },
  { type: "medicine", label: "medicine", icon: "💊" },
  // ...
]
```

### After:

```typescript
export function getReminderTypesConfig(
  t: UseTranslations
): { type: ReminderType; label: string; icon: string }[] {
  return [
    { type: "habit", label: t("types.habit"), icon: "🎯" },
    { type: "medicine", label: t("types.medicine"), icon: "💊" },
    // ...
  ]
}

// In component:
const t = useTranslations("reminders")
const reminderTypesConfig = getReminderTypesConfig(t)
```

---

## ✨ Conclusion

The application has a solid i18n foundation but requires significant work to achieve full localization. The main effort involves:

1. Adding missing translation keys to message files (~200+ keys)
2. Refactoring components with hardcoded strings (~10-15 components)
3. Translating the food product database (100+ items)

**Estimated Effort:** 2-3 days for a complete fix
