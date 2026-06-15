/**
 * Pure helpers for recipe costing engine (Blueprint P2-97).
 */

import {
  computeRecipeCostPerOutputUnit,
  foodCostPercent,
  grossMarginPercent,
  type RecipeIngredientLineInput,
} from "@/lib/costing/costing-calculations";

export type RecipeCostingEngineInput = {
  recipeId: string;
  recipeName: string;
  salePrice: number;
  yieldQuantity: number;
  laborMinutes: number;
  laborRatePerMinute: number;
  recipePackagingCost: number;
  packagingRulesCost: number;
  ingredients: RecipeIngredientLineInput[];
};

export type RecipeIngredientCostLine = {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  wastePercent: number;
  wasteFactor: number;
  costPerUnit: number;
  batchCost: number;
  costPerPortion: number;
};

export type RecipeMarginByItem = {
  recipeId: string;
  recipeName: string;
  salePrice: number;
  portionCost: number;
  grossProfit: number;
  grossMarginPercent: number;
  foodCostPercent: number;
};

export type RecipeCostingEngineItemReport = {
  recipeId: string;
  recipeName: string;
  yieldQuantity: number;
  ingredientLines: RecipeIngredientCostLine[];
  ingredientCostPerPortion: number;
  laborCostPerPortion: number;
  packagingCostPerPortion: number;
  portionCost: number;
  salePrice: number;
  margin: RecipeMarginByItem;
  warnings: string[];
};

export type RecipeCostingEngineReport = {
  itemCount: number;
  avgMarginPercent: number;
  itemsBelowTargetMargin: number;
  targetMarginPercent: number;
  items: RecipeCostingEngineItemReport[];
};

export const RECIPE_COSTING_ENGINE_DEMO_FIXTURE: readonly RecipeCostingEngineInput[] = [
  {
    recipeId: "demo-chicken-bowl",
    recipeName: "Chicken Power Bowl",
    salePrice: 14.5,
    yieldQuantity: 1,
    laborMinutes: 8,
    laborRatePerMinute: 0.32,
    recipePackagingCost: 0.35,
    packagingRulesCost: 0.12,
    ingredients: [
      {
        quantity: 0.45,
        wastePercent: 8,
        costPerUnit: 6.2,
        ingredientId: "chicken-breast",
        ingredientName: "Chicken breast",
      },
      {
        quantity: 0.3,
        wastePercent: 5,
        costPerUnit: 1.8,
        ingredientId: "brown-rice",
        ingredientName: "Brown rice",
      },
      {
        quantity: 0.15,
        wastePercent: 12,
        costPerUnit: 4.5,
        ingredientId: "broccoli",
        ingredientName: "Broccoli",
      },
    ],
  },
  {
    recipeId: "demo-margherita",
    recipeName: "Margherita Flatbread",
    salePrice: 11,
    yieldQuantity: 2,
    laborMinutes: 12,
    laborRatePerMinute: 0.32,
    recipePackagingCost: 0.5,
    packagingRulesCost: 0.2,
    ingredients: [
      {
        quantity: 0.25,
        wastePercent: 3,
        costPerUnit: 3.2,
        ingredientId: "mozzarella",
        ingredientName: "Mozzarella",
      },
      {
        quantity: 0.1,
        wastePercent: 0,
        costPerUnit: 5.5,
        ingredientId: "tomato-sauce",
        ingredientName: "Tomato sauce",
      },
    ],
  },
] as const;

export const RECIPE_COSTING_ENGINE_DEFAULT_TARGET_MARGIN = 60 as const;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

export function buildRecipeIngredientCostLines(
  input: Pick<RecipeCostingEngineInput, "yieldQuantity" | "ingredients">,
): RecipeIngredientCostLine[] {
  const yq = Math.max(input.yieldQuantity, 0.0001);

  return input.ingredients.map((line) => {
    const wasteFactor = 1 + line.wastePercent / 100;
    const batchCost = line.quantity * line.costPerUnit * wasteFactor;
    const costPerPortion = batchCost / yq;

    return {
      ingredientId: line.ingredientId,
      ingredientName: line.ingredientName,
      quantity: line.quantity,
      wastePercent: line.wastePercent,
      wasteFactor: roundMoney(wasteFactor),
      costPerUnit: line.costPerUnit,
      batchCost: roundMoney(batchCost),
      costPerPortion: roundMoney(costPerPortion),
    };
  });
}

export function computePortionCost(
  input: Omit<RecipeCostingEngineInput, "recipeId" | "recipeName" | "salePrice">,
): number {
  const breakdown = computeRecipeCostPerOutputUnit(
    {
      yieldQuantity: input.yieldQuantity,
      laborMinutes: input.laborMinutes,
      recipePackagingCost: input.recipePackagingCost,
      packagingRulesCost: input.packagingRulesCost,
      ingredients: input.ingredients,
    },
    input.laborRatePerMinute,
  );

  return roundMoney(breakdown.primeCostPerUnit);
}

export function computeMarginByItem(
  recipeId: string,
  recipeName: string,
  salePrice: number,
  portionCost: number,
  ingredientCostPerPortion: number,
): RecipeMarginByItem {
  const grossProfit = roundMoney(salePrice - portionCost);

  return {
    recipeId,
    recipeName,
    salePrice,
    portionCost,
    grossProfit,
    grossMarginPercent: roundPercent(grossMarginPercent(grossProfit, salePrice)),
    foodCostPercent: roundPercent(foodCostPercent(ingredientCostPerPortion, salePrice)),
  };
}

export function buildRecipeCostingEngineItemReport(
  input: RecipeCostingEngineInput,
): RecipeCostingEngineItemReport {
  const breakdown = computeRecipeCostPerOutputUnit(
    {
      yieldQuantity: input.yieldQuantity,
      laborMinutes: input.laborMinutes,
      recipePackagingCost: input.recipePackagingCost,
      packagingRulesCost: input.packagingRulesCost,
      ingredients: input.ingredients,
    },
    input.laborRatePerMinute,
  );

  const ingredientLines = buildRecipeIngredientCostLines(input);
  const portionCost = roundMoney(breakdown.primeCostPerUnit);
  const warnings = breakdown.warnings.map((w) => w.message);

  return {
    recipeId: input.recipeId,
    recipeName: input.recipeName,
    yieldQuantity: input.yieldQuantity,
    ingredientLines,
    ingredientCostPerPortion: roundMoney(breakdown.ingredientCostPerUnit),
    laborCostPerPortion: roundMoney(breakdown.laborCostPerUnit),
    packagingCostPerPortion: roundMoney(breakdown.packagingCostPerUnit),
    portionCost,
    salePrice: input.salePrice,
    margin: computeMarginByItem(
      input.recipeId,
      input.recipeName,
      input.salePrice,
      portionCost,
      breakdown.ingredientCostPerUnit,
    ),
    warnings,
  };
}

export function buildRecipeCostingEngineReport(
  recipes: readonly RecipeCostingEngineInput[],
  targetMarginPercent: number = RECIPE_COSTING_ENGINE_DEFAULT_TARGET_MARGIN,
): RecipeCostingEngineReport {
  const items = recipes.map((recipe) => buildRecipeCostingEngineItemReport(recipe));
  const avgMarginPercent =
    items.length > 0
      ? roundPercent(
          items.reduce((sum, item) => sum + item.margin.grossMarginPercent, 0) / items.length,
        )
      : 0;
  const itemsBelowTargetMargin = items.filter(
    (item) => item.margin.grossMarginPercent < targetMarginPercent,
  ).length;

  return {
    itemCount: items.length,
    avgMarginPercent,
    itemsBelowTargetMargin,
    targetMarginPercent,
    items,
  };
}
