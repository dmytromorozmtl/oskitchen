/**
 * Pilot menu → margin report spot-check math (Era 17 Workstream G Cycle 31).
 * Mirrors costing-service profitability line fields used by margin_report.
 */

import { allocateOverheadOnPrimeCost } from "@/lib/costing/cost-allocation";
import {
  computeRecipeCostPerOutputUnit,
  foodCostPercent,
  grossMarginPercent,
  type RecipeIngredientLineInput,
} from "@/lib/costing/costing-calculations";

export type PilotMenuRecipeInput = {
  recipeName: string;
  salePrice: number;
  yieldQuantity: number;
  laborMinutes: number;
  laborRatePerMinute: number;
  recipePackagingCost: number;
  packagingRulesCost: number;
  ingredients: RecipeIngredientLineInput[];
  overheadPercentOfPrimeCost?: number;
  enableOverhead?: boolean;
  deliveryCost?: number;
  platformFee?: number;
  paymentFee?: number;
};

export type PilotMarginReportRow = {
  recipeName: string;
  /** Matches margin_report column — profitabilityLine.totalCost (not ingredient-only). */
  foodCost: number;
  sellingPrice: number;
  foodCostPct: number;
  marginPct: number;
  ingredientCostPerUnit: number;
  primeCostPerUnit: number;
  totalCostPerUnit: number;
};

const MONEY_EPSILON = 0.001;
const PERCENT_EPSILON = 0.05;

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Build one margin report row from recipe inputs — same formula chain as costing-service. */
export function buildPilotMarginReportRow(input: PilotMenuRecipeInput): PilotMarginReportRow {
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

  const prime = breakdown.primeCostPerUnit;
  const overhead = allocateOverheadOnPrimeCost(
    prime,
    input.overheadPercentOfPrimeCost ?? 0,
    input.enableOverhead ?? false,
  );
  const totalCost = roundMoney(
    prime +
      overhead +
      (input.deliveryCost ?? 0) +
      (input.platformFee ?? 0) +
      (input.paymentFee ?? 0),
  );
  const grossProfit = input.salePrice - totalCost;
  const fcPct = foodCostPercent(breakdown.ingredientCostPerUnit, input.salePrice);
  const gmPct = grossMarginPercent(grossProfit, input.salePrice);

  return {
    recipeName: input.recipeName,
    foodCost: totalCost,
    sellingPrice: input.salePrice,
    foodCostPct: roundPercent(fcPct),
    marginPct: roundPercent(gmPct),
    ingredientCostPerUnit: roundMoney(breakdown.ingredientCostPerUnit),
    primeCostPerUnit: roundMoney(prime),
    totalCostPerUnit: totalCost,
  };
}

/** Verify margin report row internal consistency (food cost % + gross margin %). */
export function marginReportRowConsistent(row: PilotMarginReportRow): boolean {
  if (row.sellingPrice <= 0) return false;

  const expectedFoodCostPct = roundPercent(
    foodCostPercent(row.ingredientCostPerUnit, row.sellingPrice),
  );
  if (Math.abs(expectedFoodCostPct - row.foodCostPct) > PERCENT_EPSILON) {
    return false;
  }

  const expectedMarginPct = roundPercent(
    grossMarginPercent(row.sellingPrice - row.foodCost, row.sellingPrice),
  );
  if (Math.abs(expectedMarginPct - row.marginPct) > PERCENT_EPSILON) {
    return false;
  }

  if (Math.abs(row.foodCost - row.totalCostPerUnit) > MONEY_EPSILON) {
    return false;
  }

  return true;
}

/** Fixed pilot menu fixture — deterministic recipe → margin math for operator spot check. */
export const PILOT_MENU_SPOTCHECK_FIXTURE: readonly PilotMenuRecipeInput[] = [
  {
    recipeName: "Pilot Chicken Bowl",
    salePrice: 12,
    yieldQuantity: 1,
    laborMinutes: 6,
    laborRatePerMinute: 0.3,
    recipePackagingCost: 0.25,
    packagingRulesCost: 0.15,
    ingredients: [
      { quantity: 0.5, wastePercent: 0, costPerUnit: 2, ingredientId: "chicken", ingredientName: "Chicken" },
      { quantity: 0.25, wastePercent: 10, costPerUnit: 4, ingredientId: "rice", ingredientName: "Rice" },
    ],
    overheadPercentOfPrimeCost: 0.08,
    enableOverhead: true,
    deliveryCost: 0,
    platformFee: 0.36,
    paymentFee: 0.35,
  },
  {
    recipeName: "Pilot Veg Wrap",
    salePrice: 9.5,
    yieldQuantity: 1,
    laborMinutes: 4,
    laborRatePerMinute: 0.3,
    recipePackagingCost: 0.2,
    packagingRulesCost: 0.1,
    ingredients: [
      { quantity: 0.3, wastePercent: 5, costPerUnit: 3, ingredientId: "veg", ingredientName: "Veg mix" },
      { quantity: 0.15, wastePercent: 0, costPerUnit: 2.5, ingredientId: "wrap", ingredientName: "Wrap" },
    ],
    enableOverhead: false,
    platformFee: 0,
    paymentFee: 0.28,
  },
] as const;

export type PilotMenuSpotcheckResult = {
  passed: boolean;
  rows: PilotMarginReportRow[];
  inconsistentRecipes: string[];
};

export function runPilotMenuSpotcheck(
  recipes: readonly PilotMenuRecipeInput[] = PILOT_MENU_SPOTCHECK_FIXTURE,
): PilotMenuSpotcheckResult {
  const rows = recipes.map((recipe) => buildPilotMarginReportRow(recipe));
  const inconsistentRecipes = rows
    .filter((row) => !marginReportRowConsistent(row))
    .map((row) => row.recipeName);

  return {
    passed: inconsistentRecipes.length === 0,
    rows,
    inconsistentRecipes,
  };
}

export function formatPilotMarginReportRow(row: PilotMarginReportRow): string {
  return `${row.recipeName}: sale $${row.sellingPrice.toFixed(2)} · total cost $${row.foodCost.toFixed(2)} · food cost ${row.foodCostPct.toFixed(1)}% · margin ${row.marginPct.toFixed(1)}%`;
}
