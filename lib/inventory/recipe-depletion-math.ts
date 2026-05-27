/** Per-sold-unit ingredient usage from a recipe line (yield + waste). */
export function computeRecipeIngredientDepletion(params: {
  soldQuantity: number;
  recipeYieldQuantity: number;
  ingredientQuantity: number;
  wastePercent: number;
}): number {
  const { soldQuantity, recipeYieldQuantity, ingredientQuantity, wastePercent } = params;
  if (recipeYieldQuantity <= 0 || soldQuantity <= 0 || ingredientQuantity <= 0) {
    return 0;
  }
  const perSoldUnit = ingredientQuantity / recipeYieldQuantity;
  const wasteFactor = 1 + wastePercent / 100;
  return soldQuantity * perSoldUnit * wasteFactor;
}
