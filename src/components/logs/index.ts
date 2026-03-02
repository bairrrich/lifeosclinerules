// Exports removed: ComboboxSelect has been replaced with universal Combobox
export { FoodForm, type FoodFormData, getFoodSourceTypes, getFoodProducts } from "./food-form"
export {
  WorkoutForm,
  type WorkoutFormData,
  getSubcategoryLabel,
  getStrengthSubcategories,
  getCardioSubcategories,
  getYogaSubcategories,
  getStretchingSubcategories,
  getEquipmentOptions,
  getGoalOptions,
} from "./workout-form"
export { FinanceForm, type FinanceFormData, accountTypeLabels } from "./finance-form"
export {
  financeCategoriesStructure as financeCategories,
  financeSuppliers as suppliers,
} from "@/lib/finance-categories"

// Общие константы
export const categoryColors: Record<string, string> = {
  // Nutrition
  Breakfast: "data-[state=active]:bg-[oklch(0.90_0.055_70)] data-[state=active]:text-white",
  Lunch: "data-[state=active]:bg-[oklch(0.87_0.06_150)] data-[state=active]:text-white",
  Dinner: "data-[state=active]:bg-[oklch(0.68_0.16_330)] data-[state=active]:text-white",
  Snack: "data-[state=active]:bg-[oklch(0.85_0.065_200)] data-[state=active]:text-white",
  // Workouts
  Strength: "data-[state=active]:bg-[oklch(0.82_0.075_25)] data-[state=active]:text-white",
  Cardio: "data-[state=active]:bg-[oklch(0.80_0.065_200)] data-[state=active]:text-white",
  Yoga: "data-[state=active]:bg-[oklch(0.83_0.045_125)] data-[state=active]:text-white",
  Stretching: "data-[state=active]:bg-[oklch(0.89_0.065_320)] data-[state=active]:text-white",
}

export const financeTypeColors: Record<string, string> = {
  income: "data-[state=active]:bg-[oklch(0.87_0.06_150)] data-[state=active]:text-white",
  expense: "data-[state=active]:bg-[oklch(0.82_0.075_25)] data-[state=active]:text-white",
  transfer: "data-[state=active]:bg-[oklch(0.85_0.065_200)] data-[state=active]:text-white",
}

export const typeLabels: Record<string, string> = {
  food: "Nutrition",
  workout: "Workout",
  finance: "Finance",
}

export const foodCategoryOrder = ["Breakfast", "Lunch", "Dinner", "Snack"]
export const workoutCategoryOrder = ["Strength", "Cardio", "Yoga", "Stretching"]
