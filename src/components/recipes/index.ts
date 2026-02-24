export { RecipeIngredients, type IngredientItem } from "./recipe-ingredients"
export { RecipeSteps } from "./recipe-steps"
export { FoodRecipeForm } from "./food-recipe-form"
export { courseTypes, cookingMethods, servingTemperatures, cuisines, dietaryOptions } from "./food-recipe-form"
export { DrinkRecipeForm } from "./drink-recipe-form"
export { drinkTypes, drinkBases } from "./drink-recipe-form"
export { CocktailRecipeForm } from "./cocktail-recipe-form"
export { cocktailMethods, glassTypes, iceTypes, baseSpirits, ibaCategories, cocktailTools, garnishOptions } from "./cocktail-recipe-form"

// Тип рецепта
export const recipeTypeLabels: Record<string, string> = {
  food: "Еда",
  drink: "Напиток",
  cocktail: "Коктейль",
}

export const recipeTypeColors: Record<string, string> = {
  food: "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
  drink: "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
  cocktail: "data-[state=active]:bg-purple-500 data-[state=active]:text-white",
}