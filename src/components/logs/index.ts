export { ComboboxSelect } from "./combobox-select"
export { FoodForm, type FoodFormData, foodSourceTypes, foodProducts } from "./food-form"
export { WorkoutForm, type WorkoutFormData, getSubcategoryLabel, strengthSubcategories, cardioSubcategories, yogaSubcategories, equipmentOptions, goalOptions } from "./workout-form"
export { FinanceForm, type FinanceFormData, financeCategories, suppliers, accountTypeLabels } from "./finance-form"

// Общие константы
export const categoryColors: Record<string, string> = {
  // Питание
  "Завтрак": "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
  "Обед": "data-[state=active]:bg-green-500 data-[state=active]:text-white",
  "Ужин": "data-[state=active]:bg-purple-500 data-[state=active]:text-white",
  "Перекус": "data-[state=active]:bg-cyan-500 data-[state=active]:text-white",
  // Тренировки
  "Силовая": "data-[state=active]:bg-red-500 data-[state=active]:text-white",
  "Кардио": "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
  "Йога": "data-[state=active]:bg-emerald-500 data-[state=active]:text-white",
}

export const financeTypeColors: Record<string, string> = {
  "income": "data-[state=active]:bg-green-500 data-[state=active]:text-white",
  "expense": "data-[state=active]:bg-red-500 data-[state=active]:text-white",
  "transfer": "data-[state=active]:bg-yellow-500 data-[state=active]:text-white",
}

export const typeLabels: Record<string, string> = {
  food: "Питание",
  workout: "Тренировка",
  finance: "Финансы",
}

export const foodCategoryOrder = ["Завтрак", "Обед", "Ужин", "Перекус"]
export const workoutCategoryOrder = ["Силовая", "Кардио", "Йога"]