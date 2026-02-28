export { RecipeIngredients, type IngredientItem } from "./recipe-ingredients"
export { RecipeSteps } from "./recipe-steps"
export {
  FoodRecipeForm,
  getCourseTypes,
  getCookingMethods,
  getServingTemperatures,
  getCuisines,
  getDietaryOptions,
} from "./food-recipe-form"
export { DrinkRecipeForm, getDrinkTypes, getDrinkBases } from "./drink-recipe-form"
export {
  CocktailRecipeForm,
  getCocktailMethods,
  getGlassTypes,
  getIceTypes,
  getBaseSpirits,
  getIBACategories,
  getCocktailTools,
  getGarnishOptions,
} from "./cocktail-recipe-form"

export const recipeTypeColors: Record<string, string> = {
  food: "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
  drink: "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
  cocktail: "data-[state=active]:bg-purple-500 data-[state=active]:text-white",
}
