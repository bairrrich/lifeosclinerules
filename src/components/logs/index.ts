import {
  foodTypeColors,
  workoutTypeColors,
  financeTypeColors as financeColors,
} from "@/lib/theme-colors"

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
  Breakfast: foodTypeColors.breakfast,
  Lunch: foodTypeColors.lunch,
  Dinner: foodTypeColors.dinner,
  Snack: foodTypeColors.snack,
  // Workouts
  Strength: workoutTypeColors.strength,
  Cardio: workoutTypeColors.cardio,
  Yoga: workoutTypeColors.yoga,
  Stretching: workoutTypeColors.stretching,
}

export const financeTypeColors: Record<string, string> = {
  income: financeColors.income,
  expense: financeColors.expense,
  transfer: financeColors.transfer,
}

export const typeLabels: Record<string, string> = {
  food: "Nutrition",
  workout: "Workout",
  finance: "Finance",
}

export const foodCategoryOrder = ["Breakfast", "Lunch", "Dinner", "Snack"]
export const workoutCategoryOrder = ["Strength", "Cardio", "Yoga", "Stretching"]
