import type { CostingWarningReason, CostingSourceSummary } from "./costing-types";

export type RecipeIngredientLineInput = {
  quantity: number;
  wastePercent: number;
  costPerUnit: number;
  ingredientId: string;
  ingredientName: string;
};

export type RecipeCostBreakdownInput = {
  yieldQuantity: number;
  laborMinutes: number;
  recipePackagingCost: number;
  packagingRulesCost: number;
  ingredients: RecipeIngredientLineInput[];
};

export type RecipeCostBreakdown = {
  ingredientCostPerUnit: number;
  laborCostPerUnit: number;
  packagingCostPerUnit: number;
  primeCostPerUnit: number;
  warnings: CostingWarningReason[];
  source: Pick<CostingSourceSummary, "ingredientCostSource" | "packagingSource">;
};

export function computeRecipeCostPerOutputUnit(
  input: RecipeCostBreakdownInput,
  laborRatePerMinute: number,
): RecipeCostBreakdown {
  const warnings: CostingWarningReason[] = [];
  const yq = Math.max(input.yieldQuantity, 0.0001);

  let ingredientCost = 0;
  for (const li of input.ingredients) {
    const waste = 1 + li.wastePercent / 100;
    const line = (li.quantity / yq) * li.costPerUnit * waste;
    ingredientCost += line;
  }

  if (input.ingredients.length === 0) {
    warnings.push({
      code: "NO_RECIPE_INGREDIENTS",
      message: "Recipe has no ingredient lines — ingredient cost is zero.",
      severity: "warn",
    });
  }

  const laborCost = (input.laborMinutes * laborRatePerMinute) / yq;
  if (input.laborMinutes > 0 && laborRatePerMinute <= 0) {
    warnings.push({
      code: "LABOR_RATE_MISSING",
      message: "Labor minutes are set but labor rate is zero — check labor rates or costing settings.",
      severity: "warn",
    });
  }

  const recipePack = input.recipePackagingCost / yq;
  const rulesPack = input.packagingRulesCost / yq;
  const packagingCost = recipePack + rulesPack;

  let packagingSource: CostingSourceSummary["packagingSource"] = "recipe_field";
  if (rulesPack > 0 && recipePack > 0) packagingSource = "mixed";
  else if (rulesPack > 0) packagingSource = "packaging_rules";

  if (ingredientCost === 0 && input.ingredients.length > 0) {
    warnings.push({
      code: "INGREDIENT_COST_ZERO",
      message: "One or more ingredients have zero cost on the ingredient card.",
      severity: "warn",
    });
  }

  return {
    ingredientCostPerUnit: ingredientCost,
    laborCostPerUnit: laborCost,
    packagingCostPerUnit: packagingCost,
    primeCostPerUnit: ingredientCost + laborCost + packagingCost,
    warnings,
    source: {
      ingredientCostSource: "ingredient_card",
      packagingSource,
    },
  };
}

export function foodCostPercent(ingredientCost: number, salePrice: number): number {
  if (salePrice <= 0) return 0;
  return (ingredientCost / salePrice) * 100;
}

export function grossMarginPercent(grossProfit: number, salePrice: number): number {
  if (salePrice <= 0) return 0;
  return (grossProfit / salePrice) * 100;
}
