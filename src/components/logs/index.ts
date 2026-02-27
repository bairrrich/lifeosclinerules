export { ComboboxSelect } from "./combobox-select"
export { FoodForm, type FoodFormData, foodSourceTypes, foodProducts } from "./food-form"
export {
  WorkoutForm,
  type WorkoutFormData,
  getSubcategoryLabel,
  strengthSubcategories,
  cardioSubcategories,
  yogaSubcategories,
  equipmentOptions,
  goalOptions,
} from "./workout-form"
export {
  FinanceForm,
  type FinanceFormData,
  financeCategories,
  suppliers,
  accountTypeLabels,
} from "./finance-form"

// Общие константы
export const categoryColors: Record<string, string> = {
  // Nutrition
  Breakfast: "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
  Lunch: "data-[state=active]:bg-green-500 data-[state=active]:text-white",
  Dinner: "data-[state=active]:bg-purple-500 data-[state=active]:text-white",
  Snack: "data-[state=active]:bg-cyan-500 data-[state=active]:text-white",
  // Workouts
  Strength: "data-[state=active]:bg-red-500 data-[state=active]:text-white",
  Cardio: "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
  Yoga: "data-[state=active]:bg-emerald-500 data-[state=active]:text-white",
}

export const financeTypeColors: Record<string, string> = {
  income: "data-[state=active]:bg-green-500 data-[state=active]:text-white",
  expense: "data-[state=active]:bg-red-500 data-[state=active]:text-white",
  transfer: "data-[state=active]:bg-yellow-500 data-[state=active]:text-white",
}

export const typeLabels: Record<string, string> = {
  food: "Nutrition",
  workout: "Workout",
  finance: "Finance",
}

export const foodCategoryOrder = ["Breakfast", "Lunch", "Dinner", "Snack"]
export const workoutCategoryOrder = ["Strength", "Cardio", "Yoga"]
